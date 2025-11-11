import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  Camera,
  Shield,
  Award,
  Stethoscope,
} from "lucide-react";
import { useSession } from "next-auth/react";

// ✅ Color map for Tailwind-safe dynamic themes
const colorMap: Record<
  string,
  { bg: string; text: string; button: string; buttonHover: string; focusRing: string }
> = {
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    button: "bg-green-600",
    buttonHover: "hover:bg-green-700",
    focusRing: "focus:ring-green-500",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    button: "bg-blue-600",
    buttonHover: "hover:bg-blue-700",
    focusRing: "focus:ring-blue-500",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    button: "bg-purple-600",
    buttonHover: "hover:bg-purple-700",
    focusRing: "focus:ring-purple-500",
  },
  emerald: {
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    button: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
    focusRing: "focus:ring-emerald-500",
  },
  teal: {
    bg: "bg-teal-100",
    text: "text-teal-600",
    button: "bg-teal-600",
    buttonHover: "hover:bg-teal-700",
    focusRing: "focus:ring-teal-500",
  },
};


interface ProfileProps {
  color?: keyof typeof colorMap;
}

const Profile: React.FC<ProfileProps> = ({ color = "green" }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    department: "",
    position: "",
    qualification: "",
    experience: "",
    joinDate: "",
    address: "",
    licenseNumber: "",
  });

  const currentColor = colorMap[color];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/staff-profiles/${session?.user?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/staff-profiles/${session?.user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        console.log("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Patients Treated", value: "2,847", icon: User },
    { label: "Experience (Years)", value: "12", icon: Award },
    { label: "Prescriptions", value: "3,156", icon: Stethoscope },
    { label: "Success Rate", value: "98.9%", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SECTION - Profile Card + Stats */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div
                  className={`w-24 h-24 ${currentColor.bg} rounded-full flex items-center justify-center`}
                >
                  <User className={`w-12 h-12 ${currentColor.text}`} />
                </div>
                <button
                  className={`absolute bottom-0 right-0 p-2 ${currentColor.button} ${currentColor.buttonHover} rounded-full text-white transition-colors duration-200`}
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {profileData.name}
              </h2>
              <p className="text-sm text-gray-500">{profileData.department}</p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className={`text-2xl font-bold ${currentColor.text}`}>
                      {profileData.experience}
                    </p>
                    <p className="text-xs text-gray-600">Experience</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {profileData.employeeId}
                    </p>
                    <p className="text-xs text-gray-600">Employee ID</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Stats
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${currentColor.bg}`}>
                        <Icon className={`w-4 h-4 ${currentColor.text}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {stat.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Information
              </h3>
              <button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 ${currentColor.button} ${currentColor.buttonHover} disabled:opacity-60 text-white rounded-lg transition-colors duration-200`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            {/* Profile Fields */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h4>

                {/* Name */}
                <InputOrText
                  label="Full Name"
                  name="name"
                  value={profileData.name}
                  icon={<User className="w-4 h-4 text-gray-400" />}
                  editable={isEditing}
                  onChange={handleInputChange}
                  focusRing={currentColor.focusRing}
                />

                {/* Email */}
                <InputOrText
                  label="Email"
                  name="email"
                  value={profileData.email}
                  icon={<Mail className="w-4 h-4 text-gray-400" />}
                  editable={isEditing}
                  onChange={handleInputChange}
                  focusRing={currentColor.focusRing}
                />

                {/* Phone */}
                <InputOrText
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  icon={<Phone className="w-4 h-4 text-gray-400" />}
                  editable={isEditing}
                  onChange={handleInputChange}
                  focusRing={currentColor.focusRing}
                />

                {/* Address */}
                <InputOrText
                  label="Address"
                  name="address"
                  value={profileData.address}
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
                  editable={isEditing}
                  onChange={handleInputChange}
                  isTextArea
                  focusRing={currentColor.focusRing}
                />
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Professional Information
                </h4>

                <StaticField
                  label="Employee ID"
                  value={profileData.employeeId}
                  icon={<Shield className="w-4 h-4 text-gray-400" />}
                />

                <InputOrText
                  label="Department"
                  name="department"
                  value={profileData.department}
                  editable={isEditing}
                  onChange={handleInputChange}
                  focusRing={currentColor.focusRing}
                />

                <InputOrText
                  label="Qualification"
                  name="qualification"
                  value={profileData.qualification}
                  editable={isEditing}
                  onChange={handleInputChange}
                  isTextArea
                  focusRing={currentColor.focusRing}
                />

                <StaticField
                  label="Join Date"
                  value={profileData.joinDate}
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                />

                <InputOrText
                  label="License Number"
                  name="licenseNumber"
                  value={profileData.licenseNumber}
                  editable={isEditing}
                  onChange={handleInputChange}
                  focusRing={currentColor.focusRing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔹 Small helper components to reduce repetition
const InputOrText = ({
  label,
  name,
  value,
  icon,
  editable,
  onChange,
  isTextArea = false,
  focusRing,
}: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {editable ? (
      isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={2}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${focusRing} focus:border-transparent resize-none`}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 ${focusRing} focus:border-transparent`}
        />
      )
    ) : (
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-gray-900">{value}</span>
      </div>
    )}
  </div>
);

const StaticField = ({ label, value, icon }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-gray-900">{value}</span>
    </div>
  </div>
);

export default Profile;
