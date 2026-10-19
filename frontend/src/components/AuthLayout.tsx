import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center  p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-xl border border-gray-300  p-8 sm:p-10">
        {children}
      </div>
    </div>
  );
}