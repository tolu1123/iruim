import EventStatCard from "@/components/event-dashboard/EventStatCard";

export default function EventStats({stats}: {stats: {[key: string]: number}}) {
  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 '>
      {Object.entries(stats).map(([title, count]) => <EventStatCard key={title} title={title} count={count} />)}
    </div>
  )
}
