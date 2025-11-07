"use client";

import React from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SideNavProps {
  items: NavItem[];
  active: string;
  onChange: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SideNav({
  items,
  active,
  onChange,
  isOpen = true,
  onClose,
}: SideNavProps) {
  const handleClick = (id: string) => {
    onChange(id);
    onClose?.(); // closes drawer on mobile
  };

  return (
    <>
      {/* ✅ BACKDROP (visible only when sidebar is open on mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* ✅ SIDENAV */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-gray-900 text-white z-50 w-64 
          transform transition-transform duration-300 ease-in-out 
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Header / Branding */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wide">HMS</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
