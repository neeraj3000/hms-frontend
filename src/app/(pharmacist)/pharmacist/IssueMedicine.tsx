"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Thermometer,
  Activity,
  FileText,
  Pill,
  Save,
  CheckCircle,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

interface IssueMedicineProps {
  prescriptionId: string | null;
  setActiveTab: (tab: string) => void;
}

const IssueMedicine: React.FC<IssueMedicineProps> = ({
  prescriptionId,
  setActiveTab,
}) => {
  const [prescription, setPrescription] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (prescriptionId) {
      fetchPrescriptionDetails();
    }
  }, [prescriptionId]);

  // ===========================================
  // FETCH PRESCRIPTION (supports student + others)
  // ===========================================
  const fetchPrescriptionDetails = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`
      );

      if (res.ok) {
        const data = await res.json();
        console.log("Prescription Data: ", data);

        setPrescription(data);
        setMedicines(data.medicines || []);
        setStudent(data.student || null);
      }
    } catch (err) {
      console.error("Error fetching prescription:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // ISSUE QUANTITY HANDLING
  // ===========================================
  const updateQuantityIssued = (index: number, quantity: number) => {
    const updated = [...medicines];
    updated[index].quantity_issued = quantity;
    setMedicines(updated);
  };

  // ===========================================
  // STATUS CALCULATION (new model)
  // ===========================================
  const getUpdatedStatus = (prescription: any): string => {
    const meds = prescription.medicines || [];
    const labs = prescription.lab_reports || [];

    const hasPrescribed = meds.some((m: any) => m.quantity_prescribed > 0);
    const hasIssued = meds.some(
      (m: any) => m.quantity_issued && m.quantity_issued > 0
    );
    const hasLabRequested = labs.some(
      (l: any) => l.status === "Lab Test Requested"
    );
    const hasLabCompleted = labs.some(
      (l: any) => l.status === "Lab Test Completed"
    );

    if (hasIssued && hasLabCompleted)
      return "Medication Issued and Lab Test Completed";
    if (hasIssued && hasLabRequested)
      return "Medication Issued and Lab Test Requested";
    if (hasPrescribed && hasLabRequested)
      return "Medication Prescribed and Lab Test Requested";
    if (hasPrescribed && hasLabCompleted)
      return "Medication Prescribed and Lab Test Completed";
    if (hasLabCompleted) return "Lab Test Completed";
    if (hasLabRequested) return "Lab Test Requested";
    if (hasIssued) return "Medication Issued by Pharmacist";
    if (hasPrescribed) return "Medication Prescribed by Doctor";

    return "Initiated by Nurse";
  };

  // ===========================================
  // ISSUE MEDICINES
  // ===========================================
  const handleIssueMedicines = async () => {
    setSaving(true);

    try {
      // Update each prescription medicine
      for (const med of medicines) {
        if (med.quantity_issued && med.quantity_issued > 0) {
          // Update prescription_medicines
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescription-medicines/${med.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity_issued: med.quantity_issued,
              }),
            }
          );

          // Update inventory stock
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/${med.medicine.id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: med.medicine.quantity - med.quantity_issued,
              }),
            }
          );
        }
      }

      // Update prescription status
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: getUpdatedStatus({ ...prescription, medicines }),
          }),
        }
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setActiveTab("prescriptions");
      }, 2000);
    } catch (err) {
      console.error("Error issuing medicines:", err);
    } finally {
      setSaving(false);
    }
  };

  // ===========================================
  // VALIDATIONS
  // ===========================================
  const hasValidQuantities = medicines.every((m) => {
    if (!m.quantity_issued) return false;
    return (
      m.quantity_issued > 0 &&
      m.quantity_issued <= m.quantity_prescribed &&
      m.quantity_issued <= m.medicine.quantity
    );
  });

  // ===========================================
  // UI RENDER
  // ===========================================
  if (!prescriptionId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Prescription Selected
        </h3>
        <p className="text-gray-600">
          Select a prescription to issue medicines.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 h-96"></div>
          <div className="bg-white rounded-xl p-6 h-96"></div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900">
            Medicines Issued Successfully!
          </h2>

          <p className="text-green-700 mt-2">
            Medicines for{" "}
            {prescription?.student?.name ||
              prescription?.other_name ||
              "Patient"}{" "}
            have been issued.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back */}
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Prescriptions</span>
        </button>

        <h2 className="text-3xl font-bold text-gray-900">Issue Medicines</h2>
        <p className="text-gray-600 mt-2">
          Review prescription and issue medicines to the patient
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Patient Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Patient Information
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {student?.name || prescription?.other_name || "Unknown"}
                  </p>
                </div>

                {/* ID (only for students) */}
                {student ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <p className="text-gray-900">
                      {student?.id_number || "—"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Patient Type
                    </label>
                    <p className="text-gray-900 font-medium">Others</p>
                  </div>
                )}

                {/* Branch (only for students) */}
                {student && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <p className="text-gray-900">{student?.branch || "—"}</p>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Prescribed Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(prescription?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* VITALS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-red-600" />
                Vital Signs
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="font-medium text-gray-900">
                    {prescription?.temperature || "N/A"}
                  </p>
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
              </div>
            </div>
          </div>

          {/* DOCTOR NOTES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Doctor's Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                {prescription?.doctor_notes || "No notes available"}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: MEDICINES */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-purple-600" />
                Issue Medicines
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {medicines.map((medicine, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {medicine?.medicine?.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {medicine?.medicine?.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Available Stock</p>
                      <p className="font-medium text-gray-900">
                        {medicine?.medicine?.quantity} units
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Prescribed Quantity
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        {medicine.quantity_prescribed} units
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Issue Quantity
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={Math.min(
                          medicine.quantity_prescribed,
                          medicine.medicine.quantity
                        )}
                        value={medicine.quantity_issued || ""}
                        onChange={(e) =>
                          updateQuantityIssued(
                            index,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* VALIDATIONS */}
                  {medicine.quantity_issued >
                    medicine.quantity_prescribed && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Cannot issue more than prescribed.
                    </p>
                  )}

                  {medicine.quantity_issued > medicine.medicine.quantity && (
                    <p className="text-red-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Insufficient stock available.
                    </p>
                  )}

                  {medicine.medicine.quantity <= 10 && (
                    <p className="text-yellow-600 text-sm flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Low stock warning.
                    </p>
                  )}
                </div>
              ))}

              {/* BUTTON */}
              <button
                onClick={handleIssueMedicines}
                disabled={!hasValidQuantities || saving}
                className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Issuing Medicines...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Issue Medicines</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueMedicine;
