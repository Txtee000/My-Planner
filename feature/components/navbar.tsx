"use client";

import { getAccount } from "@/services/authService";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Account = {
  username: string;
};

const navItems = [
  {
    href: "/home_page/day",
    activePath: "/home_page",
    icon: "home",
    label: "Home",
  },
  {
    href: "/notes_page",
    activePath: "/notes_page",
    icon: "sticky_note_2",
    label: "Notes",
  },
  {
    href: "/timelines_page",
    activePath: "/timelines_page",
    icon: "view_timeline",
    label: "Timelines",
  },
  {
    href: "/earn_page",
    activePath: "/earn_page",
    icon: "money_bag",
    label: "Earns",
  },
  {
    href: "/trashes_page",
    activePath: "/trashes_page",
    icon: "delete",
    label: "Trashes",
  },
  {
    href: "/settings_page",
    activePath: "/settings_page",
    icon: "settings",
    label: "Settings",
  },
];

export function Navbar() {  
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setLoading] = useState(false); //coming soon -> will change to skeleton loading

  const pathname = usePathname();


  useEffect(() => {
    async function fetchAccount(){
      try{
        setLoading(true);
        const data = await getAccount();
        setAccount(data);
      } catch (error){
        console.error("Error fetching account data: ", error);
      } finally{
        setLoading(false)
      }
    }

    fetchAccount();
  }, []);

  return (
    <div className="fixed z-20">
        <div className=" flex justify-between items-center p-4 w-[240px] h-[72px] bg-(--color2) shadow-[inset_4px_2px_5px_rgba(255,255,255,0.18),0_6px_8px_rgba(0,0,0,0.55)] rounded-3xl text-[20px] font-bold text-(--font)"> 
            <div className="flex items-center">
                <div className="rounded-[100%] bg-white w-[36px] h-[36px]"></div>
                <div className="ml-4 text-[18px]">{account ? account.username : "Guest"} </div>
            </div>
            <div className="flex items-center">
                <div className="w-2 h-2 mr-2 bg-green-500 rounded-full" />
                <div className="text-[12px]">Live</div>
            </div>
            
        </div>

        <div className="mt-4 p-8 flex flex-col justify-between bg-(--color2) w-[208px] h-[400px] rounded-3xl border border-[1px] border-(--font) shadow-[2px_1px_10px_rgba(255,255,255,0.2)]">
            {navItems.map((item) => {
                 const isActive = pathname.startsWith(item.activePath);


                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${isActive ? "text-(--color4)" : "text-(--font)"} flex items-center hover:text-(--color4) cursor-pointer`}
                    >
                        <span className="material-symbols-outlined !text-[32px] pb-1 pr-4">{item.icon}</span>
                        <div className="font-bold text-[18px]">{item.label}</div>
                    </Link>
                );
            })}
        </div>
    </div>
  );
}
