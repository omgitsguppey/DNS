import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Order, DigitalService } from "./types";
import Navigation from "./components/Navigation";
import SemanticHero from "./components/SemanticHero";
import CampaignEcosystem from "./components/CampaignEcosystem";
import CheckoutSheet from "./components/CheckoutSheet";
import OperatorDashboard from "./components/OperatorDashboard";
import { auth, db } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function App() {
  const [currentView, setCurrentView] = useState<"storefront" | "backstage">("storefront");
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string } | null>(null);
  
  // Checkout & Ordering State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutService, setCheckoutService] = useState<DigitalService | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Derived state
  const isOperator = currentUser?.role === "admin" || currentUser?.role === "staff" || currentUser?.role === "mod";
  const userOrderCount = orders.filter(o => o.customerEmail === currentUser?.email).length;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Simple role assignment logic based on email
        const isAdmin = user.email === "uylusjohnson@gmail.com";
        const isStaff = user.email?.includes("@dollarsnotsense.com");
        const role = isAdmin ? "admin" : isStaff ? "staff" : "user";
        
        setCurrentUser({
          email: user.email || "",
          name: user.displayName || user.email?.split('@')[0] || "Client",
          role
        });
      } else {
        setCurrentUser(null);
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const loadOrders = async () => {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders: Order[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));

        if (currentUser.role === "admin" || currentUser.role === "staff" || currentUser.role === "mod") {
          setOrders(fetchedOrders);
        } else {
          setOrders(fetchedOrders.filter(o => o.customerEmail === currentUser.email));
        }
      }, (error) => {
        console.error("Error listening to orders:", error);
      });

      return () => unsubscribe();
    };

    loadOrders();
  }, [currentUser]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView("storefront");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const createDummyService = (requestText: string): DigitalService => {
    return {
      id: "custom-route-" + Date.now(),
      title: "Custom Campaign Route",
      category: "Campaigns",
      shortDesc: requestText,
      description: "A specialized campaign route built to accomplish your specific outcome.",
      supplier: "DNS Private Desk",
      supplierCost: 0,
      baseClientPrice: 499,
      metrics: {
        rating: 5.0,
        buyers: 120,
        timeToDeliver: "3-5 days"
      }
    };
  };

  const handleSemanticSearch = (query: string) => {
    setCheckoutService(createDummyService(query));
    setIsCheckoutOpen(true);
  };

  const handleSelectOutcome = (request: string) => {
    setCheckoutService(createDummyService(request));
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black flex flex-col overflow-x-hidden">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        isOperator={isOperator}
        currentUser={currentUser}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        orderCount={userOrderCount}
      />

      {currentView === "storefront" ? (
        <div className="flex-grow animate-in fade-in duration-500">
          <SemanticHero 
            onSearch={handleSemanticSearch} 
            currentUser={currentUser} 
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 space-y-12 sm:space-y-16">
            
            {/* 1. Outcome Cards */}
            <CampaignEcosystem 
              onSelectRequest={handleSelectOutcome} 
            />

            {/* 2. How DNS works */}
            <section className="py-12 sm:py-16 border-t border-zinc-900">
              <div className="space-y-8 sm:space-y-12 max-w-4xl mx-auto">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight text-center">
                  How DNS works
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {[
                    {
                      step: "1",
                      title: "Tell us the goal",
                      desc: "Share the release, brand, or creator campaign you want moved."
                    },
                    {
                      step: "2",
                      title: "DNS builds the route",
                      desc: "We package the campaign path across the right media and creator channels."
                    },
                    {
                      step: "3",
                      title: "Track the campaign",
                      desc: "Follow status, notes, files, and next steps from your campaign desk."
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-3 flex flex-col">
                      <span className="text-zinc-500 font-bold text-lg">
                        {item.step}.
                      </span>
                      <h4 className="font-display font-semibold text-lg text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Proof Section */}
            <section className="py-12 sm:py-16 border-t border-b border-zinc-900">
              <div className="max-w-4xl mx-auto space-y-12">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight text-center">
                  Built from real campaign experience
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-900">
                  <div className="space-y-3 py-4 md:py-0 md:pr-6">
                    <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight block">
                      1.18B+
                    </span>
                    <span className="text-sm text-zinc-400 block font-medium leading-relaxed">
                      Verified lifetime streams and views
                    </span>
                  </div>
                  <div className="space-y-3 py-4 md:py-0 md:px-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                      Music catalog + creator surfaces + owned media pages
                    </p>
                  </div>
                  <div className="space-y-3 py-4 md:py-0 md:pl-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                      Private routing built from real distribution experience
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Final CTA */}
            <section className="py-16 sm:py-24 text-center space-y-8">
              <div className="space-y-4 max-w-xl mx-auto">
                <h3 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                  Ready to build your campaign?
                </h3>
                <p className="text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
                  Start with a goal. DNS will package the route.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  const inputEl = document.querySelector('input[placeholder="Tell us your goal"]') as HTMLInputElement;
                  if (inputEl) {
                    setTimeout(() => inputEl.focus(), 500);
                  }
                }}
                className="mx-auto flex items-center space-x-2 bg-white hover:bg-zinc-200 text-black font-sans font-semibold text-base px-8 py-4 rounded-full transition-all cursor-pointer shadow-sm"
              >
                <span>Build My Campaign</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </section>

          </main>
        </div>
      ) : (
        <div className="flex-grow bg-[#000000]">
          <OperatorDashboard
            currentUser={currentUser as any}
            orders={orders}
            onRefreshOrders={() => {}}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-[#000000] py-8 text-center font-sans">
        <div className="max-w-7xl mx-auto px-4 text-zinc-500 space-y-2">
          <p className="text-sm leading-relaxed">
            Dollars Not Sense LLC. Private campaign routing, curation, and creator-media execution.
          </p>
        </div>
      </footer>

      {/* Slide-out Checkout Panel */}
      {isCheckoutOpen && checkoutService && (
        <CheckoutSheet 
          service={checkoutService}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCreated={() => {
            setIsCheckoutOpen(false);
            setCurrentView("backstage");
          }}
          currentUser={currentUser as any}
          onLoginClick={handleLogin}
        />
      )}
    </div>
  );
}
