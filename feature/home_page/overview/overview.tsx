"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";




const navItems = [
  { href: "/home_page/day", label: "Day" },
  { href: "/home_page/week", label: "Week" },
  { href: "/home_page/month", label: "Month" },
];

export function Overview({
    children,
} : Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const activeIndex = navItems.findIndex((item) => item.href === pathname);
    const safeActiveIndex = activeIndex === -1 ? 0 : activeIndex;



    return(
        <div>
            {/* header */}
            <div className="text-[32px] font-bold text-(--font) mb-4">Overview</div>

            <div className="p-4 w-full rounded-4xl bg-(--color2) relative">

                <div className="relative flex items-center bg-(--color5) w-[273px] h-[36px] justify-around border-2 border-(--font) rounded-4xl overflow-hidden">
                    {/* active background */}
                    <div
                        className="absolute top-0 left-0 h-full w-1/3 bg-(--color4) rounded-4xl transition-transform duration-300"
                        style={{
                            transform: `translateX(${safeActiveIndex * 100}%)`,
                        }}
                    />

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                relative z-10 flex-1 h-full flex items-center justify-center
                                font-bold transition-colors duration-300
                                ${isActive ? "text-(--color2)" : "text-(--font)"}
                            `}
                        >
                            {item.label}
                        </Link>
                        );
                    })}
                </div>
                
                <div>{children}</div>



            </div>
        </div>
    );
}