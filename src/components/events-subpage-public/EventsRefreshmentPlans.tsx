// components/events-subpage-public/EventsRefreshmentPlans.tsx

const refreshmentStops = [
  {
    label: "Breakfast",
    hole: null,
    icon: "🍳",
    color: "bg-[#1b3a2a]",
    accent: "text-[#d4a831]",
    items: [
      "Boiled yam and egg sauce",
      "Boiled yam and fish sauce",
      "Sandwich and beverage",
      "Cereal and yoghurt",
    ],
    note: "All come with a beverage drink of your choice.",
  },
  {
    label: "Hole 5 Tee-Box",
    hole: "5",
    icon: "⚡",
    color: "bg-[#0f2419]",
    accent: "text-[#d4a831]",
    items: [
      "Nature Valley snack bars - a renowned sports snack for slow-release energy.",
      "Xomie's Treats Zobo — 100% natural unsweetened fruit-packed drink for clean hydration.",
      "A fruit pack — apple and banana.",
      "A chilled bottle of water.",
    ],
    note: "Lets keep those drives piping hot!",
  },
  {
    label: "Hole 10",
    hole: "10",
    icon: "💪",
    color: "bg-[#1b3a2a]",
    accent: "text-[#d4a831]",
    items: [
      "Vita Sip Champion's Spirit Smoothie - hydration, muscle repair, and mental clarity.",
      "Cold towel",
      "A bottle of soft drink and water each",
    ],
    note: "Every stride on the second half will feel wholly revitalised.",
  },
  {
    label: "Hole 13",
    hole: "13",
    icon: "🍺",
    color: "bg-[#0f2419]",
    accent: "text-[#d4a831]",
    items: [
      "A bottle of beer or maltina",
      "Small chops or boli & groundnut — your choice!",
    ],
    note: "Take a breather and give your tummy a nice gentle pat.",
  },
  {
    label: "Hole 17",
    hole: "17",
    icon: "🌴",
    color: "bg-[#1b3a2a]",
    accent: "text-[#d4a831]",
    items: [
      "A gourd of freshly-tapped palm wine",
      "Turkey on us",
    ],
    note: "You deserve to be celebrated for making it this far — let us take you home in style! Cheers!",
  },
];

const lunchMenu = [
  "Jollof rice, fried rice, ample protein, dodo & coleslaw",
  "Amala & abula with ample protein",
  "Iyan & efo riro with ample protein",
  "Eba or semo & edika-ikong or ogbono soup",
];

export default function EventsRefreshmentPlans() {
  return (
    <section className="w-full bg-gray-50">
      <div className="w-full max-w-[1440px] mx-auto px-5 py-12 lg:py-20">
        <h3 className="font-playfair text-2xl sm:text-3xl text-center text-olive font-bold mb-4 uppercase tracking-wide text-[#1b3a2a]">
          Refreshment Plans
        </h3>
        <p className="font-lato text-center text-gray-500 text-base mb-2 max-w-xl mx-auto leading-relaxed">
          It is our pleasure to ensure that your gas tank stays full and healthy
          through 18 holes — for you and your caddy inclusive.
        </p>
        <p className="font-lato text-center text-green-800 font-semibold text-base mb-12">
          A wholesome nourishment plan, all the way to the 18th.
        </p>

        {/* On-course stops */}
        <div className="space-y-5 max-w-3xl mx-auto">
          {refreshmentStops.map((stop, i) => (
            <div
              key={i}
              className={`${stop.color} rounded-xl px-6 py-6 relative overflow-hidden`}
            >
              {/* Hole badge */}
              {stop.hole && (
                <span className="absolute top-4 right-5 font-playfair text-5xl font-bold text-white opacity-10 leading-none select-none">
                  {stop.hole}
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                {/* <span className="text-2xl">{stop.icon}</span> */}
                <div>
                  <p className={`font-playfair font-bold text-lg ${stop.accent}`}>
                    {stop.label}
                  </p>
                </div>
              </div>

              <ul className="space-y-2 mb-3">
                {stop.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 font-lato text-base text-gray-200">
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#d4a831]" />
                    {item}
                  </li>
                ))}
              </ul>

              {stop.note && (
                <p className="font-lato text-sm text-gray-400 italic mt-3">
                  {stop.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Post-game lunch */}
        <div className="max-w-3xl mx-auto mt-8">
          <div className="bg-white border border-green-800 rounded-xl px-6 py-6">
            <div className="flex items-center gap-3 mb-4">
              {/* <span className="text-2xl">🍽️</span> */}
              <div>
                <p className="font-playfair font-bold text-lg text-green-900">
                  Post-Game Lunch
                </p>
                <p className="font-lato text-sm text-gray-500">
                  After a committed round of golf, you deserve a treat and nothing less!
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lunchMenu.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 font-lato text-base text-gray-700 border border-gray-100 rounded-lg px-4 py-3"
                >
                  <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-800" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing Ceremony */}
        <div className="max-w-3xl mx-auto mt-5">
          <div className="bg-white rounded-xl px-6 py-6 text-center">
            <p className="font-playfair font-bold text-xl text-[#1b3a2a] mb-2">
            Closing Ceremony
            </p>
            <p className="font-lato text-base text-[#1b3a2a] leading-relaxed">
              Get ready to be dazzled with quality food, great entertainment, and
              fantastic prizes. Every OB and three-putt will be forgotten here!
            </p>
            <p className="font-lato text-base text-[#0f2419] font-semibold mt-4 leading-relaxed">
              Thank you for celebrating with us as we raise glasses to a wonderful
              new era of excellence and accountable leadership.
            </p>
            <p className="font-playfair italic text-[#1b3a2a] text-lg mt-3">
              May the course always be with you!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
