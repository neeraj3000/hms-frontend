'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session } = useSession();
  const { logout } = useAuth();

  const handleLogout = () => {
    // prefer central logout implementation
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          <div className="space-y-4">
            <div>
              <strong>User:</strong> 
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {session?.user?.email ? `${session.user.email}` : 'Not logged in'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
            <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
