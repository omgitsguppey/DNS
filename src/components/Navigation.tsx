import React from "react";
import { Compass, Briefcase, User, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: "storefront" | "backstage";
  onViewChange: (view: "storefront" | "backstage") => void;
  isOperator: boolean;
  currentUser: { email: string; name: string; role: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  orderCount?: number;
}

export default function Navigation({
  currentView,
  onViewChange,
  isOperator,
  currentUser,
  onLoginClick,
  onLogoutClick,
  orderCount = 0
}: NavigationProps) {

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/90 backdrop-blur-md border-b border-zinc-900 selection:bg-zinc-800 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 shrink-0 select-none">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-display font-bold text-sm tracking-tight shrink-0">
            $
          </div>
          <span className="font-display font-semibold text-sm sm:text-base tracking-tight text-white leading-none">
            <span className="inline min-[450px]:hidden">DNS</span>
            <span className="hidden min-[450px]:inline">
              Dollars Not Sense
            </span>
          </span>
        </div>

        {/* Compact Switcher Controls */}
        <div className="flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-full shrink-0">
          <button
            onClick={() => onViewChange("storefront")}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-all cursor-pointer ${
              currentView === "storefront"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden min-[380px]:inline">Campaign Desk</span>
            <span className="inline min-[380px]:hidden">Desk</span>
          </button>
          
          <button
            onClick={() => onViewChange("backstage")}
            className={`flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-medium tracking-wide transition-all cursor-pointer relative ${
              currentView === "backstage"
                ? "bg-white text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden min-[380px]:inline">{isOperator ? "Operator Desk" : "Active Campaigns"}</span>
            <span className="inline min-[380px]:hidden">{isOperator ? "Operator" : "Active"}</span>
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                {orderCount}
              </span>
            )}
          </button>
        </div>

        {/* User Auth */}
        <div className="flex items-center shrink-0">
          {currentUser ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* User Dropdown Profile area */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[11px] font-medium text-white tracking-wide">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {isOperator ? "DNS Operator" : "Client"}
                </span>
              </div>
              
              {/* Initials bubble */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-zinc-800 text-white select-none shrink-0 border border-zinc-700">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={onLogoutClick}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1.5 bg-white hover:bg-zinc-200 text-black font-sans font-medium text-[11px] sm:text-xs px-4 py-2 rounded-full transition-all cursor-pointer shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
