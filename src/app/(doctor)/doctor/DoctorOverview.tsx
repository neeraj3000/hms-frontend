import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Calendar,
  AlertTriangle,
  TestTube
} from 'lucide-react';
import getStatusColor from '@/components/getStatusColor';
import StatTile from '@/components/ui/StatTile';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
interface DoctorOverviewProps {
  setActiveTab: (tab: string) => void;
}

const DoctorOverview: React.FC<DoctorOverviewProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    totalPrescriptions: 0,
    pendingPrescriptions: 0,
    completedPrescriptions: 0,
    pendingLabTests: 0
  });
  interface Prescription {
    id: number;
    student_id: string;
    student_name: string;
    created_at: string;
    status: string;
    notes: string;
  }

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch doctor dashboard statistics
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/doctor-stats`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch recent prescriptions
      const prescriptionsResponse = await fetch('/api/doctor/prescriptions/recent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log("stats data", statsData)
        setStats(statsData);
      }
      if(prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json();
        setRecentPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Sample data for demo
      setStats({
        totalPatientsToday: 20,
        totalPrescriptions: 45,
        pendingPrescriptions: 8,
        completedPrescriptions: 37,
        pendingLabTests: 12
      });
      setRecentPrescriptions([
        { 
          id: 1, 
          student_id: 'R200137', 
          student_name: 'Rajesh Kumar', 
          created_at: '2024-01-15T10:30:00Z', 
          status: 'Initiated by Nurse',
          notes: 'Patient complains of fever and headache'
        },
        { 
          id: 2, 
          student_id: 'R200142', 
          student_name: 'Priya Sharma', 
          created_at: '2024-01-15T11:15:00Z', 
          status: 'Lab Test Completed',
          notes: 'Stomach pain, lab results available'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Total Pateints Today',
      value: stats.totalPatientsToday.toString(),
      change: '+8%',
      icon: Users,
      color: 'blue',
      onClick: () => setActiveTab('queue')
    },
    {
      title: 'Total Prescriptions',
      value: stats.totalPrescriptions.toString(),
      change: '+8%',
      icon: ClipboardList,
      color: 'green',
      onClick: () => setActiveTab('prescriptions')
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingPrescriptions.toString(),
      change: '-5%',
      icon: Clock,
      color: 'yellow',
      onClick: () => setActiveTab('queue')
    },
    {
      title: 'Lab Reports',
      value: stats.pendingLabTests.toString(),
      change: '+3%',
      icon: TestTube,
      color: 'purple',
      onClick: () => setActiveTab('lab-requests')
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Initiated by Nurse':
  //       return 'bg-blue-100 text-blue-800';
  //     case 'Prescribed by Doctor':
  //       return 'bg-green-100 text-green-800';
  //     case 'Lab Test Requested':
  //       return 'bg-yellow-100 text-yellow-800';
  //     case 'Lab Test Completed':
  //       return 'bg-purple-100 text-purple-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Dr. Sarah</h2>
        <p className="text-gray-600 mt-2">Here's your patient overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => (
          <StatTile
            key={index}
            title={stat.title}
            value={stat.value}
            change={`${stat.change} from yesterday`}
            icon={stat.icon}
            colorClass={stat.color}
            onClick={stat.onClick}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Patients */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Reviews
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentPrescriptions.filter((prescription: any) => prescription.status === 'Initiated by Nurse' || prescription.status === 'Lab Test Completed').map((prescription: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">{prescription.student_name?.charAt(0) || 'P'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{prescription.student_name || 'Unknown Patient'}</p>
                      <p className="text-sm text-gray-600">ID: {prescription.student_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(prescription.created_at).toLocaleTimeString()}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              View All Patients
            </button>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Quick Actions
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('queue')}
                className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Review Patients</span>
                </div>
                <div className="text-green-600">→</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('prescriptions')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">View Prescriptions</span>
                </div>
                <div className="text-blue-600">→</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('lab-requests')}
                className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <TestTube className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Lab Requests</span>
                </div>
                <div className="text-purple-600">→</div>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="mt-8">
        <Card>
          <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Today's Schedule
          </h3>
          </CardHeader>
          <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">9:00 AM - 1:00 PM</p>
              <p className="text-sm text-green-800 mt-1">Morning Consultations</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">2:00 PM - 4:00 PM</p>
              <p className="text-sm text-blue-800 mt-1">Afternoon Rounds</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">4:00 PM - 6:00 PM</p>
              <p className="text-sm text-purple-800 mt-1">Lab Reviews</p>
            </div>
          </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DoctorOverview;