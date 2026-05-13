import Link from "next/link"
import { Button } from "@/components/ui/button"


function Paragraph({text}: {text: string}) {
  return (<div className="mb-2">
    {text}
  </div>)
}


export default function EventsAbout({description, registrationLink}: {
  description: string, registrationLink: string
}) {
  const processedText = description.split("\n");
  const paragraphs = processedText.map((t, i) => <Paragraph key={i} text={t} />)
  return (
    <section className="w-full">
    <div className="w-full max-w-[1440px] mx-auto px-5 pt-10 lg:pt-20">
      <h3 className="font-playfair text-2xl sm:text-3xl text-center text-olive font-bold mb-6">
        About This Event
      </h3>
      <div className="font-lato text-lg text-center">
        { paragraphs }
      </div>

      <div className="mt-10 sm:mt-14 flex items-center justify-center">
        <Button asChild className="border border-[#1b3a2a] bg-white hover:bg-[#1b3a2a]! text-[#1b3a2a] hover:text-white w-40 h-12 rounded-none">
          <Link href={`${registrationLink || '#'}`} className="block px-4 py-3">
            Register for Event
          </Link>
        </Button>
      </div>
    </div>
  </section>
  )
}


