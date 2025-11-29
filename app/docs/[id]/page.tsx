'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, ClipboardList, BookOpen } from 'lucide-react';
import VoiceSessionChat from '../../components/VoiceSessionChat';

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
  const params = useParams();
  const docId = params.id as string;
  const doc = documents[docId];

  if (!doc) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Document not found</p>
          <Link href="/admin" className="text-stone-700 hover:text-stone-900 underline">
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = doc.icon;
  const documentContent = getDocumentContent(doc);

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Left: Document Content */}
      <div className="flex-[2] min-w-0 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-stone-100 flex-shrink-0">
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 text-stone-400 hover:text-stone-600 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-stone-500" />
                </div>
                <div>
                  <h1 className="text-xl font-light text-stone-800" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {doc.title}
                  </h1>
                  <p className="text-xs text-stone-400">Last updated: {doc.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="space-y-8">
              {doc.sections.map((section, idx) => (
                <div key={idx} className="bg-white rounded-lg p-6">
                  <h2 className="text-lg font-medium text-stone-800 mb-4" style={{ fontFamily: 'var(--font-cormorant)' }}>
                    {section.heading}
                  </h2>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex gap-3 text-sm text-stone-600">
                        <span className="text-stone-300 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Voice Chat */}
      <div className="flex-[1] min-w-0 p-6 bg-stone-100">
        <VoiceSessionChat
          agentId="knowledge-base"
          sessionId={`kb-${docId}`}
          elevenLabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_KB_AGENT_ID}
          title="Training Assistant"
          avatar="/avatars/kb-avatar.jpg"
          welcomeMessage={`I can help you understand the ${doc.title}. What would you like to know?`}
          suggestions={[
            "Summarize this document",
            "What are the key points?",
            "Give me an example",
            "What should I remember?"
          ]}
          contextData={{
            documentId: docId,
            documentTitle: doc.title,
            documentContent: documentContent,
            sections: doc.sections.map(s => s.heading)
          }}
        />
      </div>
    </div>
  );
}
