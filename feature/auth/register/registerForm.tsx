"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { submitRegisterForm } from "./submitRegisterForm";

const inputClassName =
  "h-14 w-full rounded-2xl border border-(--color3)/20 bg-(--color1) px-5 text-[16px] font-medium text-(--font) outline-none transition placeholder:text-(--color3)/45 focus:border-(--color4) focus:shadow-[0_0_0_4px_rgba(0,173,181,0.16)]";
const secondaryButtonClassName =
  "flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-(--color3)/25 bg-(--color1) text-[17px] font-bold text-(--font) transition hover:border-(--color4) hover:text-(--color4)";

export function RegisterForm() {
  const router = useRouter();
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setLinkedEmail(data.user.email);
      }
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitRegisterForm({
        username,
        password,
        confirmPassword,
        setUsername,
        setPassword,
        setConfirmPassword,
      });
      if (result) {
        router.push("/home_page");
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
                  person_add
                </span>
              </div>
              <Link
                href="/login"
                className="text-[15px] font-bold text-(--color4) hover:text-(--font)"
              >
                Sign in
              </Link>
            </div>
            <h2 className="text-[34px] font-bold leading-tight">
              Create account
            </h2>
            <p className="mt-2 text-[16px] leading-7 text-(--color3)">
              สมัครบัญชีเพื่อเริ่มจัดการ planner ของคุณ
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">
                Username
              </span>
              <input
                className={inputClassName}
                name="username"
                placeholder="yourname"
                required
                type="text"
                value={username}
                onChange={ (e) => setUsername(e.target.value) }
              />
            </label>

            <div className="rounded-2xl border border-(--color3)/15 bg-(--color1) p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[15px] font-bold">Google email</span>
                <span
                  className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                    linkedEmail
                      ? "bg-(--color4) text-(--color1)"
                      : "bg-(--color2) text-(--color3)"
                  }`}
                >
                  {linkedEmail ? "Linked" : "Not linked"}
                </span>
              </div>
              <p className="mb-3 break-words text-[14px] leading-6 text-(--color3)">
                {linkedEmail ??
                  "กดปุ่มด้านล่างเพื่อผูก email จาก Google กับบัญชีนี้"}
              </p>
              <a
                className={`${secondaryButtonClassName} ${
                  isSubmitting ? "pointer-events-none opacity-60" : ""
                }`}
                href="/api/auth/google?next=/register"
              >
                <span className="material-symbols-outlined !text-[24px]">
                  account_circle
                </span>
                <span>
                  {linkedEmail ? "เปลี่ยน Google email" : "ผูก Email with Google"}
                </span>
              </a>
            </div>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">
                Password
              </span>
              <input
                className={inputClassName}
                name="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={ (e) => setPassword(e.target.value) }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[15px] font-bold">
                Confirm password
              </span>
              <input
                className={inputClassName}
                name="confirmPassword"
                placeholder="••••••••"
                required
                type="password"
                value={confirmPassword}
                onChange={ (e) => setConfirmPassword(e.target.value) }
              />
            </label>

            <button
              className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-(--color4) text-[18px] font-bold text-(--color1) shadow-[0_10px_20px_rgba(0,173,181,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || !linkedEmail}
              type="submit"
            >
              <span>{isSubmitting ? "Please wait..." : "Register"}</span>
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
