
import { Skeleton } from "../ui/skeleton";

function AdminStats({ count }: { count: number }) {
   
  return (
    <div className='flex flex-col gap-4 bg-white text-black shadow-sm rounded-lg p-5'>
      <p className=''>Admins</p>
      <p className=''>{count}</p>
    </div>
  );
}


function ManagerStats({count}: { count: number}) {
  
  return (
    <div className='flex flex-col gap-4 bg-white text-black shadow-sm rounded-lg p-5'>
      <p className=''>Managers</p>
      <p className=''>{count}</p>
    </div>
  );
}


function EventsStats() {
   
  return (
    <div className='flex flex-col gap-4 bg-white text-black shadow-sm rounded-lg p-5'>
      <p className=''>No of Active Events</p>
      <p className=''>2</p>
    </div>
  );
}


function StatsSkeleton() {
  return <Skeleton className='w-full aspect-video' />;
}

export { AdminStats, ManagerStats, EventsStats, StatsSkeleton };