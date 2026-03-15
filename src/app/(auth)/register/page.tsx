import type { Metadata } from "next";
import RegisterForm from "@/components/organisms/RegisterForm/RegisterForm";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return <RegisterForm />;
}
