"use client";
import React from 'react';
import { ShieldCheck, Zap, Smartphone, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-10">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900">Velkara.</h1>
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-white/70 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md transition"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-bounce">
          New for 2026: Velkara Pro
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-tight">
          Next-Gen POS for <br /> <span className="text-blue-600">Modern Boutiques.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-10 leading-relaxed">
          The most aesthetic inventory management system in Dhaka. 
          Manage stock, scan barcodes, and track sales on any device.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black text-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Get Started Free <ArrowRight className="ml-2" />
          </button>
          <button className="bg-white border border-slate-200 px-10 py-5 rounded-[24px] font-bold text-xl hover:bg-slate-50 transition">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-20 px-6">
        {[
          { title: 'Lightning Fast', desc: 'Scan barcodes and generate receipts in under 3 seconds.', icon: Zap },
          { title: 'Cloud Sync', desc: 'Check your shop profit from anywhere in the world.', icon: ShieldCheck },
          { title: 'Any Device', desc: 'Runs perfectly on iPad, iPhone, and Android tablets.', icon: Smartphone },
        ].map((f, i) => (
          <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <f.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
