"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarMenuItem, SidebarTrigger } from "./sidebar";
import { cn } from "@/lib/utils";
import { RiCloseLargeFill } from "@/components/icons";

function SidebarClose() {
  const isMobile = useIsMobile(); 
  return (
    <SidebarMenuItem className={cn(isMobile ? "absolute -left-12 top-0" : "hidden")}>
        <SidebarTrigger className="p-5 bg-transparent!" icon={<RiCloseLargeFill  className="text-white size-6"/>}/>
    </SidebarMenuItem>
  );
}

export default SidebarClose;
