"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "property-owner",
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agreeTerms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="mb-8">
            <span className="text-[#c5a059] text-sm tracking-[0.3em] uppercase">Garlaws (Pty) Ltd</span>
            <h1 className="text-3xl font-bold mt-4">Create Account</h1>
            <p className="text-[#45a29e] mt-2">Join the Garlaws ecosystem</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#45a29e] text-sm mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[#45a29e] text-sm mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                placeholder="+27..."
              />
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="property-owner">Property Owner</option>
                <option value="tenant">Tenant</option>
                <option value="service-provider">Service Provider</option>
                <option value="business">Business/Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
                required
              />
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1 w-4 h-4 rounded border-[#45a29e]/30 bg-[#1f2833] text-[#c5a059]"
              />
              <span className="text-sm text-[#45a29e]">
                I agree to the <a href="/terms" className="text-[#c5a059] underline">Terms of Service</a> and <a href="/privacy" className="text-[#c5a059] underline">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c5a059] text-[#0b0c10] py-4 rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#45a29e]">
              Already have an account?{" "}
              <a href="/auth/login" className="text-[#c5a059] hover:underline font-semibold">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1f2833] to-[#2d3b2d] items-center justify-center p-12">
        <div className="text-center">
          <div className="text-8xl mb-6">🌱</div>
          <h2 className="text-3xl font-bold text-[#c5a059] mb-4">Start Your Journey</h2>
          <p className="text-[#45a29e] max-w-md">
            Join thousands of property owners who trust Garlaws for their maintenance needs.
          </p>
        </div>
      </div>
    </div>
  );
}