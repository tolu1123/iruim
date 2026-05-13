import { AppSidebar } from "@/components/app-sidebar";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function adminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b'>
          <nav className='w-full flex flex-row-reverse md:flex-row justify-between md:justify-start items-center gap-2 px-3'>
            <SidebarTrigger className=' text-2xl! !md:hidden' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Link
              href='/'
              className='flex items-center gap-2 font-manrope font-bold text-xl'
            >
              <Image
                src='/platinum24-logo.png'
                alt='Platinum24 logo'
                width='140'
                height='30'
              />
            </Link>
          </nav>
        </header>
        <>{children}</>
      </SidebarInset>
    </SidebarProvider>
  );
}
