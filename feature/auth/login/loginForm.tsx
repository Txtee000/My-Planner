"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitLoginForm } from "./submitLoginForm";

const inputClassName =
  "h-14 w-full rounded-2xl border border-(--color3)/20 bg-(--color1) px-5 text-[16px] font-medium text-(--font) outline-none transition placeholder:text-(--color3)/45 focus:border-(--color4) focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]";
const secondaryButtonClassName =
  "flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-(--color3)/25 bg-(--color1) text-[17px] font-bold text-(--font) transition hover:border-(--color4) hover:text-(--color4)";



export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitLoginForm({
        event,
        email,
        password,
        setEmail,
        setPassword,
      });

      if (result) {
        router.push("/home_page/day");
        router.refresh();
      }
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-48px)] text-(--font)">
      <section className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] items-center justify-center gap-10 py-8 lg:justify-between">
        <div className="hidden max-w-[470px] lg:block">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-(--color2) text-(--color4) shadow-[inset_4px_2px_5px_rgba(255,255,255,0.18),0_8px_18px_rgba(0,0,0,0.38)]">
            <span className="material-symbols-outlined !text-[44px]">
              event_note
            </span>
          </div>
          <h1 className="text-[56px] font-bold leading-[1.05] tracking-normal">
            My Planner
          </h1>
          <p className="mt-5 max-w-[410px] text-[20px] leading-8 text-(--color3)">
            จัดการแผนงาน โน้ต ไทม์ไลน์ รายรับ และการตั้งค่าทั้งหมดในที่เดียว
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {["Notes", "Timeline", "Earns", "Trash"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-(--color3)/15 bg-(--color2) px-5 py-4 text-[18px] font-bold shadow-[2px_1px_10px_rgba(255,255,255,0.08)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[460px] rounded-3xl border border-(--color3)/20 bg-(--color2) p-7 shadow-[inset_4px_2px_5px_rgba(255,255,255,0.12),0_18px_36px_rgba(0,0,0,0.42)] sm:p-9">
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color1) text-(--color4)">
                <span className="material-symbols-outlined !text-[30px]">
                  lock_open
                </span>
              </div>
              <Link
                href="/register"
                className="text-[15px] font-bold text-(--color4) hover:text-(--font)"
              >
                Create account
              </Link>
            </div>
            <h2 className="text-[34px] font-bold leading-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-[16px] leading-7 text-(--color3)">
              เข้าสู่ระบบเพื่อกลับไปจัดการ planner ของคุณ
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">Email</span>
              <input
                className={inputClassName}
                name="email"
                placeholder="you@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">
                Password
              </span>
              <input
                className={inputClassName}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
              />
            </label>

            <div className="flex items-center justify-between gap-4 text-[14px] text-(--color3)">
              <label className="flex items-center gap-3">
                <input className="h-4 w-4 accent-(--color4)" type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="font-bold text-(--color4)">
                Forgot password?
              </Link>
            </div>

            <a
              className={`${secondaryButtonClassName} ${
                isSubmitting ? "pointer-events-none opacity-60" : ""
              }`}
              href="/api/auth/google?next=/home_page/day"
            >
              <span className="material-symbols-outlined !text-[24px]">
                account_circle
              </span>
              <span>Login with Google</span>
            </a>

            <button
              className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-(--color4) text-[18px] font-bold text-(--color1) shadow-[0_10px_20px_rgba(0,173,181,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              <span>{isSubmitting ? "Please wait..." : "Login"}</span>
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
