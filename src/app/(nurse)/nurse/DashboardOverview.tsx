import React from 'react';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';

const DashboardOverview: React.FC = () => {
  const stats = [
    {
      title: 'Patients Today',
      value: '24',
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Prescriptions',
      value: '18',
      change: '+8%',
      icon: ClipboardList,
      color: 'green'
    },
    {
      title: 'Pending Reviews',
      value: '6',
      change: '-3%',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Completed Today',
      value: '12',
      change: '+15%',
      icon: CheckCircle,
      color: 'emerald'
    }
  ];

  const recentPatients = [
    { id: 'R200137', name: 'Rajesh Kumar', time: '10:30 AM', status: 'Initiated by Nurse' },
    { id: 'R200142', name: 'Priya Sharma', time: '11:15 AM', status: 'Prescribed by Doctor' },
    { id: 'R200155', name: 'Amit Singh', time: '11:45 AM', status: 'Lab Test Requested' },
    { id: 'R200168', name: 'Sneha Patel', time: '12:20 PM', status: 'Medication Issued' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Nurse</h2>
        <p className="text-gray-600 mt-2">Here's what's happening in your department today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from yesterday
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Recent Patients
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">ID: {patient.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{patient.time}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      patient.status === 'Initiated by Nurse' ? 'bg-blue-100 text-blue-800' :
                      patient.status === 'Prescribed by Doctor' ? 'bg-green-100 text-green-800' :
                      patient.status === 'Lab Test Requested' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Register New Patient</span>
                </div>
                <div className="text-blue-600">→</div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">View Prescriptions</span>
                </div>
                <div className="text-green-600">→</div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Today's Schedule</span>
                </div>
                <div className="text-purple-600">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Today's Schedule
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">8:00 AM - 12:00 PM</p>
              <p className="text-sm text-blue-800 mt-1">Morning Shift</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">12:00 PM - 1:00 PM</p>
              <p className="text-sm text-green-800 mt-1">Lunch Break</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">1:00 PM - 5:00 PM</p>
              <p className="text-sm text-orange-800 mt-1">Afternoon Shift</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;