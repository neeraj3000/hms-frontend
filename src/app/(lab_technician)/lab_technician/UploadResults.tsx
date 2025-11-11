import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  User, 
  TestTube, 
  Save,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface UploadResultsProps {
  labReportId: string | null;
  onUploadComplete?: () => void;
}

const UploadResults: React.FC<UploadResultsProps> = ({ labReportId, onUploadComplete  }) => {
  const [labReport, setLabReport] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [resultNotes, setResultNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (labReportId) {
      fetchLabReportDetails();
    }
  }, [labReportId]);

  const fetchLabReportDetails = async () => {
    try {
      // Fetch lab report details
      const reportResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports/${labReportId}`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        setLabReport(reportData);

        // Fetch prescription details to get student info
        // const prescriptionResponse = await fetch(`/api/prescriptions/${reportData.prescription_id}`, {
        //   method: 'GET',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        //     'Content-Type': 'application/json',
        //   },
        // });

        // if (prescriptionResponse.ok) {
        //   const prescriptionData = await prescriptionResponse.json();
          
        //   // Fetch student details
        //   const studentResponse = await fetch(`/api/students/${prescriptionData.student_id}`, {
        //     method: 'GET',
        //     headers: {
        //       'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        //       'Content-Type': 'application/json',
        //     },
        //   });

        //   if (studentResponse.ok) {
        //     const studentData = await studentResponse.json();
        //     setStudent(studentData);
        //   }
        // }
      }
    } catch (error) {
      console.error('Error fetching lab report details:', error);
      // Sample data for demo
      setLabReport({
        id: labReportId,
        prescription_id: 2,
        test_name: 'Complete Blood Count',
        status: 'Lab Test Requested',
        result: null,
        created_at: '2024-01-15T11:00:00Z'
      });
      setStudent({
        id: 1,
        student_id: 'R200142',
        name: 'Priya Sharma',
        email: 'r200142@rgukitrkv.ac.in',
        branch: 'CSE',
        section: 'A'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, images, etc.)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.type)) {
        setResultFile(file);
      } else {
        alert('Please upload a PDF or image file (JPEG, PNG)');
        event.target.value = '';
      }
    }
  };

  const handleUploadResults = async () => {
    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Optional file upload
      if (resultFile) {
        formData.append("file", resultFile);
      }

      // Notes or result text
      if (resultNotes) {
        formData.append("result", resultNotes);
      }

      // Status update
      formData.append("status", "Lab Test Completed");

      // Upload file and update lab report
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-reports/${labReportId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload results");
      }

      const data = await response.json();
      console.log("Lab report updated successfully:", data);

      // ✅ Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Redirect back to queue or parent refresh
        if (onUploadComplete) onUploadComplete();
      }, 3000);
    } catch (error) {
      console.error("Error uploading results:", error);
      alert("Failed to upload results. Please try again.");
    } finally {
      setUploading(false);
    }
  };


  if (!labReportId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <TestTube className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Report Selected</h3>
          <p className="text-gray-600">Please select a lab report from the queue to upload results.</p>
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
          <h2 className="text-2xl font-bold text-green-900 mb-2">Results Uploaded Successfully!</h2>
          <p className="text-green-700">
            Lab results for {student?.name} have been uploaded and are now available for doctors and students to view.
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
        <h2 className="text-3xl font-bold text-gray-900">Upload Lab Results</h2>
        <p className="text-gray-600 mt-2">Upload test results and update status</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Information */}
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-teal-600" />
                Patient Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 font-medium">{labReport?.prescription?.student?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900">{labReport?.prescription?.student?.id_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <p className="text-gray-900">{labReport?.prescription?.student?.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section</label>
                  <p className="text-gray-900">{labReport?.prescription?.student?.section}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-purple-600" />
                Test Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                <p className="text-lg font-semibold text-gray-900">{labReport?.test_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                  {labReport?.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{new Date(labReport?.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Upload Test Results
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* File Upload (optional now) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Result File <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, JPEG, PNG files up to 10MB
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg cursor-pointer transition-colors duration-200"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </label>
                </div>

                {resultFile ? (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">File selected:</span>
                      <span className="text-sm text-green-700">{resultFile.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center space-x-2 text-gray-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No file selected (optional)</span>
                  </div>
                )}
              </div>

              {/* Result Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={resultNotes}
                  onChange={(e) => setResultNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes about the test results..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Upload Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleUploadResults}
                  disabled={uploading}
                  className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading Results...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Submit Result</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Upload Instructions</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>Uploading a file is optional. You can submit results using notes only.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                <span>If uploading, ensure the file is clear and readable.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResults;