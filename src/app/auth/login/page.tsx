"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <span className="text-[#c5a059] text-sm tracking-[0.3em] uppercase">Garlaws (Pty) Ltd</span>
            <h1 className="text-3xl font-bold mt-4">Welcome Back</h1>
            <p className="text-[#45a29e] mt-2">Sign in to access your account</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-[#45a29e]/30 bg-[#1f2833] text-[#c5a059] focus:ring-[#c5a059]"
                />
                <span className="ml-2 text-sm text-[#45a29e]">Remember me</span>
              </label>
              <a href="/auth/forgot-password" className="text-sm text-[#c5a059] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c5a059] text-[#0b0c10] py-4 rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#45a29e]">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-[#c5a059] hover:underline font-semibold">
                Create one
              </a>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#45a29e]/20">
            <p className="text-sm text-gray-400 text-center">Or continue with</p>
            <div className="flex gap-4 mt-4">
              <button className="flex-1 bg-[#1f2833] border border-[#45a29e]/30 py-3 rounded-lg hover:border-[#45a29e] transition-colors">
                Google
              </button>
              <button className="flex-1 bg-[#1f2833] border border-[#45a29e]/30 py-3 rounded-lg hover:border-[#45a29e] transition-colors">
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1f2833] to-[#2d3b2d] items-center justify-center p-12">
        <div className="text-center">
          <div className="text-8xl mb-6">🏡</div>
          <h2 className="text-3xl font-bold text-[#c5a059] mb-4">Property Care Made Simple</h2>
          <p className="text-[#45a29e] max-w-md">
            Manage your properties, book services, and shop all in one place with our comprehensive ecosystem.
          </p>
        </div>
      </div>
    </div>
  );
}