import PatientAudioUpload from "@/components/PatientAudioUpload";
import React, { useState, useEffect } from "react";
import PatientImageUpload from "@/components/PatientImageUpload";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import {
  User,
  Calendar,
  Thermometer,
  Activity,
  FileText,
  Plus,
  Save,
  TestTube,
  Pill,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface PatientDetailsProps {
  prescriptionId: string | null;
  setActiveTab: (tab: string) => void;
}

interface StudentType {
  id?: number;
  student_id?: string;
  id_number?: string;
  name?: string;
  email?: string;
  branch?: string;
  section?: string;
}

interface PrescriptionType {
  id?: number | string;
  student_id?: string;
  status?: string;
  notes?: string;
  temperature?: string;
  bp?: string;
  weight?: string;
  created_at?: string;
  nurse_notes?: string;
  age?: number;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

interface SelectedMedicine {
  medicineId: number | "";
  quantity: number;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  prescriptionId,
  setActiveTab,
}) => {
  // Doctor audio upload state
  const [doctorAudioUrl, setDoctorAudioUrl] = useState<string | null>(null);
  // Audio upload handlers
  const handleAudioUpload = (url: string) => {
    setDoctorAudioUrl(url);
  };
  const handleAudioRemove = () => {
    setDoctorAudioUrl(null);
  };
  const [prescription, setPrescription] = useState<PrescriptionType | null>(
    null
  );
  const [student, setStudent] = useState<StudentType | null>(null);
  const { data: session, status } = useSession();
  interface Medicine {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  }
  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    SelectedMedicine[]
  >([]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Doctor image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [doctorImageUrl, setDoctorImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Handle image select/remove
  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDoctorImageUrl(null);
  };

  // Upload image to Cloudinary and set URL
  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setImageUploading(true);
    try {
      const url = await uploadImageToCloudinary(selectedImage);
      setDoctorImageUrl(url);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      alert("Image upload failed.");
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    if (prescriptionId) {
      fetchPrescriptionDetails();
      fetchAvailableMedicines();
    }
  }, [prescriptionId]);

  const fetchPrescriptionDetails = async () => {
    try {
      // Fetch prescription details
      const prescriptionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`,
        {
          method: "GET",
          headers: {
            // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (prescriptionResponse.ok) {
        const prescriptionData = await prescriptionResponse.json();
        console.log("Fetched prescription:", prescriptionData);
        setPrescription(prescriptionData as PrescriptionType);
        setDoctorNotes(prescriptionData.notes || "");

        // Fetch student details using student_id
        const studentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${prescriptionData.student_id}`,
          {
            method: "GET",
            headers: {
              // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          setStudent(studentData as StudentType);
        }
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      // Sample data for demo
      setPrescription({
        id: 1,
        student_id: "R200137",
        status: "Initiated by Nurse",
        notes:
          "Patient appears very unwell, high fever, complaining of severe headache.",
        temperature: "102.1°F",
        bp: "140/90",
        weight: "68kg",
        created_at: "2024-01-15T10:30:00Z",
      });
      setStudent({
        id: 1,
        student_id: "R200137",
        name: "Rajesh Kumar",
        email: "r200137@rgukitrkv.ac.in",
        branch: "CSE",
        section: "A",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMedicines = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines`,
        {
          method: "GET",
          headers: {
            // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched medicines:", data);
        setAvailableMedicines(data as Medicine[]);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      // Sample data for demo
      setAvailableMedicines([
        {
          id: 1,
          name: "Paracetamol 500mg",
          category: "Analgesic",
          quantity: 150,
          unit: "tablets",
        },
        {
          id: 2,
          name: "Ibuprofen 400mg",
          category: "Anti-inflammatory",
          quantity: 80,
          unit: "tablets",
        },
        {
          id: 3,
          name: "Amoxicillin 250mg",
          category: "Antibiotic",
          quantity: 60,
          unit: "capsules",
        },
        {
          id: 4,
          name: "Cetirizine 10mg",
          category: "Antihistamine",
          quantity: 120,
          unit: "tablets",
        },
        {
          id: 5,
          name: "Omeprazole 20mg",
          category: "Antacid",
          quantity: 90,
          unit: "capsules",
        },
      ]);
    }
  };

  const addMedicine = () => {
    setSelectedMedicines([
      ...selectedMedicines,
      { medicineId: "", quantity: 1 },
    ]);
  };

  const updateMedicine = (
    index: number,
    field: "medicineId" | "quantity",
    value: number | ""
  ) => {
    const updated = [...selectedMedicines];
    const current = { ...updated[index] } as SelectedMedicine;
    if (field === "medicineId") current.medicineId = value as number | "";
    if (field === "quantity") current.quantity = value as number;
    updated[index] = current;
    setSelectedMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const addLabTest = () => {
    setLabTests([...labTests, ""]);
  };

  const updateLabTest = (index: number, value: string) => {
    const updated = [...labTests];
    updated[index] = value;
    setLabTests(updated);
  };

  const removeLabTest = (index: number) => {
    setLabTests(labTests.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    console.log("🔹 handleSavePrescription called");
    setSaving(true);

    try {
      const doctorId = session?.user?.id;
      let status = "Initiated by Nurse";

      if (selectedMedicines.length > 0 && labTests.length > 0) {
        status = "Medication Prescribed and Lab Test Requested";
      } else if (selectedMedicines.length > 0) {
        status = "Medication Prescribed by Doctor";
      } else if (labTests.length > 0) {
        status = "Lab Test Requested";
      }

      // If image selected but not uploaded, upload it first
      let imageUrl = doctorImageUrl;
      if (selectedImage && !doctorImageUrl) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage);
          setDoctorImageUrl(imageUrl);
        } catch {
          alert("Image upload failed.");
        }
      }

      // Prepare form data (includes optional audio)
      const formData = new FormData();
      formData.append("doctor_id", String(doctorId || ""));
      formData.append("doctor_notes", doctorNotes || "");
      formData.append("ai_summary", aiSummary || "");
      formData.append("status", status);
      if (imageUrl) formData.append("doctor_image_url", imageUrl);
      if (audioBlob) formData.append("file", audioBlob, "doctor_audio.webm");

      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}/update-with-audio`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (updateResponse.ok) {
        console.log("🎉 Prescription successfully updated!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setActiveTab("queue");
      } else {
        console.error(
          "❌ Prescription update failed:",
          await updateResponse.text()
        );
      }

      // ✅ Handle medicines
      for (const med of selectedMedicines.filter(
        (m) => m.medicineId && m.quantity > 0
      )) {
        await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescription-medicines`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prescription_id: parseInt(prescriptionId!),
              medicine_id: med.medicineId,
              quantity_prescribed: med.quantity,
            }),
          }
        );
      }

      // ✅ Handle lab tests
      for (const test of labTests.filter((t) => t.trim() !== "")) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prescription_id: parseInt(prescriptionId!),
            test_name: test,
          }),
        });
      }
    } catch (err) {
      console.error("🚨 Error saving prescription:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!prescriptionId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Prescription Selected
          </h3>
          <p className="text-gray-600">
            Please select a prescription from the queue to view details.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 h-96">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 h-96">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Prescription Saved Successfully!
          </h2>
          <p className="text-green-700">
            Prescription for {student?.name} has been saved and sent to the
            pharmacy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Queue</span>
        </button>
        <h2 className="text-3xl font-bold text-gray-900">
          Patient Details & Prescription
        </h2>
        <p className="text-gray-600 mt-2">
          Review patient information and create prescription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Patient Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">{student?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <p className="text-gray-900">{student?.id_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <p className="text-gray-900">{student?.branch || "CS"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <p className="text-gray-900">
                    {prescription?.created_at
                      ? new Date(prescription.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-red-600" />
                Vital Signs
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium text-gray-900">
                      {prescription?.temperature || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="font-medium text-gray-900">
                    {prescription?.bp || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium text-gray-900">
                    {prescription?.weight || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-medium text-gray-900">
                    {prescription?.age || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Clinical Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nurse Notes
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {prescription?.nurse_notes || "No notes available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Section */}
        <div className="space-y-6">
          {/* Doctor Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Doctor's Assessment
              </h3>
            </div>
            <div className="p-6">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4}
                placeholder="Enter your clinical assessment and diagnosis..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Medicines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-blue-600" />
                Prescribe Medicines
              </h3>
              <button
                onClick={addMedicine}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medicine</span>
              </button>
            </div>
            <div className="p-6">
              {selectedMedicines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No medicines added yet
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedMedicines.map((medicine, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medicine
                          </label>
                          <select
                            value={medicine.medicineId}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "medicineId",
                                e.target.value ? Number(e.target.value) : ""
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select Medicine</option>
                            {availableMedicines.map((med: Medicine) => (
                              <option key={med.id} value={med.id}>
                                {med.name} (Stock: {med.quantity})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity ?? 0}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeMedicine(index)}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lab Tests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-purple-600" />
                Lab Tests
              </h3>
              <button
                onClick={addLabTest}
                className="flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Test</span>
              </button>
            </div>
            <div className="p-6">
              {labTests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No lab tests requested
                </p>
              ) : (
                <div className="space-y-3">
                  {labTests.map((test, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={test}
                        onChange={(e) => updateLabTest(index, e.target.value)}
                        placeholder="Enter lab test name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeLabTest(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Doctor Image Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <PatientImageUpload
                selectedImage={selectedImage}
                imagePreview={imagePreview}
                onImageSelect={handleImageSelect}
                onImageRemove={handleImageRemove}
              />
              {/* Upload button for image */}
              {selectedImage && !doctorImageUrl && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="mt-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg"
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Upload Image</span>
                    </>
                  )}
                </button>
              )}
              {/* Show uploaded image preview if available */}
              {doctorImageUrl && !selectedImage && (
                <div className="mt-4">
                  <img
                    src={doctorImageUrl}
                    alt="Doctor uploaded"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Image uploaded successfully.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Audio Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="p-6">
              <PatientAudioUpload
                audioUrl={doctorAudioUrl}
                onAudioUpload={handleAudioUpload}
                onAudioRemove={handleAudioRemove}
                onAudioRecorded={(blob) => setAudioBlob(blob)}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              disabled={!audioBlob || generatingSummary}
              onClick={async () => {
                if (!audioBlob) return;
                setGeneratingSummary(true);

                const formData = new FormData();
                formData.append("file", audioBlob, "doctor_audio.webm");

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/transcribe-summarize`,
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                const data = await res.json();
                if (data.summary) {
                  setAiSummary(data.summary);
                } else {
                  alert("Failed to generate summary.");
                }
                setGeneratingSummary(false);
              }}
              className={`flex items-center justify-center px-5 py-3 
      rounded-lg text-white text-sm font-medium transition-all duration-200 
      ${
        generatingSummary || !audioBlob
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
            >
              {generatingSummary ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  <span>Generating Summary...</span>
                </div>
              ) : (
                "Generate AI Summary"
              )}
            </button>
          </div>

          {aiSummary && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                AI-Generated Summary (Editable)
              </label>

              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                rows={6}
                className="
        w-full p-4 text-gray-900 text-sm rounded-lg border border-gray-300
        focus:ring-2 focus:ring-teal-500 focus:border-transparent
        bg-white shadow-sm resize-none
      "
              />

              <p className="text-xs text-gray-500 mt-2">
                Review the summary and make corrections if needed before saving
                prescription.
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePrescription}
              disabled={
                saving ||
                (!selectedMedicines.some((med) => med.medicineId) &&
                  labTests.length === 0)
              }
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Prescription</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
