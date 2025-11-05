import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, CreditCard as Edit, Save, Camera, Shield, Award, Clock, Package } from 'lucide-react';

const StoreKeeperProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Mr. Ramesh Kumar',
    email: 'ramesh.kumar@medicarehosp.com',
    phone: '+91 9876543210',
    employeeId: 'STK001',
    department: 'Store & Inventory',
    position: 'Senior Store Keeper',
    qualification: 'B.Com, Diploma in Inventory Management',
    experience: '15 years',
    joinDate: '2015-03-10',
    address: 'Rajam, Andhra Pradesh, India',
    workingHours: '8:00 AM - 5:00 PM',
    specialization: 'Medical Equipment & Infrastructure Management'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Sample API call - replace with your endpoint
      const response = await fetch('/api/store-keeper/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Using sample data for demo
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sample API call - replace with your endpoint
      const response = await fetch('/api/store-keeper/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setIsEditing(false);
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Items Managed', value: '2,450', icon: Package, color: 'blue' },
    { label: 'Years of Experience', value: '15', icon: Award, color: 'green' },
    { label: 'Maintenance Scheduled', value: '156', icon: Clock, color: 'purple' },
    { label: 'Efficiency Rate', value: '98.7%', icon: Shield, color: 'emerald' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-orange-600" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-orange-600 rounded-full text-white hover:bg-orange-700 transition-colors duration-200">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mt-4">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.position}</p>
              <p className="text-sm text-gray-500">{profileData.department}</p>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{profileData.experience}</p>
                    <p className="text-xs text-gray-600">Experience</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{profileData.employeeId}</p>
                    <p className="text-xs text-gray-600">Employee ID</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Performance Stats</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                          <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h4>
                  
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.name}</span>
                      </div>
                    )}
                  </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Professional Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID
                    </label>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profileData.employeeId}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="department"
                        value={profileData.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profileData.department}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="position"
                        value={profileData.position}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profileData.position}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="specialization"
                        value={profileData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-gray-900">{profileData.specialization}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{profileData.joinDate}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Working Hours
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="workingHours"
                        value={profileData.workingHours}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.workingHours}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qualification
                    </label>
                    {isEditing ? (
                      <textarea
                        name="qualification"
                        value={profileData.qualification}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{profileData.qualification}</span>
                      </div>
                    )}
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

export default StoreKeeperProfile;