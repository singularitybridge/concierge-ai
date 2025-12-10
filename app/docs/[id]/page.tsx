'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Shield, ClipboardList, BookOpen, LogOut, ChevronRight } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';
import { useAuth } from '../../hooks/useAuth';

const documents: Record<string, {
  title: string;
  icon: typeof Sparkles;
  lastUpdated: string;
  sections: { heading: string; content: string[] }[];
}> = {
  'guest-experience': {
    title: 'Guest Experience Standards',
    icon: Sparkles,
    lastUpdated: 'November 2025',
    sections: [
      {
        heading: 'VIP Guest Protocols',
        content: [
          'Pre-arrival: Review guest history 48 hours before check-in. Note preferences, allergies, and special occasions.',
          'Welcome amenity: Prepare personalized welcome basket with local Hokkaido treats and handwritten note from GM.',
          'Room assignment: VIP guests receive complimentary upgrade when available. Ensure room is inspected by supervisor.',
          'Dedicated contact: Assign personal concierge for duration of stay. Provide direct contact number.',
        ],
      },
      {
        heading: 'Complaint Resolution Framework',
        content: [
          'LISTEN: Allow guest to fully express concern without interruption. Maintain eye contact and empathetic posture.',
          'APOLOGIZE: Offer sincere apology regardless of fault. "I\'m sorry this happened during your stay with us."',
          'SOLVE: Propose immediate solution. Empower staff to offer up to ¥10,000 in compensation without manager approval.',
          'THANK: Thank guest for bringing issue to attention. "Your feedback helps us improve."',
          'FOLLOW-UP: Check back within 2 hours to ensure resolution. Document in guest profile.',
        ],
      },
      {
        heading: 'Service Recovery Guidelines',
        content: [
          'Minor issue (delayed service, wrong order): Immediate apology + complimentary item or 10% discount',
          'Moderate issue (room not ready, facility unavailable): Apology + upgrade or complimentary dining',
          'Major issue (safety concern, significant inconvenience): Manager involvement + substantial compensation + follow-up letter from GM',
          'All recoveries must be logged in PMS within 24 hours for tracking and pattern analysis.',
        ],
      },
      {
        heading: 'Personalization Standards',
        content: [
          'Remember and use guest names after first introduction (minimum 3 times during interaction).',
          'Note preferences in real-time: pillow type, room temperature, dining preferences, activity interests.',
          'Anticipate needs: If guest mentions early flight, proactively offer early breakfast or packed option.',
          'Celebrate occasions: Birthdays, anniversaries, and special events warrant complimentary gesture.',
        ],
      },
    ],
  },
  'emergency-procedures': {
    title: 'Emergency Procedures',
    icon: Shield,
    lastUpdated: 'December 2025',
    sections: [
      {
        heading: 'Fire Emergency Protocol',
        content: [
          'DISCOVER: If you discover fire, activate nearest alarm pull station immediately.',
          'ALERT: Call front desk (ext. 0) and state: location, type of fire, your name.',
          'EVACUATE: Guide guests to nearest exit. Do not use elevators. Assist mobility-impaired guests.',
          'Assembly points: Main parking lot (primary), Ski shuttle area (secondary).',
          'Account for all guests using room occupancy list. Report missing persons to fire commander.',
        ],
      },
      {
        heading: 'Medical Emergency Response',
        content: [
          'Call emergency services: 119 (fire/ambulance) or front desk ext. 0 for hotel response team.',
          'Do not move injured person unless immediate danger exists.',
          'AED locations: Front desk, spa entrance, ski equipment room, restaurant.',
          'First aid kits: Every floor utility closet, kitchen, spa, and all staff areas.',
          'Designate staff member to meet ambulance at main entrance and guide to location.',
        ],
      },
      {
        heading: 'Avalanche & Severe Weather',
        content: [
          'Monitor Niseko avalanche advisory daily. Post warning level at ski concierge desk.',
          'Level 3+ advisory: No off-piste activities. Inform all guests of conditions.',
          'Blizzard conditions: Account for all guests. Secure outdoor furniture. Stock emergency supplies.',
          'Guest notification: Use room phones, in-app alerts, and door-to-door check for severe warnings.',
          'Emergency supplies maintained: 72 hours of food, water, medical supplies, and backup power.',
        ],
      },
      {
        heading: 'Earthquake Response',
        content: [
          'During shaking: DROP, COVER, HOLD ON. Move away from windows and heavy objects.',
          'After shaking stops: Check for injuries, evacuate if structural damage visible.',
          'Do not use elevators. Check gas lines for leaks. Turn off if smell detected.',
          'Tsunami risk: Niseko is inland and not at risk. Reassure guests if concerned.',
          'Communication: Use battery-powered radio if power fails. Emergency channel: NHK.',
        ],
      },
    ],
  },
  'housekeeping-manual': {
    title: 'Housekeeping Operations',
    icon: ClipboardList,
    lastUpdated: 'October 2025',
    sections: [
      {
        heading: 'Daily Room Cleaning Standards',
        content: [
          'Entry protocol: Knock three times, announce "Housekeeping", wait 10 seconds before entry.',
          'Bed making: Hospital corners, pillow fluffing, decorative arrangement per room type.',
          'Bathroom: All surfaces sanitized, towels replaced, amenities restocked to full complement.',
          'Vacuum all floors including under furniture edges. Dust all surfaces and fixtures.',
          'Check all lights, TV remote batteries, and report any maintenance issues immediately.',
        ],
      },
      {
        heading: 'Turndown Service (6PM - 8PM)',
        content: [
          'Close curtains/blinds. Turn on bedside lamps at lowest setting.',
          'Turn down bed at 45-degree angle on guest\'s preferred side (check profile).',
          'Place slippers at bedside. Lay out yukata if not already used.',
          'Refresh water glasses and place chocolate on pillow.',
          'Set room temperature to 22°C unless guest preference noted.',
        ],
      },
      {
        heading: 'Amenity Standards',
        content: [
          'Bathroom amenities: Shampoo, conditioner, body wash, lotion (Hokkaido lavender line).',
          'Replenish when below 50% full. Never top off—replace with fresh bottles.',
          'Towel allocation: 2 bath, 2 hand, 2 face towels per guest. Plus onsen towel set.',
          'Tea station: Refresh green tea, hojicha selection daily. Check kettle cleanliness.',
          'Mini bar: Check and restock daily. Log consumption in PMS before 10AM.',
        ],
      },
      {
        heading: 'Deep Cleaning Schedule',
        content: [
          'Weekly: Under-bed vacuum, window cleaning interior, air vent dusting.',
          'Monthly: Mattress rotation, curtain inspection, grout deep clean.',
          'Quarterly: Carpet deep extraction, upholstery cleaning, HVAC filter change.',
          'Between guests: Full sanitization protocol, linen change, amenity reset.',
        ],
      },
    ],
  },
  'concierge-guide': {
    title: 'Concierge Service Guide',
    icon: BookOpen,
    lastUpdated: 'November 2025',
    sections: [
      {
        heading: 'Dining Recommendations',
        content: [
          'Fine Dining: Kamimura (French-Japanese, reservations essential), Rakuichi Soba (handmade noodles).',
          'Casual: Niseko Pizza, Bang Bang (craft burgers), Graubunden (Swiss fondue).',
          'Local favorites: Niseko Ramen, Prativo (farm-to-table Italian), A-Bu-Cha 2.',
          'Our Restaurant - Yuki: Kaiseki dinner 6PM-9PM, breakfast 7AM-10AM. Guests have priority.',
          'Always call ahead for parties of 4+. Confirm dietary requirements when booking.',
        ],
      },
      {
        heading: 'Ski & Snow Activities',
        content: [
          'Lift passes: Available at front desk. Recommend multi-day for savings.',
          'Equipment rental: Rhythm Japan (premium), Niseko Sports (budget-friendly).',
          'Lessons: NISS (Niseko International Snowsports School) - book 48 hours ahead.',
          'Cat skiing: Arrange through Niseko Weiss or Shimamaki. Full day ¥80,000+.',
          'Snowshoeing: Guided tours through Hokkaido Tracks. Morning tours best for wildlife.',
        ],
      },
      {
        heading: 'Transportation',
        content: [
          'New Chitose Airport: 2.5 hours by car. Arrange pickup ¥25,000 one way.',
          'Niseko United shuttle: Complimentary between our hotel and Hirafu gondola.',
          'Private car: Contact Hokkaido Access for day charters. From ¥50,000/day.',
          'Taxi: Niseko Hire available 24/7. Book through front desk for reliability.',
          'Train: JR to Kutchan station (20 min drive). Scenic but limited schedule.',
        ],
      },
      {
        heading: 'Local Experiences',
        content: [
          'Onsen day trips: Goshiki Onsen (mountain views), Yugokorotei (traditional).',
          'Sake brewery: Niseko Shuzo offers tours with tastings. Reservation required.',
          'Milk kobo: Fresh dairy products, must-try cream puffs and soft serve.',
          'Night photography: Arrange guide for star photography at Lake Hangetsu.',
          'Summer: Rafting on Shiribetsu River, golf at Niseko Village, hiking Mt. Yotei.',
        ],
      },
    ],
  },
};

