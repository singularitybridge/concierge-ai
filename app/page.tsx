import Link from 'next/link';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Full Page Background Image */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-4">
              Niseko, Hokkaido
            </p>
            <h1
              className="text-5xl md:text-6xl font-light text-white tracking-wide mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              THE 1898 NISEKO
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mb-6" />
            <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
              Experience the harmony of century-old Japanese hospitality
              enhanced by thoughtful technology.
            </p>
          </div>

          {/* Portal Options */}
          <div className="space-y-2">
            <Link
              href="/register"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Grand Opening Registration</p>
            </Link>

            <Link
              href="/guest-login"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Guest Portal</p>
            </Link>

            <Link
              href="/login"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Staff Portal</p>
            </Link>

            <Link
              href="/shop"
              className="block p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors text-center"
            >
              <p className="text-sm text-stone-800">Hotel Boutique</p>
            </Link>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-white/50">
            Powered by AI hospitality technology
          </p>
        </div>
      </div>
    </div>
  );
}
