'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  trend?: { value: number; isPositive: boolean };
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-pink-100 text-pink-600'
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </div>
    </div>
  );
}
