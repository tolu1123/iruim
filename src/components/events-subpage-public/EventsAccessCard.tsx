// components/events-subpage-public/EventsAccessCard.tsx

const checkpoints = [
  "To check in as a player.",
  "To collect your souvenir and goodie bags.",
  "To get your breakfast of choice.",
  "To get your post-game lunch.",
];

export default function EventsAccessCard() {
  return (
    <section className="w-full bg-white">
      <div className="w-full max-w-[1440px] mx-auto px-5 py-12 lg:py-20">
        <h3 className="font-playfair text-2xl sm:text-3xl text-center text-olive font-bold mb-4 uppercase tracking-wide text-[#1b3a2a]">
          Access Card Privileges
        </h3>

        <p className="font-lato text-center text-gray-500 text-base uppercase tracking-widest mb-10">
          For Fully Registered Players
        </p>

        {/* Card visual */}
        <div className="max-w-3xl mx-auto bg-[#1b3a2a] rounded-2xl p-8 mb-10 relative overflow-hidden">
          {/* Decorative circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#d4a831] opacity-10" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white opacity-5" />

          <p className="font-playfair text-[#d4a831] text-lg font-bold mb-1 relative z-10">
            IGC — Ibadan Golf Club
          </p>
          <p className="font-lato text-white text-base uppercase tracking-widest mb-6 relative z-10">
            Captain Inaugural Golf Tournament · 2026
          </p>

          <p className="font-lato text-gray-300 text-base leading-relaxed relative z-10">
            If you're a fully registered player, you should have received your
            unique access card by now. Each card can only be used by{" "}
            <span className="text-white font-semibold">one player</span> for a{" "}
            <span className="text-white font-semibold">one-time access</span> to
            our carefully curated player privileges.
          </p>
        </div>

        {/* Checkpoints */}
        <div className="max-w-3xl mx-auto">
          <p className="font-lato text-base uppercase tracking-widest text-gray-400 mb-5 text-center">
            Present your access card at the following points
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checkpoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border border-green-800 rounded-lg px-5 py-4"
              >
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#1b3a2a] text-white text-sm flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <p className="font-lato text-base text-gray-700">{point}</p>
              </div>
            ))}
          </div>

          <p className="font-lato text-base text-gray-500 text-center mt-8 leading-relaxed">
            For the planned on-course nourishment for you and your caddy,
            respective tickets will be attached to your score cards.{" "}
            <span className="text-green-800 font-semibold">
              See you on the course!
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
