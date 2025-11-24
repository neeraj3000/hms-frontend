import React from "react";
import {
  User,
  Mail,
  Building2,
  Layers,
  Calendar,
  UserCircle2,
} from "lucide-react";

interface PatientDetailsProps {
  patientType: "student" | "others";
  formData: {
    name: string;
    email: string;
    branch: string;
    section: string;
    age: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const PatientPersonalDetails: React.FC<PatientDetailsProps> = ({
  patientType,
  formData,
  errors,
  onChange,
}) => {
  const showAcademicFields = patientType === "student";
  const showEmailField = patientType === "student";

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserCircle2 className="w-5 h-5 mr-2 text-blue-600" />
        Patient Details
      </h3>

      {/* Name + Age */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter full name"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                ${errors.name ? "border-red-300" : "border-gray-300"}`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="age"
              min={1}
              max={100}
              value={formData.age}
              onChange={onChange}
              placeholder="Enter age"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                ${errors.age ? "border-red-300" : "border-gray-300"}`}
            />
          </div>
          {errors.age && (
            <p className="mt-1 text-sm text-red-600">{errors.age}</p>
          )}
        </div>
      </div>

      {/* Email (only for students) */}
      {showEmailField && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="example@rguktrkv.ac.in"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Branch + Section (Only Students) */}
      {showAcademicFields && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                name="branch"
                value={formData.branch}
                onChange={onChange}
                placeholder="Branch"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                name="section"
                value={formData.section}
                onChange={onChange}
                placeholder="Section"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPersonalDetails;
