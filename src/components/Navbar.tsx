"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { itemCount } = useCart();

  return (
    <nav className="bg-[#0b0c10] border-b border-[#1f2833] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#c5a059]">GARLAWS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-[#45a29e] hover:text-[#c5a059] transition-colors">Shop</Link>
            <Link href="/services" className="text-[#45a29e] hover:text-[#c5a059] transition-colors">Services</Link>
            <Link href="/ai/predictive" className="text-[#45a29e] hover:text-[#c5a059] transition-colors">AI</Link>
            <Link href="/enterprise/compliance" className="text-[#45a29e] hover:text-[#c5a059] transition-colors">Enterprise</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-[#45a29e] hover:text-[#c5a059] text-sm">Sign In</Link>
            <Link href="/cart" className="relative p-2 text-[#45a29e] hover:text-[#c5a059] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c5a059] text-[#0b0c10] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}