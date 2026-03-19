"use client";
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white/40 backdrop-blur-3xl border border-white/20 p-10 rounded-[40px] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Velkara</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your shop</p>
        </div>
        <div className="space-y-4">
          <input className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500" placeholder="Email Address" />
          <input className="w-full bg-white/50 border border-white/20 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-blue-500" type="password" placeholder="Password" />
          <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all">
            Unlock System
          </button>
        </div>
      </div>
    </div>
  );
}
