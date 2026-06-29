import React, { useState, useEffect } from "react";
import { X, Sparkles, ShieldCheck, ChevronRight, Check, CreditCard, Lock, ArrowRight, User, Mail, Link as LinkIcon, Edit } from "lucide-react";
import { DigitalService } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";

interface CheckoutSheetProps {
  service: DigitalService;
  onClose: () => void;
  onOrderCreated: (newOrder: any) => void;
  currentUser: { email: string; name: string; role: "admin" | "staff" | "mod" | "user" | "guest" } | null;
  onLoginClick: () => void;
}

export default function CheckoutSheet({ 
  service, 
  onClose, 
  onOrderCreated,
  currentUser,
  onLoginClick
}: CheckoutSheetProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Sync with Google authentication profile
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerEmail(currentUser.email);
    } else {
      setCustomerName("");
      setCustomerEmail("");
    }
  }, [currentUser]);
  const [projectLink, setProjectLink] = useState("");
  
  // Three-Tier Model state
  // tier-1: One-Time Purchase, tier-2: Monthly Subscription, tier-3: Custom/Enterprise Contract
  const [selectedTier, setSelectedTier] = useState<"one-time" | "subscription" | "custom">("one-time");
  
  // Custom/Enterprise Form specific inputs
  const [customScaleRequired, setCustomScaleRequired] = useState("");
  const [customProposedBudget, setCustomProposedBudget] = useState("");

  const [checkoutStep, setCheckoutStep] = useState<"configure" | "payment" | "success">("configure");
  
  // PayPal simulation steps
  // "paypal-gate": shows Yellow PayPal and Black Card buttons
  // "paypal-login-modal": Classic secure login panel overlay
  // "paypal-balance-modal": Pay now balance checkout
  // "paypal-cc-panel": Credit Card inline form
  // "paypal-progress": Secure authorization loading
  const [paypalStage, setPaypalStage] = useState<"gate" | "login" | "balance" | "cc" | "progress">("gate");
  const [paypalLoginEmail, setPaypalLoginEmail] = useState("");
  const [paypalLoginPassword, setPaypalLoginPassword] = useState("");
  const [billingCompletedType, setBillingCompletedType] = useState<string>("");

  // Dynamic calculations based on 3 tiers
  const tierOnePrice = service.baseClientPrice;
  const tierTwoPrice = Math.round(service.baseClientPrice * 0.75); // 25% discount for recurring habit

  const [activeTotal, setActiveTotal] = useState(tierOnePrice);

  useEffect(() => {
    if (selectedTier === "one-time") {
      setActiveTotal(tierOnePrice);
    } else if (selectedTier === "subscription") {
      setActiveTotal(tierTwoPrice); // monthly amount
    } else {
      setActiveTotal(0); // custom bespoke pricing
    }
  }, [selectedTier, service, tierOnePrice, tierTwoPrice]);

  const handleIdentitySubmitted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) return;

    if (selectedTier === "custom") {
      // Direct Sourcing Protocol for high-net-worth custom agreements bypasses PayPal
      submitCustomEnterpriseContract();
    } else {
      setCheckoutStep("payment");
      setPaypalStage("gate");
      setPaypalLoginEmail(customerEmail);
    }
  };

  const submitCustomEnterpriseContract = async () => {
    setCheckoutStep("payment");
    setPaypalStage("progress");
    
    // Simulate luxury human allocation and database registration
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id,
      serviceTitle: `[EP CONTRACT] ${service.title} - Custom Partner Setup`,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      category: `Custom Partnership (${service.category})`,
      paidAmount: 0, // Quote basis
      supplierCost: service.supplierCost * 2, // custom baseline
      arbitrageProfit: 0 - (service.supplierCost * 2),
      status: "Processing",
      supplierStatus: "Under VIP Partner Architecture Design",
      supplierName: `${service.supplier} VIP Division`,
      date: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "orders", newOrder.id), newOrder);
      await new Promise((resolve) => setTimeout(resolve, 800));
      onOrderCreated(newOrder);
      setCheckoutStep("success");
    } catch (err) {
      console.error("Custom enterprise creation failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`);
    }
  };

  const executePaypalSponsorFlow = async (capturedType: string) => {
    setPaypalStage("progress");
    setBillingCompletedType(capturedType);

    // Simulate multi-step PayPal SDK payment gateway handshakes
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updatedTitle = selectedTier === "subscription" 
      ? `[Monthly Sub] ${service.title} (Sustained)`
      : `[One-Time] ${service.title}`;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: service.id,
      serviceTitle: updatedTitle,
      customerName,
      customerEmail: customerEmail.toLowerCase(),
      category: service.category,
      paidAmount: Number(activeTotal),
      supplierCost: service.supplierCost,
      arbitrageProfit: Number(activeTotal) - service.supplierCost,
      status: "Processing",
      supplierStatus: `Paid via PayPal Gateway (${capturedType}). Auto-dispatched directly.`,
      supplierName: service.supplier,
      date: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "orders", newOrder.id), newOrder);
      
      // Simulate automated external routing callback after 2.5 seconds
      setTimeout(async () => {
        try {
          await updateDoc(doc(db, "orders", newOrder.id), {
            supplierStatus: "Supplier Dispatched / REST API Integrated",
            status: "Active Campaign"
          });
        } catch (err) {
          console.error("Failed to update status client-side:", err);
          handleFirestoreError(err, OperationType.UPDATE, `orders/${newOrder.id}`);
        }
      }, 2500);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      onOrderCreated(newOrder);
      setCheckoutStep("success");
    } catch (err) {
      console.error("PayPal checkout failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `orders/${newOrder.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000a6] backdrop-blur-md flex items-center justify-end p-0 font-sans">
      {/* Outer click dismissal */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Luxury checkout sheet container */}
      <div className="relative w-full max-w-lg h-full bg-[#000000] text-white border-l border-zinc-900 shadow-2xl flex flex-col justify-between selection:bg-[#00FF66] selection:text-black z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-black shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono block mb-0.5">
              Campaign Customization
            </span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              <h2 className="font-display font-semibold text-lg text-white leading-tight">
                Secure Order Configuration
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-900 rounded-full transition-all cursor-pointer text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Step Body panel */}
        <div className="flex-1 overflow-y-auto bg-[#000000]">
          
          {checkoutStep === "configure" && (
            <div className="p-6 space-y-6">
              
              {/* Service Context Header card */}
              <div className="bg-[#050505] p-5 rounded-2xl border border-zinc-900 shadow-xs space-y-1">
                <span className="text-[9px] uppercase font-mono tracking-wider text-[#00FF66] font-bold bg-[#00FF66]/5 border border-[#00FF66]/10 px-2 py-0.5 rounded">
                  {service.category} Service
                </span>
                <h3 className="font-display font-semibold text-base text-white pt-1">
                  {service.title}
                </h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {service.shortDesc}
                </p>
                <div className="pt-2 flex items-center space-x-3 text-[11px] text-zinc-500">
                  <span>Rating: <strong className="text-zinc-300">★ {service.metrics.rating.toFixed(1)}</strong></span>
                  <span className="text-zinc-800">•</span>
                  <span>SLA Delivery: <strong className="text-zinc-300">{service.metrics.timeToDeliver}</strong></span>
                </div>
              </div>

              {/* Identity Form */}
              <form id="identity-form" onSubmit={handleIdentitySubmitted} className="space-y-6">
                
                {/* Identification Inputs & Google Authentication Prompt */}
                {!currentUser ? (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Step 1: Verify Profile Identity</span>
                    </h4>
                    <div className="bg-[#050505] border border-zinc-900 rounded-2xl p-5 text-center space-y-4">
                      <div className="bg-zinc-950 text-[#00FF66] border border-zinc-900 w-9 h-9 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="space-y-1 max-w-sm mx-auto">
                        <p className="text-xs font-bold text-white">Google Authentication Profile Required</p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                          To establish custom campaign queues, authorize logistics pipelines, and sync delivery status tracking under your account, sign in with Google now.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onLoginClick}
                        className="mx-auto flex items-center space-x-2 bg-white hover:bg-[#00FF66] text-black border-transparent font-sans font-bold text-xs tracking-wide px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#00FF66]/10"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.52-4.53 5.84-14.73z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Verify Securely with Google</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 animate-in fade-in duration-300">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Step 1: Your Contact Information</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400">Legal Name</label>
                        <input
                          type="text"
                          required
                          readOnly
                          value={customerName}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm text-zinc-500 cursor-not-allowed select-none focus:outline-hidden font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400">Secure Email</label>
                        <input
                          type="email"
                          required
                          readOnly
                          value={customerEmail}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm text-zinc-500 cursor-not-allowed select-none focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[10px] text-[#00FF66] font-mono bg-[#00FF66]/5 border border-[#00FF66]/10 w-max px-2.5 py-1 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Synced to Google Profile ({currentUser.email})</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <label className="text-xs font-semibold text-zinc-400">Creative Release Link (Optional)</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={projectLink}
                          onChange={(e) => setProjectLink(e.target.value)}
                          placeholder="e.g., https://open.spotify.com/track/..."
                          className="w-full bg-zinc-950 border border-zinc-900 focus:border-[#00FF66] rounded-xl pl-10 pr-4 p-3 text-sm focus:outline-hidden transition-all placeholder:text-zinc-600 text-white font-sans"
                        />
                        <LinkIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* THE CHALLENGED THREE-TIER PRICING SELECTION */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-mono flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Step 2: Choose Your Execution Tier</span>
                    </h4>
                    <span className="text-[9px] bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/25 font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                      DNS Tier Model
                    </span>
                  </div>

                  <div className="space-y-3">
                    
                    {/* TIER 1: One-Time Purchase */}
                    <div 
                      onClick={() => setSelectedTier("one-time")}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                        selectedTier === "one-time" 
                          ? "border-[#00FF66] bg-[#050505] ring-1 ring-[#00FF66]/10 shadow-[0_0_15px_rgba(0,255,102,0.03)]" 
                          : "border-zinc-900 bg-black hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedTier === "one-time" ? "border-[#00FF66] bg-[#00FF66] text-black" : "border-zinc-800 bg-zinc-950"
                          }`}>
                            {selectedTier === "one-time" && <Check className="w-2.5 h-2.5 text-black font-extrabold" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">One-Time Campaign</span>
                            <span className="text-[10px] text-zinc-500 capitalize">Single placement campaign</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold text-zinc-500 block uppercase tracking-wider text-[8px] font-mono">Price</span>
                          <span className="font-display font-bold text-base text-white">${tierOnePrice}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mt-2 ml-6 leading-relaxed">
                        A single high-impact campaign run completely for you. Complete quality reviews and direct delivery. No ongoing agreements.
                      </p>
                    </div>

                    {/* TIER 2: Monthly Subscription (REDUCED COST - THE HABIT) */}
                    <div 
                      onClick={() => setSelectedTier("subscription")}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all relative overflow-hidden ${
                        selectedTier === "subscription" 
                          ? "border-[#00FF66] bg-[#050505] ring-1 ring-[#00FF66]/10 shadow-[0_0_15px_rgba(0,255,102,0.03)]" 
                          : "border-zinc-900 bg-black hover:border-zinc-800"
                      }`}
                    >
                      <div className="absolute top-0 right-0 bg-[#00FF66] text-black font-extrabold text-[8px] uppercase tracking-wider px-3 py-1 rounded-bl-xl font-mono">
                        Recommended (25% Off)
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedTier === "subscription" ? "border-[#00FF66] bg-[#00FF66] text-black" : "border-zinc-800 bg-zinc-950"
                          }`}>
                            {selectedTier === "subscription" && <Check className="w-2.5 h-2.5 text-black font-extrabold" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Ongoing Campaign & Routing Plan</span>
                            <span className="text-[10px] text-[#00FF66] font-semibold capitalize">Sustained campaign development</span>
                          </div>
                        </div>
                        <div className="text-right mr-16">
                          <span className="text-sm font-semibold text-zinc-500 block uppercase tracking-wider text-[8px] font-mono">Per Month</span>
                          <span className="font-display font-bold text-base text-[#00FF66]">${tierTwoPrice}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans mt-2 ml-6 leading-relaxed">
                        Establishes an ongoing campaign layer. Includes monthly campaign rotations, updated curator pitching, weekly progress digests, and priority support. Cancel anytime.
                      </p>
                    </div>

                    {/* TIER 3: Custom / Enterprise (DEEP PARTNERSHIP / DELEGATION RISK) */}
                    <div 
                      onClick={() => setSelectedTier("custom")}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                        selectedTier === "custom" 
                          ? "border-[#00FF66] bg-[#050505] text-white ring-1 ring-[#00FF66]/10 shadow-[0_0_15px_rgba(0,255,102,0.03)]" 
                          : "border-zinc-900 bg-black hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedTier === "custom" ? "border-[#00FF66] bg-[#00FF66] text-black" : "border-zinc-800 bg-zinc-950"
                          }`}>
                            {selectedTier === "custom" && <Check className="w-2.5 h-2.5 text-black font-extrabold" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold block">Custom Campaign Setup</span>
                            <span className={`text-[10px] capitalize block ${selectedTier === "custom" ? "text-zinc-400" : "text-zinc-500"}`}>
                              Bespoke manual orchestration
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold block uppercase tracking-wider text-[8px] font-mono opacity-60">Pricing</span>
                          <span className="font-display font-bold text-base">Quote</span>
                        </div>
                      </div>
                      <p className={`text-[11px] font-sans mt-2 ml-6 leading-relaxed ${selectedTier === "custom" ? "text-zinc-300" : "text-zinc-500"}`}>
                        Designed for premium brands or established artists who need custom workflow integrations. We map bespoke strategies to fulfill your specific creative goals.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Conditional Form Inputs for Custom Tier 3 */}
                {selectedTier === "custom" && (
                  <div className="bg-neutral-900 text-white p-5 rounded-2xl border border-neutral-800 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h5 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Custom Design Details
                    </h5>
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-neutral-400 block font-medium">What are your custom campaign goals?</label>
                        <textarea
                          required
                          rows={2}
                          value={customScaleRequired}
                          onChange={(e) => setCustomScaleRequired(e.target.value)}
                          placeholder="e.g., We need continuous daily Spotify submissions for our 50-artist roster and custom TikTok sound curation overlays."
                          className="w-full bg-neutral-850 border border-neutral-800 rounded-xl p-3 text-xs focus:outline-hidden text-neutral-100"
                        />
                      </div>
                      <div className="space-y-1 block sm:inline-block w-full">
                        <label className="text-neutral-400 block font-medium">Proposed Budget / Investment (USD)</label>
                        <input
                          type="text"
                          required
                          value={customProposedBudget}
                          onChange={(e) => setCustomProposedBudget(e.target.value)}
                          placeholder="e.g. $2,500 - $5,000"
                          className="w-full bg-neutral-850 border border-neutral-800 rounded-xl p-3 text-xs focus:outline-hidden text-neutral-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </form>

            </div>
          )}

          {/* PAYMENT COMPONENT (PayPal SDK simulation) */}
          {checkoutStep === "payment" && (
            <div className="p-6 space-y-6">
              
              {/* Back button to reconfigure */}
              {paypalStage !== "progress" && (
                <button
                  type="button"
                  onClick={() => setCheckoutStep("configure")}
                  className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-black transition-all cursor-pointer font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Configure your campaign</span>
                </button>
              )}

              {/* Sourcing Summary Card */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">
                  Order Balance Summary
                </span>
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-sm text-neutral-900 leading-snug">
                    {service.title}
                  </h4>
                  <span className="font-display font-medium text-xs text-neutral-400 font-mono">
                    #{service.id.substring(0,6).toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-2 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-neutral-500 font-medium block">Selected Tier:</span>
                    <span className="font-semibold text-black uppercase tracking-wide text-[10px]">
                      {selectedTier === "one-time" ? "One-Time Campaign" : "Ongoing Routing Plan"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 block font-medium">Billed Amount:</span>
                    <span className="font-display font-extrabold text-base text-neutral-900">
                      ${activeTotal} {selectedTier === "subscription" && <span className="text-[10px] text-gray-400 font-normal">/mo</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure system badges */}
              <div className="flex items-center justify-center space-x-2 bg-neutral-100 border border-neutral-200/50 p-3 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] text-neutral-500 font-semibold tracking-wide uppercase">
                  Secure Encryption via PayPal Gateway
                </span>
              </div>

              {/* PAYPAL STAGES HANDLERS */}
              
              {/* GATE STAGE: Displays PayPal Yellow / Card Black brand buttons */}
              {paypalStage === "gate" && (
                <div className="space-y-4 p-4 bg-white rounded-2xl border border-neutral-200 text-center">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Select Payment Method
                  </span>
                  
                  {/* PayPal Yellow Brand button */}
                  <button
                    type="button"
                    onClick={() => setPaypalStage("login")}
                    className="w-full bg-[#FFC439] hover:bg-[#F2B522] py-3 px-4 rounded-xl font-bold text-sm text-[#003087] flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="italic text-base tracking-tighter">Pay<span className="text-[#0079C1]">Pal</span></span>
                    <span className="text-xs tracking-tight font-black font-sans uppercase">Checkout</span>
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase font-bold tracking-wider">or pay securely with Visa / MasterCard</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* PayPal Black Credit Card button */}
                  <button
                    type="button"
                    onClick={() => setPaypalStage("cc")}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-neutral-300" />
                    <span>Debit or Credit Card</span>
                  </button>

                  <div className="pt-2 text-center text-[10px] text-gray-400 font-sans leading-relaxed">
                    By proceeding, your payment is secure. All transaction details are encrypted and processed under industry-standard compliance requirements.
                  </div>
                </div>
              )}

              {/* CARD GATEWAY INPUT PANEL */}
              {paypalStage === "cc" && (
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b pb-3">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Secure Checkout via PayPal Gateway</span>
                    <button onClick={() => setPaypalStage("gate")} className="text-[10px] text-sky-500 font-bold hover:underline">Change</button>
                  </div>
                  
                  <div className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-neutral-500 font-medium block">Card Number</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-gray-900"
                        disabled
                        value="4111 •••• •••• 4444"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-neutral-500 font-medium block">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-gray-900"
                          disabled
                          value="12 / 29"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-neutral-500 font-medium block">CVV</label>
                        <input
                          type="text"
                          placeholder="•••"
                          className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-gray-900"
                          disabled
                          value="•••"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executePaypalSponsorFlow("Debit Card via PayPal Gateway")}
                    className="w-full bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-center uppercase cursor-pointer"
                  >
                    <span>Pay ${activeTotal} Securely Now</span>
                  </button>
                </div>
              )}

              {/* SECURE POPUP DIALOGUE OVERLAY OPTION (Simulates classic yellow PayPal portal) */}
              {paypalStage === "login" && (
                <div className="bg-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                  
                  {/* Fake Secure Header banner */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="italic font-sans text-2xl font-black text-white select-none">
                        Pay<span className="text-[#0079C1]">Pal</span>
                      </span>
                      <span className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                        SDK Secure Pop
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setPaypalStage("gate")} 
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center space-y-1.5">
                      <h4 className="text-sm font-semibold text-neutral-100">Log in with your PayPal account</h4>
                      <p className="text-[11px] text-neutral-400">Authorize secure dashboard transactions</p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="PayPal Account Email Address"
                        required
                        value={paypalLoginEmail}
                        onChange={(e) => setPaypalLoginEmail(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-xs focus:outline-hidden text-neutral-100 placeholder:text-neutral-500"
                      />
                      <input
                        type="password"
                        placeholder="PayPal Secure Password"
                        required
                        value={paypalLoginPassword}
                        onChange={(e) => setPaypalLoginPassword(e.target.value)}
                        className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-xs focus:outline-hidden text-neutral-100 placeholder:text-neutral-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaypalStage("balance")}
                      className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer text-center"
                    >
                      Log In Securely
                    </button>
                  </div>

                  <p className="text-[9px] text-center text-neutral-500">
                    PayPal is a secure compliance partner. Your credentials are encrypted and processed matching international regulations.
                  </p>
                </div>
              )}

              {/* PAYPAL BALANCE PAYMENT MODAL */}
              {paypalStage === "balance" && (
                <div className="bg-white text-gray-950 p-6 rounded-3xl border border-neutral-200 shadow-2xl space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="italic font-sans text-xl font-black text-[#003087]">
                      Pay<span className="text-[#0079C1]">Pal</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{paypalLoginEmail}</span>
                  </div>

                  {/* Financial Breakdown Panel */}
                  <div className="space-y-3 text-xs">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-900 block">PayPal Balance</span>
                        <span className="text-[10px] text-neutral-400">Available: $1,284.50 USD</span>
                      </div>
                      <span className="font-bold text-rose-500 font-display">-${activeTotal}.00</span>
                    </div>

                    <div className="space-y-1 text-[11px] text-gray-500 leading-normal">
                      <div className="flex justify-between">
                        <span>Merchant</span>
                        <span className="font-semibold text-gray-900">Dollars not Sense</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selected Package</span>
                        <span className="font-semibold text-gray-900 max-w-[200px] truncate text-right">{service.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Protection</span>
                        <span className="font-semibold text-emerald-600">Active</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => executePaypalSponsorFlow("PayPal Digital Balance")}
                    className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs py-4 rounded-xl transition-all cursor-pointer block text-center"
                  >
                    Pay ${activeTotal}.00 with PayPal Secure
                  </button>
                </div>
              )}

              {/* AUTHORIZING / PROGRESS TICKER MODAL */}
              {paypalStage === "progress" && (
                <div className="bg-neutral-900 text-white rounded-2xl p-6 text-center space-y-4">
                  <div className="flex flex-col items-center justify-center space-y-3.5">
                    <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold tracking-widest block uppercase text-sky-400">
                      Processing Payment
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      SECURE CONNECTION ESTABLISHED...
                    </span>
                    <p className="text-xs text-neutral-300 font-sans block max-w-sm mx-auto">
                      {selectedTier === "custom" 
                        ? `Preparing your custom design criteria and connecting with our team...` 
                        : `Authenticating your secure payment and preparing campaign setup files.`}
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* CHECKOUT SUCCESS PANEL */}
          {checkoutStep === "success" && (
            <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-400">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#0079C1] font-mono block bg-[#0079C1]/5 px-3 py-1 rounded-full w-max mx-auto">
                  {selectedTier === "custom" ? "Custom Request Registered" : `Order Secured - Paid via ${billingCompletedType}`}
                </span>
                <h3 className="font-display font-semibold text-2xl text-gray-900 tracking-tight">
                  Campaign Active
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  We have received your career objective details. Our team has successfully registered your requirements and assigned primary curators to manage and deliver your project seamlessly.
                </p>
              </div>

              {/* Secure Receipt summary details */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/60 shadow-xs max-w-sm mx-auto text-left text-xs space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Receipt ID</span>
                  <span className="font-mono text-gray-900 font-bold">DNS-{Math.floor(1000 + Math.random()*9000)}-ALPHA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Client Name</span>
                  <span className="text-gray-900 font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Timeline</span>
                  <span className="text-emerald-600 font-semibold uppercase text-[10px]">Prioritized SLA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Secure Status</span>
                  <span className="text-blue-600 font-semibold uppercase text-[10px]">Verified & Secured</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 uppercase"
              >
                <span>View Order & Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[9px] text-gray-400 font-mono">
                Your campaign details and logistics progress are listed in your dashboard console.
              </p>
            </div>
          )}

        </div>

        {/* BOTTOM FIXED BILLING INVOICE FOOTER (Only details billing action in configuration) */}
        {checkoutStep === "configure" && (
          <div className="p-6 border-t border-zinc-900 bg-black space-y-4 shrink-0">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-900">
              <span className="text-zinc-500 font-medium">Secure Transaction</span>
              <span className="text-[#00FF66] font-semibold uppercase tracking-wider text-[8px] bg-[#00FF66]/5 border border-[#00FF66]/10 px-2 py-0.5 rounded flex items-center font-mono">
                <Check className="w-2.5 h-2.5 mr-1" /> Verified 100% Secure
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <div className="space-y-0.5">
                <span className="text-xs text-zinc-400 block font-medium">Billed Amount:</span>
                <span className="text-[10px] text-zinc-500 block font-light leading-none">Includes complete setup & support</span>
              </div>
              <span className="text-2xl font-display font-bold text-white">
                {selectedTier === "custom" ? "Bespoke" : `$${activeTotal.toFixed(2)}`}
                {selectedTier === "subscription" && <span className="text-xs font-semibold text-zinc-500 ml-1">/ Month</span>}
              </span>
            </div>

            {!currentUser ? (
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full bg-[#00FF66] hover:bg-[#00E65C] text-black font-semibold text-xs tracking-wider py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-center uppercase cursor-pointer shadow-md shadow-[#00FF66]/10 font-sans"
              >
                <span>Authorize Google Profile to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="identity-form"
                className="w-full bg-white hover:bg-[#00FF66] text-black font-semibold text-xs tracking-wider py-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-center uppercase cursor-pointer font-sans"
              >
                <span>{selectedTier === "custom" ? "Submit Custom Campaign Proposal" : "Proceed to PayPal Gateway"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <p className="text-[8px] text-center text-zinc-500 font-mono">
              Dollars not Sense delivers premium digital services. Terms of service apply.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