// Convert document to plain text for the AI context
function getDocumentContent(doc: typeof documents[string]): string {
  let content = `# ${doc.title}\n\n`;
  doc.sections.forEach(section => {
    content += `## ${section.heading}\n`;
    section.content.forEach(item => {
      content += `- ${item}\n`;
    });
    content += '\n';
  });
  return content;
}

export default function DocumentPage() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const docId = params.id as string;
  const doc = documents[docId];

  useEffect(() => {
    if (isAuthenticated) {
      setMounted(true);
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!doc) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Image
          src="/hotel3.jpg"
          alt="The 1898 Niseko"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/50 mb-4">Document not found</p>
            <Link href="/admin" className="text-amber-400 hover:text-amber-300 underline">
              Return to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = doc.icon;
  const documentContent = getDocumentContent(doc);

  // Navigation menu items
  const menuItems = [
    { label: 'Register', href: '/register' },
    { label: 'Staff Portal', href: '/admin', active: true },
    { label: 'Shop', href: '/shop' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Page Background */}
      <Image
        src="/hotel3.jpg"
        alt="The 1898 Niseko"
        fill
        className="object-cover"
        priority
      />

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-stone-900/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Content */}
      <div className={`relative z-10 h-screen flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between px-8 py-4 flex-shrink-0">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-cormorant)' }}>18</span>
            </div>
            <div>
              <h1
                className="text-xl font-light text-white tracking-wide leading-tight group-hover:text-amber-200 transition-colors"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                THE 1898
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Niseko</p>
            </div>
          </Link>

          {/* Center - Menu Items */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  item.active
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right - Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <span className="text-sm">Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </nav>

        {/* Breadcrumbs */}
        <div className="px-8 pb-3 flex-shrink-0">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="text-white/50 hover:text-white transition-colors"
            >
              Staff Portal
            </Link>
            <ChevronRight className="w-4 h-4 text-white/30" />
            <span className="text-white/80">{doc.title}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 px-8 pb-6 min-h-0">
          {/* Left Column - Document Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl flex-1 flex flex-col min-h-0">
              {/* Document Header */}
              <div className="mb-6 flex items-center gap-4 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2
                    className="text-4xl font-light text-white tracking-wide"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {doc.title}
                  </h2>
                  <p className="text-base text-white/50 mt-1">Last updated: {doc.lastUpdated}</p>
                </div>
              </div>

              {/* Document Sections - Scrollable */}
              <div className="space-y-4 flex-1 overflow-y-auto min-h-0 pr-2">
                {doc.sections.map((section, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3
                      className="text-xl font-light text-white tracking-wide mb-3"
                      style={{ fontFamily: 'var(--font-cormorant)' }}
                    >
                      {section.heading}
                    </h3>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex gap-3 text-sm text-white/70">
                          <span className="text-amber-400/60 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Voice Chat */}
          <div className="w-[400px] flex-shrink-0 flex flex-col min-h-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex-1 overflow-hidden">
              <VoiceSessionChat
              agentId="knowledge-base"
              sessionId={`kb-${docId}`}
              elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_KB_AGENT_ID}
              title="Training Coordinator"
              avatar="/avatars/kb-avatar.jpg"
              welcomeMessage={`Hello! I'm your training coordinator. Let's go through the ${doc.title} together. Feel free to ask me anything - I'm here to help you master these procedures.`}
              suggestions={[
                "Walk me through this",
                "What's most important here?",
                "Give me a real example",
                "How do I handle this situation?"
              ]}
              contextData={{
                documentId: docId,
                documentTitle: doc.title,
                documentContent: documentContent,
                sections: doc.sections.map(s => s.heading)
              }}
              variant="dark"
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
