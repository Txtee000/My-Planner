'use client'

import { Navbar } from "@/feature/components/navbar";
import { Overview } from "@/feature/home_page/overview/overview";
import { Status_Task } from "@/feature/home_page/status_task/status_task";



export default function Homepage({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return(
        <div className="mx-6 my-2">
            <Overview>{children}</Overview>
            <Status_Task />
        </div>
    );
}