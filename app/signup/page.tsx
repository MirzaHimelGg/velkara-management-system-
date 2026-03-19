"use client";
import React from 'react';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
      <div className="bg-white/40 backdrop-blur-3xl border border-white/20 p-10 rounded-[40px] shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Join Velkara</h1>
          <p className="text-slate-500 mt-2">Start managing your boutique today</p>
        </div>
        <div className="space-y-4">
          <input className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500" placeholder="Shop Name" />
          <input className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500" placeholder="Email Address" />
          <input className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500" type="password" placeholder="Create Password" />
          <button className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold text-lg hover:bg-blue-700 transition-all">
            Create Account
          </button>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account? <a href="/login" className="text-blue-600 font-bold">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
