"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      {/* STEP 3: The Form with onSubmit */}
      <form onSubmit={handleLogin} className="bg-white/40 backdrop-blur-3xl p-10 rounded-[40px] shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-6">Velkara Login</h1>
        
        <input 
          type="email" 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-2xl mb-4 bg-white/50 border" 
          placeholder="Email" 
          required 
        />
        
        <input 
          type="password" 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 rounded-2xl mb-6 bg-white/50 border" 
          placeholder="Password" 
          required 
        />

        {/* STEP 3: The Button with type="submit" */}
        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">
          Enter Dashboard
        </button>
      </form>
    </div>
  );
}

