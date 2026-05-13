import * as React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import SidebarClose from "@/components/ui/SidebarClose";
import { SideBarLinks } from "@/components/ui/SideBarLinks";
import { FiLogOut } from "@/components/icons";

import signOut from "@/actions/signOut";

export async function AppSidebar({ ...props }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <Link
                href='/'
                className='font-manrope font-bold text-xl text-green-800'
              >
                <Image
                  src='/platinum24-logo.png'
                  alt='Platinum24 logo'
                  width='116'
                  height='25'
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarClose />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SideBarLinks />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton type='submit'>
                <FiLogOut className='text-red-500' />
                <span className='font-dm_sans font-normal text-base text-red-500'>
                  Logout
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
