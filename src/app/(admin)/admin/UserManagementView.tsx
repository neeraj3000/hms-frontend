'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { User, UserRole } from '../../../types';

interface UserManagementViewProps {
  users: User[];
  onAdd: (userData: Partial<User>) => Promise<void>;
  onUpdate: (id: number, userData: Partial<User>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

import UserFormModal from './UserFormModal';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import ResponsiveContainer from '@/components/ui/ResponsiveContainer';

export default function UserManagementView({
  users,
  onAdd,
  onUpdate,
  onDelete
}: UserManagementViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const handleAddClick = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (userData: Partial<User>) => {
    if (selectedUser) {
        console.log("user data:", userData);
      await onUpdate(selectedUser.id, userData);
    } else {
      await onAdd(userData);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id: number) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteUserId != null) {
      await onDelete(deleteUserId);
    }
    setShowDeleteConfirm(false);
    setDeleteUserId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-700';
      case UserRole.DOCTOR:
        return 'bg-blue-100 text-blue-700';
      case UserRole.NURSE:
        return 'bg-green-100 text-green-700';
      case UserRole.PHARMACIST:
        return 'bg-orange-100 text-orange-700';
      case UserRole.LAB_TECHNICIAN:
        return 'bg-pink-100 text-pink-700';
      case UserRole.STORE_KEEPER:
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ResponsiveContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">User Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage staff accounts and permissions</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.DOCTOR}>Doctor</option>
              <option value={UserRole.NURSE}>Nurse</option>
              <option value={UserRole.PHARMACIST}>Pharmacist</option>
              <option value={UserRole.LAB_TECHNICIAN}>Lab Technician</option>
              <option value={UserRole.STORE_KEEPER}>Store Keeper</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          {user.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.username}</div>
                        <div className="text-xs text-gray-500 md:hidden truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <UserCheck className="w-4 h-4" />
                      Active
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(user.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserX className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-gray-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add / Edit user modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        title={selectedUser ? 'Edit User' : 'Add User'}
      />

      {/* Delete confirmation modal (reusing LogoutConfirmModal) */}
      <LogoutConfirmModal
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirmed}
        highlightText="This will permanently delete the user account. This action cannot be undone."
      />
    </ResponsiveContainer>
  );
}
