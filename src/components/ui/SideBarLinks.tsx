"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const routes = [
  {
    title: "Dashboard",
    url: "/dashboard",
  },
  {
    title: "Events",
    url: "/list-events",
  },
  {
    title: "Manage Users",
    url: "/manage-users",
  }
];



export function SideBarLinks() {
  const pathname = usePathname();
  const navLinks = routes;
  const { isMobile, setOpenMobile } = useSidebar()


  return (
    <SidebarGroup>
      <SidebarMenu>
        {navLinks.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className='h-fit!'>
              {/* Close the Sidebar on mobile after clicking a link */}
              <Link href={item.url} className={clsx("font-medium", {"text-green-800 hover:text-green-800/80!": pathname === item.url})} onClick={() => { if (isMobile) { setOpenMobile(false) } }}>
                {item.title}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
