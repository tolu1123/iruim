import Link from "next/link";
import { MdOutlineCalendarMonth, MdOutlineAccessTime, MdOutlineLocationOn, GoArrowUpRight, LuSquareArrowOutUpRight } from "@/components/icons";

export default function EventsInfo({date, time, location, locationUrl}: {
  date: string, time: string, location: string, locationUrl: string
}) {
  return (
    <div className="w-full md:max-w-5xl mx-auto flex flex-col justify-center text-center md:text-left px-5 my-5">
    <div className="w-full border rounded-xl p-6 bg-white">
      <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between gap-5">

        <div className="flex flex-col sm:flex-row items-center sm:gap-3">
          <div className="text-xl">
            <MdOutlineCalendarMonth size="1.6rem"/>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Date</p>
            <p className="text-gray-600">{ date }</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:gap-3">
          <span className="text-xl">
            <MdOutlineAccessTime size="1.6rem"/>
          </span>
          <div>
            <p className="font-semibold text-gray-800">Time</p>
            <p className="text-gray-600">{ time }</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:gap-3">
          <span className="text-xl">
            <MdOutlineLocationOn size="1.6rem"/>
          </span>
          <div>
            <p className="font-semibold text-gray-800">Location</p>
            <Link href={locationUrl ? locationUrl : "#"} className={`${locationUrl ? "text-[#1b3a2a]" :"text-gray-600"} whitespace-pre-line inline-block`}>
              { location }
              <br />
              <span className="text-sm inline text-underline">(Click to get directions to the event venue <LuSquareArrowOutUpRight size="0.875rem" className="inline!" /> )</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  </div>
  )
}
