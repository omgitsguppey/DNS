import React from "react";

interface CampaignEcosystemProps {
  onSelectRequest: (request: string) => void;
  currentQuery?: string;
}

export default function CampaignEcosystem({ onSelectRequest, currentQuery }: CampaignEcosystemProps) {
  const outcomes = [
    {
      id: "playlist",
      name: "Playlist Traction",
      desc: "Get your release routed to playlist and listener discovery opportunities.",
      price: "$299",
      requestText: "Route my song to indie playlist curators and niche listener pools for streaming discovery and catalog lift"
    },
    {
      id: "tiktok",
      name: "TikTok Sound Activation",
      desc: "Position your sound for creator-led short-form content.",
      price: "$499",
      requestText: "Place my sound into creator-led short-form content lanes for clips, saves, searches, and repeat usage"
    },
    {
      id: "creator",
      name: "Creator Promo",
      desc: "Package creator posts, page placement, and audience routing.",
      price: "$799",
      requestText: "Bundle creator posts, page placement, and audience routing for visibility across creator surfaces"
    },
    {
      id: "rollout",
      name: "Release Rollout",
      desc: "Build a structured launch path around timing, assets, and milestones.",
      price: "$599",
      requestText: "Build a launch path around timing, assets, milestones, and campaign phases for structured release momentum"
    },
    {
      id: "brand",
      name: "Brand & Visual Assets",
      desc: "Prepare artwork, press kits, and campaign-ready creative.",
      price: "$199",
      requestText: "Create premium artwork, press kit, content packaging, and campaign-ready creative for cleaner presentation and conversion"
    },
    {
      id: "private",
      name: "Private Campaign",
      desc: "Request custom routing for sensitive or high-priority campaigns.",
      price: "Custom Quote",
      requestText: "Set up a private custom campaign routing under strict NDA with secure air-gapped coordination"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16" id="campaign-outcomes-section">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Choose your campaign goal
          </h3>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {outcomes.map((outcome) => (
            <div 
              key={outcome.id}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex-grow space-y-3">
                <h4 className="font-display font-semibold text-lg sm:text-xl text-white tracking-tight">
                  {outcome.name}
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                  {outcome.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-900/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">
                    {outcome.price !== "Custom Quote" ? `From ${outcome.price}` : outcome.price}
                  </span>
                </div>
                <button
                  onClick={() => onSelectRequest(outcome.requestText)}
                  className="bg-white hover:bg-zinc-200 text-black font-semibold text-sm px-5 py-2 rounded-full transition-all cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
