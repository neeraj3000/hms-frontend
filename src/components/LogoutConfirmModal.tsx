'use client'

import React from 'react'
import { LogOut } from 'lucide-react'

interface LogoutConfirmModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  highlightText?: string
}

export default function LogoutConfirmModal({ open, onCancel, onConfirm, highlightText }: LogoutConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            <p className="text-sm text-gray-600">Are you sure you want to logout?</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            {highlightText || 'You will be signed out of your account and redirected to the home page.'}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}


