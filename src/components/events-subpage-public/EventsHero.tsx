
export default function EventsHero({ title }: { title: string}) {
  return (
    <div className="w-full xl:max-w-[1440px] mx-auto flex flex-col justify-center text-center md:text-left px-5 my-16">
    <div className="sm:w-3/4 lg:w-2/3 mx-auto flex flex-col items-center text-center mt-24 lg:mt-36 mb-5">
      <h2 className='font-playfair text-3xl sm:text-4xl lg:text-5xl text-olive font-bold mb-4'>
        { title }
      </h2>
      <p className='font-lato text-xl max-w-xl'>
        A prestigious gathering celebrating the timeless spirit of golf and camaraderie.
      </p>
    </div>
  </div>
  )
}
