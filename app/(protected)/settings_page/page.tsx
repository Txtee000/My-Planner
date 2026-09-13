    'use client'

    import { Setting_account } from "@/feature/settings_page/setting_account/setting_account";
    import { Setting_filter } from "@/feature/settings_page/setting_filter/setting_filter";
    import Setting_task from "@/feature/settings_page/setting_task/setting_task";

    export default function Settings(){
        return(
            <div className="w-[80vw]">
                
                <Setting_account />
                <Setting_task />
                <Setting_filter />
            </div>
        );
    }