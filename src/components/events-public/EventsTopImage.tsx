import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function EventsTopImage() {
  return (
    <div className='relative'>
      <Carousel>
        <CarouselContent>
          <CarouselItem className='w-full'>
            <div className='relative w-full min-h-[80vh] xl:min-h-[700px] flex flex-col items-center justify-center text-white text-center overflow-hidden bg-black/40'>
              <Image
                fill
                src='/Plat_Banner-Mobile.jpg'
                alt='First Anniversary Dinner & Award Ceremony'
                className='absolute z-1 inset-0 w-full h-full object-contain sm:hidden'
              />
              <Image
                fill
                src='/Plat_Banner-01.jpg'
                alt='First Anniversary Dinner & Award Ceremony'
                className='absolute z-1 inset-0 w-full h-full object-contain hidden sm:block'
              />
              <div className='absolute z-2 inset-0 bg-[radial-gradient(circle,transparent_25%,rgba(0,0,0,0.9)_100%)]' />
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
