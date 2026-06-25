'use client'

import { Setting_account } from "@/feature/settings_page/setting_account/setting_account";
import Setting_task from "@/feature/settings_page/setting_task/setting_task";



export default function Settings(){




    return(
        <div className="">
            
            <Setting_account />
            <Setting_task />
        </div>
    );
}