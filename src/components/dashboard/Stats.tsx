import { Suspense } from "react";
import {
  AdminStats,
  ManagerStats,
  EventsStats,
  StatsSkeleton,
} from "./StatCards";

export default async function Stats({ adminNo, managerNo }: { adminNo: number; managerNo: number }) {
  return (
    <div className=''>
      <h3 className='font-playfair text-3xl font-bold mb-6'>Dashboard Stats</h3>
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 '>
        <Suspense fallback={<StatsSkeleton />}>
          <AdminStats count={adminNo} />
        </Suspense>
        <Suspense fallback={<StatsSkeleton />}>
          <ManagerStats count={managerNo} />
        </Suspense>
        <Suspense fallback={<StatsSkeleton />}>
          <EventsStats />
        </Suspense>
      </div>
    </div>
  );
}
