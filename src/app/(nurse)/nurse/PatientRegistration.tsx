import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { uploadImageToCloudinary } from "@/lib/cloudinary";
import PatientImageUpload from "@/components/PatientImageUpload";
import PatientVitalSigns from "@/components/PatientVitalSigns";
import PatientPersonalDetails from "@/components/PatientPersonalDetails";
import EmergencyActions, {
  SelectedMedicineType,
} from "@/components/EmergencyActions";

const DEBOUNCE_MS = 400;

const PatientRegistration: React.FC = () => {
  const { data: session } = useSession();

  // 🔥 Unified state
  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
    branch: "",
    section: "",
    age: "",
    temperature: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    weight: "",
    consultationNotes: "",
  });

  const [patientType, setPatientType] = useState<"student" | "others">(
    "student"
  );
  const [visitType, setVisitType] = useState<"normal" | "emergency">("normal");

  const [selectedMedicines, setSelectedMedicines] = useState<
    SelectedMedicineType[]
  >([]);
  const [labTests, setLabTests] = useState<string[]>([]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTimer = useRef<any>(null);
  const foundStudentRef = useRef<any>(null);

  // RESET on type
  const resetForm = () => {
    setForm({
      studentId: "",
      name: "",
      email: "",
      branch: "",
      section: "",
      age: "",
      temperature: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      weight: "",
      consultationNotes: "",
    });

    setSelectedMedicines([]);
    setLabTests([]);
    setImagePreview(null);
    setSelectedImage(null);
    foundStudentRef.current = null;
  };

  useEffect(() => resetForm(), [patientType]);
  useEffect(() => {
    if (visitType === "normal") {
      setSelectedMedicines([]);
      setLabTests([]);
    }
  }, [visitType]);

  // Generic handler
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Student ID handler
  const handleStudentIdChange = (value: string) => {
    const trimmed = value.trim();

    // update ID + auto-email
    setForm((prev) => ({
      ...prev,
      studentId: trimmed,
      email: trimmed
        ? "rr" + trimmed.toLowerCase().slice(1) + "@rguktrkv.ac.in"
        : "",
    }));

    if (!trimmed) return;

    if (fetchTimer.current) clearTimeout(fetchTimer.current);

    fetchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/id_number/${trimmed}`
        );

        if (res.ok) {
          const data = await res.json();
          foundStudentRef.current = data;

          setForm((prev) => ({
            ...prev,
            name: data.name || "",
            email: data.email || prev.email,
            branch: data.branch || "",
            section: data.section || "",
          }));
        } else {
          foundStudentRef.current = null;
          setForm((prev) => ({
            ...prev,
            name: "",
            branch: "",
            section: "",
          }));
        }
      } catch {}
    }, DEBOUNCE_MS);
  };

  // File Handlers
  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const validate = () => {
    const next: any = {};

    if (patientType === "student") {
      if (!form.studentId) next.studentId = "Student ID is required";
    } else {
      if (!form.name.trim()) next.name = "Name is required";
    }

    if (!form.age.trim()) next.age = "Age is required";

    if (visitType === "emergency") {
      const invalidMed = selectedMedicines.find(
        (m) => !m.medicineId || !m.quantity
      );
      if (invalidMed) next.medicines = "Please add valid medicines";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let nurseImageUrl = null;

      if (selectedImage) {
        nurseImageUrl = await uploadImageToCloudinary(selectedImage);
      }

      // STUDENT LOGIC
      let studentIdDb: number | null = null;

      if (patientType === "student") {
        const idLower = form.studentId.toLowerCase();

        if (foundStudentRef.current?.id) {
          studentIdDb = foundStudentRef.current.id;
        } else {
          const check = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/id_number/${idLower}`
          );

          if (check.ok) {
            const st = await check.json();
            studentIdDb = st.id;
          } else {
            // Create student
            const createRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/students`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id_number: idLower,
                  name: form.name,
                  email: form.email,
                  branch: form.branch,
                  section: form.section,
                }),
              }
            );

            const newSt = await createRes.json();
            studentIdDb = newSt.id;
          }
        }
      }

      const bp =
        form.bloodPressureSystolic && form.bloodPressureDiastolic
          ? `${form.bloodPressureSystolic}/${form.bloodPressureDiastolic}`
          : null;

      const payload: any = {
        student_id: studentIdDb,
        other_name: patientType === "others" ? form.name : null,

        nurse_id: session?.user?.id,
        nurse_notes: form.consultationNotes || null,
        weight: form.weight,
        bp,
        age: Number(form.age),
        temperature: form.temperature,
        nurse_image_url: nurseImageUrl,
        patient_type: patientType,
        visit_type: visitType,

        status:
          visitType === "normal"
            ? "Initiated by Nurse"
            : selectedMedicines.length && labTests.length
            ? "Medication Prescribed and Lab Test Requested"
            : selectedMedicines.length
            ? "Medication Prescribed by Nurse (Emergency)"
            : labTests.length
            ? "Lab Test Requested"
            : "Initiated by Nurse",
      };

      if (visitType === "emergency") {
        payload.medicines = selectedMedicines.map((m) => ({
          medicine_id: m.medicineId,
          quantity: m.quantity,
        }));

        payload.lab_tests = labTests;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error creating prescription");

      setSubmitSuccess(true);
      setTimeout(() => {
        resetForm();
        setSubmitSuccess(false);
      }, 1500);
    } catch {
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return submitSuccess ? (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-green-50 p-8 border border-green-200 rounded-xl text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
        <h2 className="text-2xl font-semibold text-green-700">
          Patient Registered Successfully
        </h2>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold flex items-center mb-4">
          <User className="w-6 h-6 mr-2 text-blue-600" />
          Register New Patient
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Type + Visit Type */}
          {/* Patient Type + Visit Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Type
              </label>
              <select
                value={patientType}
                onChange={(e) =>
                  setPatientType(e.target.value as "student" | "others")
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="student">Student</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) =>
                  setVisitType(e.target.value as "normal" | "emergency")
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="normal">Normal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Student ID (Only Students) */}
          {patientType === "student" && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                    errors.studentId ? "border-red-500" : "border-gray-300"
                  }`}
                  value={form.studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="R200137"
                />
              </div>
              {errors.studentId && (
                <p className="text-red-600 text-sm mt-1">{errors.studentId}</p>
              )}
            </div>
          )}

          {/* Patient Details (includes age now) */}
          <PatientPersonalDetails
            patientType={patientType}
            formData={{
              name: form.name,
              email: form.email,
              branch: form.branch,
              section: form.section,
              age: form.age,
            }}
            errors={errors}
            onChange={handleChange}
          />

          {/* Vital Signs */}
          <PatientVitalSigns
            formData={{
              temperature: form.temperature,
              bloodPressureSystolic: form.bloodPressureSystolic,
              bloodPressureDiastolic: form.bloodPressureDiastolic,
              weight: form.weight,
            }}
            errors={errors}
            onChange={handleChange}
          />

          {/* Nurse Notes */}
          <div>
            <label>Initial Assessment Notes</label>
            <textarea
              name="consultationNotes"
              value={form.consultationNotes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Emergency Actions */}
          {visitType === "emergency" && (
            <EmergencyActions
              selectedMedicines={selectedMedicines}
              setSelectedMedicines={setSelectedMedicines}
              labTests={labTests}
              setLabTests={setLabTests}
            />
          )}

          {/* Image */}
          <PatientImageUpload
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={() => {
              setSelectedImage(null);
              setImagePreview(null);
            }}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registering...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Register Patient
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
