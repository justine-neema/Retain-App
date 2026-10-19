import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { LoginInput } from "../types/auth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof LoginInput>(key: K, value: LoginInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(form);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

      if (from) navigate(from, { replace: true });
      else if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Welcome back</h1>
        
        {/* Toggle Pill */}
        <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex-1 text-center py-2 text-sm font-semibold text-white bg-[#047857] rounded-md shadow-sm">
            Sign in
          </div>
          <Link 
            to="/signup" 
            className="flex-1 text-center py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-900
                       placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-[#047857]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            placeholder="At least 8 characters"
            className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm text-slate-900
                       placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-[#047857]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#047857] text-white py-3 text-sm font-semibold
                     hover:bg-[#065f46] disabled:opacity-70 disabled:cursor-not-allowed
                     transition-colors mt-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}