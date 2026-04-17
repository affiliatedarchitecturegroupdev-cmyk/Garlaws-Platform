"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-3xl font-bold text-[#c5a059] mb-4">Check Your Email</h1>
          <p className="text-[#45a29e] mb-6">
            We&apos;ve sent password reset instructions to <span className="text-white">{email}</span>
          </p>
          <button onClick={() => router.push("/auth/login")} className="text-[#c5a059] underline">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-[#c5a059] text-sm tracking-[0.3em] uppercase">Garlaws (Pty) Ltd</span>
          <h1 className="text-3xl font-bold mt-4">Reset Password</h1>
          <p className="text-[#45a29e] mt-2">Enter your email to receive reset instructions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#45a29e] text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1f2833] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c5a059] text-[#0b0c10] py-4 rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <a href="/auth/login" className="text-[#45a29e] hover:text-[#c5a059]">
              ← Back to Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}