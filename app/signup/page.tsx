"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Welcome to Velkara! Account created.");
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSignUp} className="bg-white/40 backdrop-blur-3xl border border-white/20 p-10 rounded-[40px] shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-black mb-8">Join Velkara</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full bg-white/50 border rounded-2xl px-5 py-4 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-white/50 border rounded-2xl px-5 py-4 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-bold text-lg disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}

