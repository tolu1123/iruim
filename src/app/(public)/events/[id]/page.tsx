import EventsAbout from "@/components/events-subpage-public/EventsAbout";
import EventsHero from "@/components/events-subpage-public/EventsHero";
import EventsInfo from "@/components/events-subpage-public/EventsInfo";
import { createClient } from "@/lib/supabase/server";

import Link from "next/link";
import { FaArrowDown, PiWineFill, LuUtensilsCrossed, LuSquareArrowOutUpRight } from "@/components/icons";

export function formatTime(t: string) {
  const [hour, minute] = t.split(":").map(Number);
  const period = hour! >= 12 ? "PM" : "AM";
  const hour12 = hour! % 12 || 12;

  return `${hour12}:${minute!.toString().padStart(2, "0")} ${period}`;
}

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(
      `Failed to fetch events, check your internet connection, ${error}`
    );
  }
  const eventDate = new Intl.DateTimeFormat("en-US", {
    month: "long", // "May"
    day: "numeric", // "15"
    year: "numeric", // "2025"
  }).format(new Date(data.date));

  const eventTime = formatTime(data.time);

  return (
    <>
      <EventsHero title={data.title} />
      <EventsInfo
        date={eventDate}
        time={eventTime}
        location={data.location}
        locationUrl={data.locationUrl}
      />
      {data?.extra_buttons && data.extra_buttons.length > 0 && <EventsExtras extraButtonDetails={data.extra_buttons}/>}
      <EventsAbout
        description={data.description}
        registrationLink={data.registrationLink}
      />
    </>
  );
}

function EventsExtras({
  extraButtonDetails,
}: {
  extraButtonDetails: {
    name: string;
    link: string;
    alt: string;
    "link-action": string;
  }[];
}) {
  const buttons = extraButtonDetails.map((ele, i) => {
    if(ele["link-action"] === "link") {
      return <GoToLink key={i} data={ele} />
    }

    else {
      return <DownloadLink key={i} data={ele} />
    }
  })
  return (
    <section className='w-full'>
      <div className='w-full max-w-[1440px] mx-auto px-5 pt-10 lg:pt-20'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {buttons}
        </div>
      </div>
    </section>
  );
}

function DownloadLink({data}: {data:{ 
    name: string;
    link: string;
    alt: string;
    "link-action": string;
  }}) {
  return (
    <Link
      href={data.link}
      download
      aria-label={data.alt}
      locale={false}
      target='_blank'
      className='px-6 py-3 flex items-center justify-center gap-2 rounded-full bg-green-800/20 backdrop-blur-md border border-green-800/30 shadow-lg hover:bg-green-800/30 hover:backdrop-blur-lg transition-all duration-300 text-green-800 font-medium'
    >
      {data.name} {data.name =="View Food Menu"? <LuUtensilsCrossed size={20} className='' />: <PiWineFill size={20} className='' />}
    </Link>
  );
}


function GoToLink({data}: {data:{ 
    name: string;
    link: string;
    alt: string;
    "link-action": string;
  }}) {
  return (
    <Link
      href={data.link}
      aria-label={data.alt}
      target='_blank'
      className='px-6 py-3 flex items-center justify-center gap-2 rounded-full bg-green-800/20 backdrop-blur-md border border-green-800/30 shadow-lg hover:bg-green-800/30 hover:backdrop-blur-lg transition-all duration-300 text-green-800 font-medium'
    >
      {data.name} <LuSquareArrowOutUpRight size={20} className='' />
    </Link>
  )
}