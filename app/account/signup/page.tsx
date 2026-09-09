import type { Metadata } from "next";
import { SignupView } from "@/components/account/signup-view";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default function SignupPage() {
  return <SignupView />;
}
