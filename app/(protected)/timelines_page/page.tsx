'use client'

import { Navbar } from "@/feature/components/navbar";
import { Table } from "@/feature/timeline_page/table";



export default function Timelines(){
    return(
        <div className="mx-6 my-4">
            <Table />
        </div>
    );
}