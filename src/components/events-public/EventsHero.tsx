import Image from "next/image";
export default function EventsHero() {
  return (
    <div className="w-full xl:max-w-[1440px] mx-auto flex flex-col justify-center text-center md:text-left px-5 pt-38 lg:pt-50">
    <div className="sm:w-3/4 lg:w-2/3 mx-auto flex flex-col items-center text-center">
      <Image src="/golf-flag-events.png" alt="Golf flag and ball" width="100" height="100" />
      <h2 className='font-playfair text-3xl sm:text-4xl lg:text-7xl text-olive font-bold mb-4'>
        Experience Our Premier Events
      </h2>
      <p className='font-lato text-xl'>
        Join the Platinum 2024 Inductee Class Golf Caucus for a series of exclusive golf tournaments and social gatherings. From competitive play to elegant networking, our events are meticulously planned to offer an unparalleled experience.
      </p>
    </div>
  </div>
  )
}
