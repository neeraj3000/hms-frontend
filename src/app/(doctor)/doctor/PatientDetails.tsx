import PatientAudioUpload from "@/components/PatientAudioUpload";
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Patient type
  patient_type?: "student" | "others";
  visit_type?: "normal" | "emergency";

  // Students OR Others
  student_id?: number | null; // null for 'others'
  student?: StudentType | null; // object or null
  other_name?: string | null; // only for 'others'

  // Status
  status?: string;

  // Notes
  nurse_notes?: string | null;
  doctor_notes?: string | null;
  ai_summary?: string | null;

  // Vitals
  temperature?: string | null;
  bp?: string | null;
  weight?: string | null;
  age?: number | null;

  // Media
  nurse_image_url?: string | null;
  doctor_image_url?: string | null;
  audio_url?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
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
  searchText?: string;
  selectedText?: string;
  suggestions?: Medicine[];
}

const PatientDetails: React.FC<PatientDetailsProps> = ({
  prescriptionId,
  setActiveTab,
}) => {
  // State management
  const [doctorAudioUrl, setDoctorAudioUrl] = useState<string | null>(null);
  const [prescription, setPrescription] = useState<PrescriptionType | null>(
    null
  );
  const [student, setStudent] = useState<StudentType | null>(null);
  const { data: session } = useSession();

  const [availableMedicines, setAvailableMedicines] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<
    SelectedMedicine[]
  >([]);
  const [labTests, setLabTests] = useState<string[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [doctorImageUrl, setDoctorImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const searchTimeouts = useRef<Record<number, NodeJS.Timeout>>({});
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<
    number | null
  >(null);
  const isMountedRef = useRef(true);

  // Audio handlers
  const handleAudioUpload = useCallback((url: string) => {
    setDoctorAudioUrl(url);
  }, []);

  const handleAudioRemove = useCallback(() => {
    setDoctorAudioUrl(null);
  }, []);

  // Image handlers
  const handleImageSelect = useCallback((file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  }, []);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setDoctorImageUrl(null);
  }, []);

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    setImageUploading(true);
    setError(null);

    try {
      const url = await uploadImageToCloudinary(selectedImage);
      if (isMountedRef.current) {
        setDoctorImageUrl(url);
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("Image upload failed. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setImageUploading(false);
      }
    }
  };

  const fetchPrescriptionDetails = useCallback(async () => {
    if (!prescriptionId) return;

    try {
      const prescriptionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!prescriptionResponse.ok) {
        throw new Error("Failed to fetch prescription details");
      }

      const prescriptionData = await prescriptionResponse.json();

      if (!isMountedRef.current) return;

      setPrescription(prescriptionData as PrescriptionType);
      setDoctorNotes(prescriptionData.notes || "");

      // Fetch student details
      if (prescriptionData.student_id) {
        const studentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${prescriptionData.student_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (studentResponse.ok && isMountedRef.current) {
          const studentData = await studentResponse.json();
          setStudent(studentData as StudentType);
        }
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      if (isMountedRef.current) {
        setError("Failed to load prescription details");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [prescriptionId]);

  const fetchAvailableMedicines = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok && isMountedRef.current) {
        const data = await response.json();
        setAvailableMedicines(data as Medicine[]);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (prescriptionId) {
      fetchPrescriptionDetails();
      fetchAvailableMedicines();
    }

    return () => {
      isMountedRef.current = false;
      Object.values(searchTimeouts.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
    };
  }, [prescriptionId, fetchPrescriptionDetails, fetchAvailableMedicines]);

  const addMedicine = useCallback(() => {
    setSelectedMedicines((prev) => [
      ...prev,
      {
        medicineId: "",
        quantity: 1,
        searchText: "",
        selectedText: "",
        suggestions: [],
      },
    ]);
  }, []);

  const updateMedicine = useCallback(
    (
      index: number,
      field:
        | "medicineId"
        | "quantity"
        | "searchText"
        | "selectedText"
        | "suggestions",
      value: any
    ) => {
      setSelectedMedicines((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const removeMedicine = useCallback((index: number) => {
    if (searchTimeouts.current[index]) {
      clearTimeout(searchTimeouts.current[index]);
      delete searchTimeouts.current[index];
    }
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addLabTest = useCallback(() => {
    setLabTests((prev) => [...prev, ""]);
  }, []);

  const updateLabTest = useCallback((index: number, value: string) => {
    setLabTests((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const removeLabTest = useCallback((index: number) => {
    setLabTests((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSearchChange = useCallback(
    (index: number, text: string) => {
      updateMedicine(index, "searchText", text);
      updateMedicine(index, "suggestions", []);

      if (searchTimeouts.current[index]) {
        clearTimeout(searchTimeouts.current[index]);
      }

      if (!text || text.length < 2) {
        return;
      }

      searchTimeouts.current[index] = setTimeout(async () => {
        try {
          const res = await fetch(
            `${
              process.env.NEXT_PUBLIC_BACKEND_URL
            }/medicines?search=${encodeURIComponent(text)}`
          );

          if (res.ok && isMountedRef.current) {
            const data = await res.json();
            updateMedicine(index, "suggestions", data.data as Medicine[]);
          }
        } catch (err) {
          const local = availableMedicines.filter((m) =>
            m.name.toLowerCase().includes(text.toLowerCase())
          );
          if (isMountedRef.current) {
            updateMedicine(index, "suggestions", local);
          }
        }
      }, 300);
    },
    [availableMedicines, updateMedicine]
  );

  const handleSelectMedicine = useCallback(
    (index: number, med: Medicine) => {
      const selectedLabel = `${med.name} (Stock: ${med.quantity})`;
      updateMedicine(index, "medicineId", med.id);
      updateMedicine(index, "selectedText", selectedLabel);
      updateMedicine(index, "searchText", selectedLabel);
      updateMedicine(index, "suggestions", []);
      setActiveSuggestionIndex(null);
    },
    [updateMedicine]
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    setActiveSuggestionIndex(null);
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  const handleGenerateSummary = async () => {
    if (!audioBlob) return;

    setGeneratingSummary(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "doctor_audio.webm");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai/transcribe-summarize`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await res.json();

      if (isMountedRef.current) {
        if (data.summary) {
          setAiSummary(data.summary);
        } else {
          setError("Failed to generate summary. Please try again.");
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("Failed to generate summary. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setGeneratingSummary(false);
      }
    }
  };

  const handleSavePrescription = async () => {
    setSaving(true);
    setError(null);

    try {
      const doctorId = session?.user?.id;

      if (!doctorId) {
        throw new Error("Doctor ID not found");
      }

      // Determine status
      let status = "Initiated by Nurse";
      const hasMedicines = selectedMedicines.some(
        (med) => med.medicineId && med.quantity > 0
      );
      const hasLabTests = labTests.some((test) => test.trim() !== "");

      if (hasMedicines && hasLabTests) {
        status = "Medication Prescribed and Lab Test Requested";
      } else if (hasMedicines) {
        status = "Medication Prescribed by Doctor";
      } else if (hasLabTests) {
        status = "Lab Test Requested";
      }

      // Upload image if needed
      let imageUrl = doctorImageUrl;
      if (selectedImage && !doctorImageUrl) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage);
          if (isMountedRef.current) {
            setDoctorImageUrl(imageUrl);
          }
        } catch {
          throw new Error("Image upload failed");
        }
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("doctor_id", String(doctorId));
      formData.append("doctor_notes", doctorNotes || "");
      formData.append("ai_summary", aiSummary || "");
      formData.append("status", status);
      if (imageUrl) formData.append("doctor_image_url", imageUrl);
      if (audioBlob) formData.append("file", audioBlob, "doctor_audio.webm");

      // Update prescription
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}/update-with-audio`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update prescription");
      }

      // Save medicines
      const medicinePromises = selectedMedicines
        .filter((m) => m.medicineId && m.quantity > 0)
        .map((med) =>
          fetch(
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
          )
        );

      // Save lab tests
      const labTestPromises = labTests
        .filter((t) => t.trim() !== "")
        .map((test) =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prescription_id: parseInt(prescriptionId!),
              test_name: test,
            }),
          })
        );

      await Promise.all([...medicinePromises, ...labTestPromises]);

      if (isMountedRef.current) {
        setShowSuccess(true);
        setTimeout(() => {
          if (isMountedRef.current) {
            setShowSuccess(false);
            setActiveTab("queue");
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to save prescription"
        );
      }
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
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
      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setActiveTab("queue")}
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
          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                Patient Information
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Patient Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Patient Type
                  </label>
                  <p className="text-gray-900 font-medium">
                    {prescription?.patient_type === "student"
                      ? "Student"
                      : "Other Patient"}
                  </p>
                </div>

                {/* Visit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Visit Type
                  </label>
                  <p className="text-gray-900 font-medium">
                    {prescription?.visit_type
                      ? prescription.visit_type.charAt(0).toUpperCase() +
                        prescription.visit_type.slice(1)
                      : "N/A"}
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {prescription?.student?.name ||
                      prescription?.other_name ||
                      "N/A"}
                  </p>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <p className="text-gray-900 font-medium">
                    {prescription?.age || "N/A"}
                  </p>
                </div>

                {/* STUDENT ONLY FIELDS */}
                {prescription?.patient_type === "student" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Student ID
                      </label>
                      <p className="text-gray-900">
                        {prescription?.student?.id_number || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Branch
                      </label>
                      <p className="text-gray-900">
                        {prescription?.student?.branch || "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Section
                      </label>
                      <p className="text-gray-900">
                        {prescription?.student?.section || "N/A"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="text-gray-900 break-words">
                        {prescription?.student?.email || "N/A"}
                      </p>
                    </div>
                  </>
                )}
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
                      className="border border-gray-200 rounded-lg p-4 relative"
                    >
                      {/* FLEX ROW - Medicine wide, qty + remove aligned right */}
                      <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Medicine Search - FLEX GROWS */}
                        <div className="flex-1 relative">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medicine
                          </label>

                          <input
                            type="text"
                            value={
                              medicine.searchText ?? medicine.selectedText ?? ""
                            }
                            onChange={(e) =>
                              handleSearchChange(index, e.target.value)
                            }
                            placeholder="Search medicine..."
                            onFocus={() => setActiveSuggestionIndex(index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />

                          {/* Suggestions */}
                          {activeSuggestionIndex === index &&
                            medicine.suggestions &&
                            medicine.suggestions.length > 0 && (
                              <ul
                                className="absolute z-30 bg-white w-full border border-gray-300 mt-1 
          rounded-lg shadow-lg max-h-52 overflow-y-auto"
                              >
                                {medicine.suggestions.map((m) => (
                                  <li
                                    key={m.id}
                                    onClick={() =>
                                      handleSelectMedicine(index, m)
                                    }
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    {m.name} (Stock: {m.quantity})
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>

                        {/* Quantity - Fixed width */}
                        <div className="w-full md:w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) =>
                              updateMedicine(
                                index,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        {/* Remove Button */}
                        <div className="flex items-end">
                          <button
                            onClick={() => removeMedicine(index)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
        transition-colors duration-200"
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
              {selectedImage && !doctorImageUrl && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  className="mt-4 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Image</span>
                  )}
                </button>
              )}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <PatientAudioUpload
                audioUrl={doctorAudioUrl}
                onAudioUpload={handleAudioUpload}
                onAudioRemove={handleAudioRemove}
                onAudioRecorded={(blob) => setAudioBlob(blob)}
              />
            </div>
          </div>

          {/* AI Summary Generation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <button
                type="button"
                disabled={!audioBlob || generatingSummary}
                onClick={handleGenerateSummary}
                className={`w-full flex items-center justify-center px-5 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 ${
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

              {aiSummary && (
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AI-Generated Summary (Editable)
                  </label>
                  <textarea
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    rows={6}
                    className="w-full p-4 text-gray-900 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Review the summary and make corrections if needed before
                    saving prescription.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSavePrescription}
              disabled={
                saving ||
                (!selectedMedicines.some((med) => med.medicineId) &&
                  labTests.length === 0)
              }
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
