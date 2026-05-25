import { Suspense } from "react";
import { isGoogleAuthEnabled } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <RegisterForm googleEnabled={isGoogleAuthEnabled()} />
      </Suspense>
    </div>
  );
}
