import React, { useState } from "react";

interface SemanticHeroProps {
  onSearch: (query: string) => void;
  currentUser: any;
}

export default function SemanticHero({ onSearch, currentUser }: SemanticHeroProps) {
  const [query, setQuery] = useState("");
  const isGuest = !currentUser;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className={`relative px-4 sm:px-6 max-w-4xl mx-auto text-center ${isGuest ? "py-16 sm:py-24" : "py-10 sm:py-16"}`}>
      
      <div className="relative space-y-6">
        
        {/* Primary Outcome Typography */}
        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mx-auto leading-[1.1]">
            {isGuest 
              ? "What do you need moved?"
              : `Welcome back, ${currentUser.name}.`
            }
          </h1>
          <p className="font-sans text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            {isGuest
              ? "DNS builds campaign paths for music releases, creator promos, playlist traction, TikTok sound activation, rollout support, and private media routing."
              : "Access your active routes or configure custom campaign outcomes below."
            }
          </p>
        </div>

        {/* Semantic Search Box */}
        <div className="max-w-xl mx-auto pt-4">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="w-full bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-full px-4 transition-colors">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tell us your goal"
                className="w-full bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-zinc-500 py-3 font-sans"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-semibold text-sm px-6 py-3.5 rounded-full transition-all shrink-0 cursor-pointer"
            >
              Build My Campaign
            </button>
          </form>
        </div>

        {/* Supporting Proof Line */}
        {isGuest && (
          <div className="mt-8 text-center max-w-xl mx-auto">
            <p className="font-sans text-xs sm:text-sm text-zinc-500 font-medium">
              1.18B+ verified lifetime streams and video views across DNS / iKandy music, media, and creator surfaces.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
