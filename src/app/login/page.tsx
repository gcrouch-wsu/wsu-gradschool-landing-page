import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div
        className="h-1.5 w-full bg-gradient-to-r from-[var(--wsu-crimson)] from-[40%] to-[var(--wsu-gray-mid)] to-[40%]"
        aria-hidden
      />
      <header className="border-b border-[var(--wsu-gray-light)] bg-white px-5 py-4">
        <Link href="/" className="text-sm font-semibold text-[var(--wsu-crimson)] hover:underline">
          ← Back to directory
        </Link>
      </header>
      <LoginForm />
    </>
  );
}
