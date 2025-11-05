'use client';

import {
  LayoutDashboard,
  Users,
  UserCog,
  Activity,
  Package,
  AlertTriangle,
  FileText,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'patients', label: 'Patient Records', icon: UserCog },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'inventory', label: 'Medicine Stock', icon: Package },
  { id: 'indent', label: 'Indents', icon: FileText },
  { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">HMS Admin</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
