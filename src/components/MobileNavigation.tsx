"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{
    name: string;
    href: string;
    icon: string;
    roles?: string[];
  }>;
  userRole?: string;
}

export function MobileNavigation({ isOpen, onClose, navigation, userRole }: MobileNavigationProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item =>
    !item.roles || item.roles.includes(userRole || "")
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Navigation Panel */}
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-[#1f2833] shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#45a29e]/20">
            <h2 className="text-white font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="text-[#45a29e] hover:text-white transition-colors p-2"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-[#c5a059] text-[#0b0c10] shadow-lg'
                          : 'text-[#45a29e] hover:bg-[#2d3b2d] hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#45a29e]/20">
            <div className="text-center">
              <p className="text-[#45a29e] text-sm">
                Garlaws Platform
              </p>
              <p className="text-[#666] text-xs mt-1">
                v2.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}