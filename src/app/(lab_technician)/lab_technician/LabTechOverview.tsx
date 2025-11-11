import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  FileText, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Calendar,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface LabTechnicianOverviewProps {
  setActiveTab: (tab: 'overview' | 'queue' | 'upload' | 'profile') => void;
}

const LabTechnicianOverview: React.FC<LabTechnicianOverviewProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedToday: 0,
    totalTests: 0,
    urgentTests: 0
  });
  interface RecentTest {
    id: number;
    prescription_id: number;
    test_name: string;
    status: string;
    created_at: string;
    prescription: {
      student_id: string;
      student_name: string;
    };
  }
  
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch lab technician dashboard statistics
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lab-tech-stats`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch recent lab tests
      const testsResponse = await fetch('/api/lab-technician/tests/recent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if(testsResponse.ok){
        const testsData = await testsResponse.json();
        setRecentTests(testsData.tests);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Sample data for demo
      setStats({
        pendingTests: 8,
        completedToday: 15,
        totalTests: 156,
        urgentTests: 3
      });
      setRecentTests([
        { 
          id: 1, 
          prescription_id: 2,
          test_name: 'Complete Blood Count',
          status: 'Lab Test Requested',
          created_at: '2024-01-15T11:00:00Z',
          prescription: {
            student_id: 'R200142',
            student_name: 'Priya Sharma'
          }
        },
        { 
          id: 2, 
          prescription_id: 3,
          test_name: 'Blood Sugar Test',
          status: 'Lab Test Requested',
          created_at: '2024-01-16T09:15:00Z',
          prescription: {
            student_id: 'R200180',
            student_name: 'Vikram Reddy'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Pending Tests',
      value: stats.pendingTests.toString(),
      change: '+2 new',
      icon: Clock,
      color: 'yellow',
      onClick: () => setActiveTab('queue')
    },
    {
      title: 'Urgent Tests',
      value: stats.urgentTests.toString(),
      change: 'Need attention',
      icon: AlertTriangle,
      color: 'red',
      onClick: () => setActiveTab('queue')
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toString(),
      change: '+25%',
      icon: CheckCircle,
      color: 'green',
      onClick: () => setActiveTab('queue')
    },
    {
      title: 'Total Tests',
      value: stats.totalTests.toString(),
      change: '+8% this month',
      icon: TestTube,
      color: 'teal',
      onClick: () => setActiveTab('queue')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Lab Test Requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'Lab Test Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Lab Technician</h2>
        <p className="text-gray-600 mt-2">Here's your lab testing overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              onClick={stat.onClick}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.change.includes('+') ? 'text-green-600' : 
                    stat.change.includes('Need') ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {stat.change}
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
        {/* Pending Tests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Pending Tests
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTests.filter((test: any) => test.status === 'Lab Test Requested').map((test: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <TestTube className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{test.test_name}</p>
                      <p className="text-sm text-gray-600">Patient: {test.prescription?.student_name}</p>
                      <p className="text-xs text-gray-500">ID: {test.prescription?.student_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{new Date(test.created_at).toLocaleTimeString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('queue')}
              className="w-full mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200"
            >
              View All Tests
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('queue')}
                className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="font-medium text-teal-900">Process Test Queue</span>
                </div>
                <div className="text-teal-600">→</div>
              </button>
              
              <button 
                onClick={() => setActiveTab('upload')}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Upload Results</span>
                </div>
                <div className="text-blue-600">→</div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">View Completed Tests</span>
                </div>
                <div className="text-green-600">→</div>
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
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <p className="text-2xl font-bold text-teal-600">{stats.pendingTests}</p>
              <p className="text-sm text-teal-800 mt-1">Tests Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
              <p className="text-sm text-green-800 mt-1">Completed Today</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.urgentTests}</p>
              <p className="text-sm text-red-800 mt-1">Urgent Tests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTechnicianOverview;