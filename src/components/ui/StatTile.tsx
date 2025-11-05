import React from 'react'

interface StatTileProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  colorClass?: string // e.g., 'green' | 'blue' | 'purple' etc
  onClick?: () => void
}

export default function StatTile({ title, value, change, icon: Icon, colorClass = 'gray', onClick }: StatTileProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-blue-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${colorClass}-100`}>
          <Icon className={`w-6 h-6 text-${colorClass}-600`} />
        </div>
      </div>
    </div>
  )
}


