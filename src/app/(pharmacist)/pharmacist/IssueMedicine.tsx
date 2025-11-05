import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';

interface IssueMedicineProps {
  prescriptionId: string | null;
  setActiveTab: (tab: string) => void;
}

const IssueMedicine: React.FC<IssueMedicineProps> = ({ prescriptionId, setActiveTab  }) => {
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

  const fetchPrescriptionDetails = async () => {
    try {
      // Fetch prescription details with medicines
      const prescriptionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`, {
        method: 'GET',
        headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (prescriptionResponse.ok) {
        const prescriptionData = await prescriptionResponse.json();
        console.log("Prescription Data: ", prescriptionData);
        setPrescription(prescriptionData);
        setMedicines(prescriptionData.medicines || []);
        setStudent(prescriptionData.student || null);
      }
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      // Sample data for demo
      setPrescription({
        id: 1,
        student_id: 'R200137',
        status: 'Prescribed by Doctor',
        notes: 'Patient presented with high fever and severe headache. Prescribed symptomatic treatment.',
        temperature: '102.1°F',
        bp: '140/90',
        weight: '68kg',
        created_at: '2024-01-15T10:30:00Z'
      });
      setStudent({
        id: 1,
        student_id: 'R200137',
        name: 'Rajesh Kumar',
        email: 'r200137@rgukitrkv.ac.in',
        branch: 'CSE',
        section: 'A'
      });
      setMedicines([
        { 
          id: 1,
          medicine: { id: 1, name: 'Paracetamol 500mg', category: 'Analgesic', quantity: 150 },
          quantity_prescribed: 10,
          quantity_issued: null
        },
        { 
          id: 2,
          medicine: { id: 2, name: 'Ibuprofen 400mg', category: 'Anti-inflammatory', quantity: 80 },
          quantity_prescribed: 6,
          quantity_issued: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantityIssued = (index: number, quantity: number) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index].quantity_issued = quantity;
    setMedicines(updatedMedicines);
  };

  const getPrescriptionStatus = (prescription: any): string => {
    const hasMedsPrescribed = prescription.medicines.some((med: { quantity_prescribed: number; }) => med.quantity_prescribed > 0);
    const hasMedsIssued = prescription.medicines.some((med: { quantity_issued: number; }) => med.quantity_issued && med.quantity_issued > 0);
    const hasLabRequested = prescription.lab_reports.some((lab: { status: string; }) => lab.status === 'Lab Test Requested');
    const hasLabResult = prescription.lab_reports.some((lab: { status: string; }) => lab.status === 'Lab Test Completed');

    if (hasMedsIssued && hasLabResult) return 'Medication issued and Lab Test Completed';
    if (hasMedsIssued && hasLabRequested) return 'Medication issued and Lab Test Requested';
    if (hasMedsPrescribed && !hasMedsIssued && hasLabRequested) return 'Medication Prescribed and Lab Test Requested';
    if (hasMedsPrescribed && !hasMedsIssued && hasLabResult) return 'Medication Prescribed and Lab Test Completed';
    if (hasLabResult) return 'Lab Test Completed';
    if (hasLabRequested) return 'Lab Test Requested';
    if (hasMedsIssued) return 'Medication Issued by Pharmacist';
    if (hasMedsPrescribed) return 'Medication Prescribed by Doctor';

    return 'Initiated by Nurse';
  };


  const handleIssueMedicines = async () => {
    setSaving(true);
    try {
      // Update each prescription medicine with quantity issued
      for (const medicine of medicines) {
        if (medicine.quantity_issued && medicine.quantity_issued > 0) {
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescription-medicines/${medicine.id}`, {
            method: 'PUT',
            headers: {
            //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quantity_issued: medicine.quantity_issued
            }),
          });

          // Update medicine stock
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/medicines/${medicine.medicine.id}`, {
            method: 'PUT',
            headers: {
            //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              quantity: medicine.medicine.quantity - medicine.quantity_issued
            }),
          });
        }
      }

      // Update prescription status
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions/${prescriptionId}`, {
        method: 'PUT',
        headers: {
        //   'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: getPrescriptionStatus(prescription)
        }),
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Redirect back to prescriptions
        setActiveTab('prescriptions');
      }, 3000);
    } catch (error) {
      console.error('Error issuing medicines:', error);
    } finally {
      setSaving(false);
    }
  };

  const canIssueMedicine = (medicine: any) => {
    return medicine.quantity_issued && 
           medicine.quantity_issued > 0 && 
           medicine.quantity_issued <= medicine.quantity_prescribed &&
           medicine.quantity_issued <= medicine.medicine.quantity;
  };

  const allMedicinesIssued = medicines.every(med => med.quantity_issued > 0);
  const hasValidQuantities = medicines.every(med => 
    !med.quantity_issued || 
    (med.quantity_issued <= med.quantity_prescribed && med.quantity_issued <= med.medicine.quantity)
  );

  if (!prescriptionId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Prescription Selected</h3>
          <p className="text-gray-600">Please select a prescription from the queue to issue medicines.</p>
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
          <h2 className="text-2xl font-bold text-green-900 mb-2">Medicines Issued Successfully!</h2>
          <p className="text-green-700">
            Medicines for {student?.name} have been issued and inventory has been updated.
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
          <span>Back to Prescriptions</span>
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Issue Medicines</h2>
        <p className="text-gray-600 mt-2">Review prescription and issue medicines to patient</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Information */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Patient Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 font-medium">{student?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900">{student?.id_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="text-gray-900">{student?.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescribed Date</label>
                  <p className="text-gray-900">{new Date(prescription?.created_at).toLocaleDateString()}</p>
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
                    <p className="font-medium text-gray-900">{prescription?.temperature || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Pressure</p>
                  <p className="font-medium text-gray-900">{prescription?.bp || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium text-gray-900">{prescription?.weight || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor's Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Doctor's Notes
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{prescription?.notes || 'No notes available'}</p>
            </div>
          </div>
        </div>

        {/* Medicine Issuing Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Pill className="w-5 h-5 mr-2 text-purple-600" />
                Issue Medicines
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {medicines.map((medicine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{medicine?.medicine?.name}</h4>
                        <p className="text-sm text-gray-600">{medicine?.medicine?.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Available Stock</p>
                        <p className="font-medium text-gray-900">{medicine?.medicine?.quantity} units</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prescribed Quantity
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <span className="text-gray-900">{medicine.quantity_prescribed} units</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={Math.min(medicine.quantity_prescribed, medicine?.medicine?.quantity)}
                          value={medicine.quantity_issued || ''}
                          onChange={(e) => updateQuantityIssued(index, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>

                    {/* Validation Messages */}
                    {medicine.quantity_issued > medicine.quantity_prescribed && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Cannot issue more than prescribed quantity</span>
                      </div>
                    )}
                    {medicine.quantity_issued > medicine.medicine.quantity && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Insufficient stock available</span>
                      </div>
                    )}
                    {medicine.medicine.quantity <= 10 && (
                      <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Low stock warning</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Issue Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleIssueMedicines}
                  disabled={saving || !hasValidQuantities || medicines.some(med => !med.quantity_issued || med.quantity_issued <= 0)}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
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
                
                {prescription?.status === 'Medication Issued by Pharmacist' && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Medicines already issued</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueMedicine;