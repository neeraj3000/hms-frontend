"use client";

import React, { useEffect, useState } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Edit,
  Save,
  Camera,
  BookOpen,
  IdCard,
} from "lucide-react";

const API_ROOT = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Student {
  id: number;
  id_number: string;
  name: string;
  email: string;
  branch: string;
  section: string;
  created_at?: string;
}

interface Props {
  studentId: number;
}

const Profile: React.FC<Props> = ({ studentId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    id_number: "",
    branch: "",
    section: "",
    address: "Not Provided",
    joinDate: "",
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${API_ROOT}/students/${studentId}`);
        const data = await res.json();
        setStudent(data);

        setProfileData({
          name: data.name,
          email: data.email,
          id_number: data.id_number,
          branch: data.branch || "N/A",
          section: data.section || "N/A",
          address: "Not Provided",
          joinDate: data.created_at?.slice(0, 10) || "N/A",
        });
      } catch (err) {
        console.error("Failed to load student", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center py-20 text-red-600">
        Student not found
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT PROFILE CARD — UI unchanged */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-indigo-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {profileData.name}
              </h2>
              <p className="text-gray-600">Student</p>
              <p className="text-sm text-gray-500">RGUKT RK Valley</p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {profileData.branch}
                    </p>
                    <p className="text-xs text-gray-600">Branch</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {profileData.section}
                    </p>
                    <p className="text-xs text-gray-600">Section</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE — UI EXACT SAME */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
              </button>
            </div>

            {/* DETAILS GRID */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PERSONAL */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{profileData.name}</span>
                      </div>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  {/* ADDRESS (static because student has no address) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{profileData.address}</span>
                    </div>
                  </div>

                </div>

                {/* ACADEMIC */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Academic Information
                  </h4>

                  {/* ID NUMBER */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <IdCard className="w-4 h-4 text-gray-400" />
                      <span>{profileData.id_number}</span>
                    </div>
                  </div>

                  {/* BRANCH */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>{profileData.branch}</span>
                    </div>
                  </div>

                  {/* SECTION */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>{profileData.section}</span>
                    </div>
                  </div>

                  {/* JOIN DATE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registered On
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{profileData.joinDate}</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
