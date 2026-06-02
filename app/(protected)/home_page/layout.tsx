'use client'

import { Navbar } from "@/components/navbar";
import { Overview } from "@/feature/home_page/overview/overview";



export default function Homepage({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return(
        <div className="mx-6 my-2 w-[70vw] h-300">
            <Overview>{children}</Overview>
        </div>
    );
}