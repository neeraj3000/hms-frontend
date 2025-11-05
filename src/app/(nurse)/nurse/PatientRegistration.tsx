import React, { useState } from 'react';
import { User, Mail, Calendar, Save, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import PatientImageUpload from '@/components/PatientImageUpload';
import PatientVitalSigns from '@/components/PatientVitalSigns';

const PatientRegistration: React.FC = () => {
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    age: '',
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    consultationNotes: '',
    branch: '',
    section: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-generate email from student ID
    if (name === 'studentId' && value) {
      const email = `r${value.toLowerCase()}@rguktrkv.ac.in`;
      setFormData(prev => ({
        ...prev,
        email: email
      }));
    }
  };

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedImage(file);
    setImagePreview(preview);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (!/^[rR]\d{6}$/.test(formData.studentId)) {
      newErrors.studentId = 'Student ID must be in format R123456';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    }

    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (formData.temperature && (parseFloat(formData.temperature) < 90 || parseFloat(formData.temperature) > 110)) {
      newErrors.temperature = 'Please enter a valid temperature (90-110°F)';
    }

    if (formData.weight && (parseFloat(formData.weight) < 20 || parseFloat(formData.weight) > 300)) {
      newErrors.weight = 'Please enter a valid weight (20-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image to Cloudinary if selected
      let imageUrl: string | null = null;
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage);
          console.log('Image uploaded to Cloudinary:', imageUrl);
        } catch (error) {
          console.error('Failed to upload image to Cloudinary:', error);
          alert('Failed to upload image. Please try again or continue without image.');
          // Continue with submission even if image upload fails
        }
      }

      // Combine BP
      const bp =
        formData.bloodPressureSystolic && formData.bloodPressureDiastolic
          ? `${formData.bloodPressureSystolic}/${formData.bloodPressureDiastolic}`
          : null;

      const nurseId = session?.user?.id;

      // Check if student exists
      let studentIdBackend = null;
      const checkStudentRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/id_number/${formData.studentId}`
      );

      if (checkStudentRes.ok) {
        const studentData = await checkStudentRes.json();
        studentIdBackend = studentData.id;
        console.log("Existing student found:", studentData);
      } else if (checkStudentRes.status === 404) {
        // Create new student
        const createStudentRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id_number: formData.studentId,
              name: formData.name,
              email: formData.email,
              branch: formData.branch || null,
              section: formData.section || null,
            }),
          }
        );

        if (!createStudentRes.ok) {
          throw new Error(`Error creating student: ${createStudentRes.statusText}`);
        }

        const newStudent = await createStudentRes.json();
        studentIdBackend = newStudent.id;
        console.log("Student created:", newStudent);
      } else {
        throw new Error(`Error checking student: ${checkStudentRes.statusText}`);
      }

      // Build prescription payload
      const payload = {
        student_id: studentIdBackend,
        nurse_id: nurseId,
        nurse_notes: formData.consultationNotes || null,
        weight: formData.weight || null,
        bp: bp,
        age: formData.age ? parseInt(formData.age) : null,
        temperature: formData.temperature || null,
        nurse_image_url: imageUrl, // Cloudinary URL (optional)
      };

      console.log("Prescription Payload:", payload);

      // Create prescription
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Error creating prescription: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Prescription created:", data);

      setSubmitSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          studentId: "",
          name: "",
          email: "",
          age: "",
          temperature: "",
          bloodPressureSystolic: "",
          bloodPressureDiastolic: "",
          weight: "",
          consultationNotes: "",
          branch: "",
          section: "",
        });
        setSelectedImage(null);
        setImagePreview(null);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-900 mb-2">Patient Registered Successfully!</h2>
          <p className="text-green-700">
            Patient record for {formData.name} (ID: {formData.studentId}) has been created and sent to the doctor for review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-3 text-blue-600" />
            Register New Patient
          </h2>
          <p className="text-gray-600 mt-2">Enter patient details and initial assessment</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g., R200137"
                  suppressHydrationWarning
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.studentId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Auto-generated)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-50 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter patient's full name"
                suppressHydrationWarning
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Age in years"
                  min="1"
                  max="120"
                  suppressHydrationWarning
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.age}
                </p>
              )}
            </div>
          </div>

          {/* Vital Signs */}
          <PatientVitalSigns
            formData={{
              temperature: formData.temperature,
              bloodPressureSystolic: formData.bloodPressureSystolic,
              bloodPressureDiastolic: formData.bloodPressureDiastolic,
              weight: formData.weight,
            }}
            errors={errors}
            onChange={handleInputChange}
          />

          {/* Clinical Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Clinical Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="consultationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Assessment Notes
                </label>
                <textarea
                  id="consultationNotes"
                  name="consultationNotes"
                  value={formData.consultationNotes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any additional observations or notes from the initial assessment"
                  suppressHydrationWarning
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <PatientImageUpload
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
          />

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Register Patient</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientRegistration;