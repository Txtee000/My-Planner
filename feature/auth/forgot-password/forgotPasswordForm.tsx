"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { submitForgotPassword } from "./submitForgotPassword";

const inputClassName =
  "h-14 w-full rounded-2xl border border-(--color3)/20 bg-(--color1) px-5 text-[16px] font-medium text-(--font) outline-none transition placeholder:text-(--color3)/45 focus:border-(--color4) focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]";

type Message = {
  type: "error" | "success";
  text: string;
};

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(
        "/reset-password"
      )}`;

      await submitForgotPassword({ email, redirectTo });
      setMessage({
        type: "success",
        text: "ส่งลิงก์สำหรับเปลี่ยนรหัสผ่านไปที่อีเมลแล้ว",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "ไม่สามารถส่งอีเมลเปลี่ยนรหัสผ่านได้",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-48px)] text-(--font)">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] items-center justify-center gap-10 py-8 lg:justify-between">
        <div className="hidden max-w-[470px] lg:block">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-(--color2) text-(--color4) shadow-[inset_4px_2px_5px_rgba(255,255,255,0.18),0_8px_18px_rgba(0,0,0,0.38)]">
            <span className="material-symbols-outlined !text-[44px]">
              lock_reset
            </span>
          </div>
          <h1 className="text-[56px] font-bold leading-[1.05] tracking-normal">
            Reset Password
          </h1>
          <p className="mt-5 max-w-[410px] text-[20px] leading-8 text-(--color3)">
            รับลิงก์ทางอีเมลเพื่อกลับมาตั้งรหัสผ่านใหม่
          </p>
        </div>

        <div className="w-full max-w-[460px] rounded-3xl border border-(--color3)/20 bg-(--color2) p-7 shadow-[inset_4px_2px_5px_rgba(255,255,255,0.12),0_18px_36px_rgba(0,0,0,0.42)] sm:p-9">
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color1) text-(--color4)">
                <span className="material-symbols-outlined !text-[30px]">
                  lock_reset
                </span>
              </div>
              <Link
                href="/login"
                className="text-[15px] font-bold text-(--color4) hover:text-(--font)"
              >
                Back to login
              </Link>
            </div>
            <h2 className="text-[34px] font-bold leading-tight">
              Forgot password
            </h2>
            <p className="mt-2 text-[16px] leading-7 text-(--color3)">
              กรอกอีเมลที่ใช้เข้าสู่ระบบ แล้วเปิดลิงก์ในอีเมลเพื่อตั้งรหัสผ่านใหม่
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">Email</span>
              <input
                className={inputClassName}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>

            {message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-[14px] font-bold ${
                  message.type === "error"
                    ? "border-red-400/40 bg-red-500/10 text-red-200"
                    : "border-(--color4)/40 bg-(--color4)/10 text-(--color4)"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-(--color4) text-[18px] font-bold text-(--color1) shadow-[0_10px_20px_rgba(0,173,181,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              <span>{isSubmitting ? "Please wait..." : "Send reset link"}</span>
              <span className="material-symbols-outlined !text-[24px]">
                arrow_forward
              </span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
