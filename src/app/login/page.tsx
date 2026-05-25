import { Suspense } from "react";
import { isGoogleAuthEnabled } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center">Loading...</div>}>
      <LoginForm googleEnabled={isGoogleAuthEnabled()} />
    </Suspense>
  );
}
