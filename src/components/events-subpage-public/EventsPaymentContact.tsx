// components/events-subpage-public/EventsPaymentContact.tsx

export default function EventsPaymentContact() {
  return (
    <section className="w-full bg-[#1b3a2a] my-10">
      <div className="w-full max-w-[1440px] mx-auto px-5 py-12 lg:py-20">
        <h3 className="font-playfair text-2xl sm:text-3xl text-center text-[#d4a831] font-bold mb-10 uppercase tracking-wide">
          Payment & Sponsorship
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#0f2419] rounded-lg px-8 py-8 max-w-3xl mx-auto">
          {/* Account Details */}
          <div className="text-white">
            <p className="text-base font-lato uppercase tracking-widest text-gray-400 mb-3">
              Account Details
            </p>
            <p className="font-lato text-2xl font-bold tracking-wider mb-1">
              2006323672
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base font-lato text-gray-300">
                Ibadan Golf Club
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-base font-lato text-gray-300">FCMB</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-[#2d5a3d]" />
          <div className="block md:hidden w-full h-px bg-[#2d5a3d]" />

          {/* Contact Numbers */}
          <div className="text-white text-center md:text-right">
            <p className="text-base font-lato uppercase tracking-widest text-gray-400 mb-3">
              Contact
            </p>
            <p className="font-lato text-lg font-semibold tracking-wide mb-1">
              +234 803 608 2541
            </p>
            <p className="font-lato text-lg font-semibold tracking-wide">
              +234 803 491 5475
            </p>
          </div>
        </div>

        {/* Entry Fee callout */}
        <div className="mt-8 flex justify-center">
          <div className="border border-[#d4a831] rounded-full px-6 py-2 flex items-center gap-3">
            <span className="text-base font-lato uppercase tracking-widest text-gray-400">
              Entry Fee
            </span>
            <span className="text-[#d4a831] font-playfair text-xl font-bold">
              ₦30,000
            </span>
            <span className="text-gray-400 text-sm font-lato">
              + ₦5,000 caddy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
