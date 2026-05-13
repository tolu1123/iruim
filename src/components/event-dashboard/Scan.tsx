import Link from "next/link";
import { BsQrCodeScan, GoChevronRight } from "@/components/icons";

export default function Scan({eventId}: {eventId: string}) {
  return (
    <Link href={`/list-events/${eventId}/scan`}>
      <div className='flex items-center gap-4 bg-green-800 text-white rounded-lg p-5 mb-4'>
        <div className=''>
          <BsQrCodeScan className='size-10 text-white' />
        </div>
        <div className='flex-1 flex items-center justify-between'>
          <div className='flex flex-col'>
            <p className='text-lg'>QR Scanner</p>
            <p className='text-base'>Tap to scan invitee QR code</p>
          </div>
          <div className=''>
            <GoChevronRight className='h-6 w-6 text-white' />
          </div>
        </div>
      </div>
    </Link>
  );
}

