"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MobileNavigation } from './MobileNavigation';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  navigation: Array<{
    name: string;
    href: string;
    icon: string;
    roles?: string[];
  }>;
  userRole?: string;
  children?: React.ReactNode;
}

export function MobileHeader({
  title = "Garlaws",
  showBack = false,
  navigation,
  userRole,
  children
}: MobileHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1f2833]/95 backdrop-blur-sm border-b border-[#45a29e]/20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Back button or menu */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                onClick={() => window.history.back()}
                className="text-[#45a29e] hover:text-white transition-colors p-2"
              >
                ←
              </button>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#45a29e] hover:text-white transition-colors p-2"
              >
                ☰
              </button>
            )}

            <h1 className="text-white font-semibold truncate">{title}</h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            {children}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
        userRole={userRole}
      />

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
}