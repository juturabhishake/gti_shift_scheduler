"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecureLS from "secure-ls";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, UserRound, XCircle } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const employeeId = e.target.employeeId.value.trim();
    const password = e.target.password.value.trim();
    const DB = "GTI_PM";
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password ,DB}),
      });

      const data = await res.json();
      // console.log("Login response:", data);
      if (res.ok && data.message === "Login Success") {
          try {
            const ls = new SecureLS({ encodingType: "aes" });
            const loginData = data.data || {};
            const department = loginData.Department ?? loginData.department ?? loginData.DeptName ?? "";
            ls.set("employee_id", loginData.EmployeeId);
            ls.set("full_name", loginData.Username);
            ls.set("password", password);
            ls.set("role", loginData.Position);
            if (department) ls.set("department", department);
          } catch (err) {
            console.error("Error in SecureLS:", err);
          }
          // alert("Login Successful! Redirecting...",ls.get("employee_id"), ls.get("full_name"), ls.get("role"), ls.get("department"));
          setStatus("success");

            setTimeout(() => {
              router.push("/dashboard");
            }, 1200);
      }
      else {
        throw new Error();
      }
    } catch {
      setStatus("error");
      setTimeout(() => {
        setStatus("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#071b1c] px-4 py-8 text-white"
      style={{
        backgroundImage: "url('/loginbgR.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-[#071b1c]/65 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(79,209,178,.22),transparent_32%),radial-gradient(circle_at_90%_80%,rgba(244,180,74,.16),transparent_30%)]"></div>

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/[.10] shadow-2xl shadow-black/30 backdrop-blur-2xl md:grid-cols-[1.05fr_.95fr]">
        <div className="hidden min-h-[560px] flex-col justify-between border-r border-white/10 p-10 md:flex">
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="Greentech Industries" width={40} height={40} className="size-10 object-contain" />
            <span className="text-sm font-semibold tracking-[.18em] text-[#a8ead5]">GREENTECH INDUSTRIES</span>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.3em] text-[#f4b44a]">Internal operations</p>
            <h1 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-tight">Make every shift count.</h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/65">A focused workspace for teams, tasks, and release readiness.</p>
          </div>
          <p className="text-xs text-white/45">Secure access for authorized team members</p>
        </div>

        <div className="p-7 sm:p-10">
          <div className="mb-9 md:hidden">
            <Image src="/icon.png" alt="Greentech Industries" width={48} height={48} className="mb-4 size-12 rounded-xl object-contain" />
            <p className="text-sm font-semibold tracking-[.18em] text-[#a8ead5]">GREENTECH INDUSTRIES</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[.28em] text-[#f4b44a]">Welcome back</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Sign in to your workspace</h2>
          <p className="mt-2 text-sm text-white/55">Use your company credentials to continue.</p>

        <form
          className={`mt-8 space-y-5 ${
            status === "error" ? "animate-shake" : ""
          }`}
          onSubmit={handleSubmit}
        >
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[.16em] text-white/60">Employee ID</label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              name="employeeId"
              type="text"
              placeholder="Enter your Employee ID"
              className="w-full rounded-xl border border-white/15 bg-black/15 px-11 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#70d8bd] focus:ring-2 focus:ring-[#70d8bd]/20"
              required
            />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[.16em] text-white/60">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              className="w-full rounded-xl border border-white/15 bg-black/15 px-11 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#70d8bd] focus:ring-2 focus:ring-[#70d8bd]/20"
              required
            />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/45 hover:text-white" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold shadow-lg transition ${
              status === "success"
                ? "bg-[#2fb98f] text-[#05201c]"
                : status === "error"
                ? "bg-red-600 text-white"
                : "bg-[#a8ead5] text-[#082421] hover:bg-white"
            }`}
          >
            {loading && status === "" && (
              <Loader2 className="h-5 w-5 animate-spin" />
            )}
            {status === "success" && <CheckCircle2 className="h-6 w-6" />}
            {status === "error" && <XCircle className="h-6 w-6" />}
            {status === ""
              ? loading
                ? "Logging in..."
                : "Login"
              : status === "success"
              ? "Success"
              : "Invalid credentials"}
            {status === "" && !loading && <ArrowRight className="size-4" />}
          </button>
        </form>
        </div>
      </section>

      <style jsx global>{`
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
          75% {
            transform: translateX(-5px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </main>
  );
}
