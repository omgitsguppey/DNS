import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  Award, 
  Zap, 
  Briefcase,
  ShieldCheck,
  Sparkles,
  Globe,
  Search,
  ExternalLink,
  Edit,
  X
} from "lucide-react";
import { Order, AnalyticsSummary } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

interface OperatorDashboardProps {
  orders: Order[];
  onRefreshOrders: () => void;
  currentUser: { email: string; name: string; role: "admin" | "staff" | "mod" | "user" | "guest" } | null;
}

export default function OperatorDashboard({ orders, onRefreshOrders, currentUser }: OperatorDashboardProps) {
  const [predictions, setPredictions] = useState<AnalyticsSummary | null>(null);
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState<"web" | "trends">("web");

  // Operator inline editing state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<string>("");
  const [editedSupplierStatus, setEditedSupplierStatus] = useState<string>("");
  const [editedSupplierName, setEditedSupplierName] = useState<string>("");
  const [editedSupplierCost, setEditedSupplierCost] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Dynamic roles helper
  const isAdmin = currentUser?.role === "admin";
  const isStaff = currentUser?.role === "staff";
  const isMod = currentUser?.role === "mod";
  const isOperator = isAdmin || isStaff || isMod;
  const showFinancials = isAdmin || isStaff;

  const startEditing = (order: Order) => {
    setEditingOrderId(order.id);
    setEditedStatus(order.status);
    setEditedSupplierStatus(order.supplierStatus || "");
    setEditedSupplierName(order.supplierName || "");
    setEditedSupplierCost(order.supplierCost || 0);
  };

  const handleSaveOrder = async (orderId: string) => {
    setIsSaving(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      const originalOrder = orders.find(o => o.id === orderId);
      if (!originalOrder) return;

      const payload: any = {
        status: editedStatus,
        supplierStatus: editedSupplierStatus,
      };

      if (showFinancials) {
        payload.supplierName = editedSupplierName;
        payload.supplierCost = Number(editedSupplierCost);
        payload.arbitrageProfit = originalOrder.paidAmount - Number(editedSupplierCost);
      }

      await updateDoc(orderRef, payload);
      onRefreshOrders();
      setEditingOrderId(null);
    } catch (err) {
      console.error("Failed to update campaign order:", err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate high-level core statistics
  const totalCampaigns = orders.length;
  const activeCampaignsCount = orders.filter(o => o.status !== "Completed").length;
  const completedCampaignsCount = orders.filter(o => o.status === "Completed").length;
  const totalInvestment = orders.reduce((acc, o) => acc + o.paidAmount, 0);

  // Administrative premium arbitrage telemetry calculations
  const totalSupplierCost = orders.reduce((acc, o) => acc + (o.supplierCost || 0), 0);
  const netArbitrageProfit = totalInvestment - totalSupplierCost;
  const marginPercentage = totalInvestment > 0 ? (netArbitrageProfit / totalInvestment) * 100 : 0;

  // Purely algorithmic, data-driven strategy optimizer (no reliance on external LLM calls)
  const calculateTrendsLocal = (orderData: Order[]): AnalyticsSummary => {
    const categoryCounts: Record<string, number> = {};
    const categoryRevenue: Record<string, number> = {};

    orderData.forEach((o) => {
      const cat = o.category || "General Curation";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + o.paidAmount;
    });

    // Determine trending category based on counts
    let topCategory = "TikTok Audio Drives";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    });

    // Determine target category based on revenue
    let highestRevenueCategory = "Independent Music";
    let maxRevenue = 0;
    Object.entries(categoryRevenue).forEach(([cat, rev]) => {
      if (rev > maxRevenue) {
        maxRevenue = rev;
        highestRevenueCategory = cat;
      }
    });

    const countAll = orderData.length;
    const processingCount = orderData.filter((o) => o.status === "Processing").length;
    const totalRev = orderData.reduce((acc, o) => acc + o.paidAmount, 0);

    const bullets: string[] = [];
    let confidence = 85;

    if (countAll === 0) {
      bullets.push(
        "No customer campaigns have been processed yet. Provide custom placements in client storefront catalogs to seed data."
      );
      bullets.push(
        "TikTok drives and social-media sound curation remain high interest channels globally."
      );
      bullets.push(
        "Optimization Tip: Establish direct premium Soundcloud or Spotify curator connections to optimize supplier arb margin."
      );
      confidence = 94;
    } else {
      const topCatPct = Math.round((maxCount / countAll) * 100);
      bullets.push(
        `Dynamic Segment: ${topCategory} has high volume density, covering ${topCatPct}% of all platform listings.`
      );
      if (processingCount > 0) {
        bullets.push(
          `Priority Orders: There are currently ${processingCount} newly placed custom campaigns in connection stage.`
        );
      } else {
        bullets.push(
          "Fulfillment Pipeline: All campaigns are safely connected to backend dispatchers."
        );
      }
      bullets.push(
        `Revenue Metrics: Cumulative volume has generated $${totalRev.toLocaleString()} gross transacted value.`
      );
      confidence = Math.min(99, 85 + countAll * 2);
    }

    return {
      trendingSector: topCategory,
      recommendedCategory: highestRevenueCategory,
      confidenceFactor: confidence,
      bullets: bullets,
    };
  };

  useEffect(() => {
    const computed = calculateTrendsLocal(orders);
    setPredictions(computed);
  }, [orders]);

  const handleTrendSearch = () => {
    const term = googleSearchQuery.trim() || `${predictions?.trendingSector || "digital marketing trends"}`;
    if (searchTarget === "trends") {
      window.open(`https://trends.google.com/trends/explore?q=${encodeURIComponent(term)}`, "_blank");
    } else {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, "_blank");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 selection:bg-[#00FF66] selection:text-black">
      
      {/* Upper Dashboard Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-900 animate-in fade-in duration-300">
        <div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-1.5 font-mono ${
            currentUser?.role === "admin" ? "bg-purple-950/60 text-purple-400 border border-purple-900/40" :
            currentUser?.role === "staff" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" :
            currentUser?.role === "mod" ? "bg-amber-950/60 text-amber-400 border border-amber-900/40" :
            "bg-zinc-900 text-zinc-400 border border-zinc-800"
          }`}>
            {isOperator ? `Executive Desk: ${currentUser?.role?.toUpperCase()}` : "Client Workspace Portal"}
          </span>
          <h2 className="font-display font-bold text-3xl text-white tracking-tight">
            {isOperator ? "Executive Campaigns Console" : "Creative Portfolio Console"}
          </h2>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            {isOperator 
              ? "Oversee system-wide client placements, optimize pricing margins, and secure automatic fulfillment pipelines." 
              : "Monitor optimization metrics, delivery timelines, and dynamic strategic audience recommendations."}
          </p>
        </div>

        <button
          onClick={onRefreshOrders}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-xs font-semibold tracking-wide text-zinc-300 transition-all self-start sm:self-center cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#00FF66]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Grid of Key Campaign Metrics */}
      {isOperator ? (
        /* SUPER ADMIN & STAFF/MOD METRIC TELEMETRY (DARK MODE) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          
          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Active Placements</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                {totalCampaigns}
              </span>
              <p className="text-[10.5px] text-zinc-500 mt-1">
                Total independent client accounts
              </p>
            </div>
          </div>

          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Capital Inflow</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                ${totalInvestment.toLocaleString()}
              </span>
              <p className="text-[10.5px] text-zinc-500 mt-1">
                Gross payment transactions cleared
              </p>
            </div>
          </div>

          {showFinancials ? (
            <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold tracking-wider uppercase font-mono">Procurement Cost</span>
                <div className="p-1.5 bg-red-950/20 rounded-lg border border-red-900/40">
                  <Layers className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-display font-semibold tracking-tight text-white">
                  ${totalSupplierCost.toLocaleString()}
                </span>
                <p className="text-[10.5px] text-zinc-500 mt-1">
                  Dispatched suppliers overhead cost
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold tracking-wider uppercase font-mono">Pending Connection</span>
                <div className="p-1.5 bg-amber-950/20 rounded-lg border border-amber-900/40">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-display font-semibold tracking-tight text-amber-400 animate-pulse">
                  {orders.filter(o => o.status === "Processing").length}
                </span>
                <p className="text-[10.5px] text-zinc-500 mt-1">
                  Campaigns awaiting direct dispatch
                </p>
              </div>
            </div>
          )}

          {showFinancials ? (
            <div className="bg-[#050505] border border-[#00FF66]/20 p-6 rounded-2xl flex flex-col justify-between hover:border-[#00FF66]/30 transition-all relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00FF66]/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center justify-between opacity-85">
                <span className="text-xs font-bold tracking-wider uppercase text-[#00FF66] font-mono">Net Arbitrage profit</span>
                <div className="p-1.5 bg-[#00FF66]/10 rounded-lg border border-[#00FF66]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                </div>
              </div>
              <div className="mt-4 relative">
                <span className="text-3xl font-display font-extrabold tracking-tight text-[#00FF66]">
                  +${netArbitrageProfit.toLocaleString()}
                </span>
                <p className="text-[10.5px] text-zinc-400 mt-1">
                  Operating yield at <strong className="text-[#00FF66] font-mono">{marginPercentage.toFixed(1)}% margin</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#050505] border border-[#00FF66]/20 p-6 rounded-2xl flex flex-col justify-between hover:border-[#00FF66]/30 transition-all relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00FF66]/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center justify-between opacity-85">
                <span className="text-xs font-bold tracking-wider uppercase text-[#00FF66] font-mono">Active / Completed</span>
                <div className="p-1.5 bg-[#00FF66]/10 rounded-lg border border-[#00FF66]/20">
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />
                </div>
              </div>
              <div className="mt-4 relative">
                <span className="text-3xl font-display font-semibold text-white">
                  {orders.filter(o => o.status !== "Processing").length}
                </span>
                <p className="text-[10.5px] text-zinc-400 mt-1">
                  Verified dispatch & delivery active
                </p>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* SAFE BESPOKE CLIENT METRIC TELEMETRY (DARK MODE) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          
          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Registered Campaigns</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                {totalCampaigns}
              </span>
              <p className="text-[10.5px] text-zinc-500 mt-1">
                Total creative initiatives in progression
              </p>
            </div>
          </div>

          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Active Setup</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                {activeCampaignsCount}
              </span>
              <p className="text-[10.5px] text-zinc-500 mt-1">
                Campaigns undergoing active optimization
              </p>
            </div>
          </div>

          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all relative overflow-hidden group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-zinc-800/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex items-center justify-between opacity-85">
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-400 font-mono">Delivered Outcomes</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4 relative">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                {completedCampaignsCount}
              </span>
              <p className="text-[10.5px] text-zinc-400 mt-1">
                Perfect milestone completion records
              </p>
            </div>
          </div>

          <div className="bg-[#050505] border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-bold tracking-wider uppercase font-mono">Portfolio Value</span>
              <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-display font-semibold tracking-tight text-white">
                ${totalInvestment.toLocaleString()}
              </span>
              <p className="text-[10.5px] text-zinc-500 mt-1">
                Total active campaign budget allocation
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Middle Grid: Client Active Campaigns Tracking list + AI Audience Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
        
        {/* Campaign List */}
        <div className={`${isOperator ? "lg:col-span-2" : "lg:col-span-3"} bg-[#050505] border border-zinc-900 rounded-3xl p-6 space-y-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-lg text-white">
                {isOperator ? "Global Enterprise Placements" : "Active Campaigns & Delivery Timelines"}
              </h3>
              <p className="text-xs text-zinc-500 font-sans mt-0.5">
                {isOperator 
                  ? "A complete registry of every custom order in the systems. Leverage direct dispatch pipelines." 
                  : "Each campaign is handled by prioritized primary coordinators and verified curators."}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-zinc-950 text-zinc-300 border border-zinc-900 px-2 py-0.5 rounded">
              Total Count: {orders.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-mono">
                  <th className="py-3 px-2">Account & ID</th>
                  <th className="py-3">Campaign Target</th>
                  <th className="py-3 text-center">{isOperator ? (showFinancials ? "Client / Supply Cost" : "Client Budget") : "Budget Value"}</th>
                  <th className="py-3 text-right">{isOperator ? (showFinancials ? "Sourcing Harvest" : "Status Details") : "Fulfillment Status"}</th>
                  {isOperator && <th className="py-3 pr-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {orders.map((o) => {
                  const isEditing = editingOrderId === o.id;
                  return (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-zinc-950/40 transition-colors">
                        <td className="py-4 px-2">
                          <div className="font-bold text-white font-mono">{o.id}</div>
                          <div className="text-[10px] text-zinc-400 font-medium">{o.customerName}</div>
                          <div className="text-[9px] text-zinc-500 font-mono">{o.customerEmail}</div>
                        </td>
                        <td className="py-4">
                          <div className="font-medium text-zinc-200">{o.serviceTitle}</div>
                          <span className="text-[9px] px-2 py-0.5 bg-zinc-950 text-zinc-400 border border-zinc-900 rounded-full font-semibold font-mono">
                            {o.category}
                          </span>
                        </td>
                        
                        {isOperator ? (
                          /* OPERATOR BUDGET CELL with optional sourcing costs */
                          <td className="py-4 text-center font-sans">
                            <div className="font-bold text-white">${o.paidAmount}</div>
                            {showFinancials && (
                              <div className="text-[10px] text-red-400 font-mono font-medium block mt-0.5">
                                Cost: ${o.supplierCost}
                              </div>
                            )}
                          </td>
                        ) : (
                          /* CLIENT BUDGET CELL Safe pricing only */
                          <td className="py-4 text-center font-sans">
                            <span className="font-bold text-[#00FF66]">${o.paidAmount}</span>
                          </td>
                        )}

                        {isOperator ? (
                          /* OPERATOR STATUS CELL */
                          <td className="py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              {showFinancials ? (
                                <span className="font-bold text-[#00FF66] text-xs font-mono">
                                  +${o.paidAmount - o.supplierCost} Profit
                                </span>
                              ) : (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                                  o.status === "Processing" 
                                    ? "text-amber-400 bg-amber-950/20 border border-amber-900/40" 
                                    : "text-[#00FF66] bg-[#00FF66]/5 border border-[#00FF66]/15"
                                }`}>
                                  {o.status}
                                </span>
                              )}
                              <span className="text-[9.5px] font-mono text-zinc-500 block mt-0.5 select-none leading-none">
                                {showFinancials ? `Routed to: ${o.supplierName || "N/A"}` : `Active Gateway`}
                              </span>
                              {o.supplierStatus && (
                                <span className="text-[8px] uppercase tracking-wide font-black text-rose-400 bg-rose-950/20 border border-rose-900/30 px-1.5 py-0.5 rounded mt-1.5 leading-none font-mono">
                                  {o.supplierStatus}
                                </span>
                              )}
                            </div>
                          </td>
                        ) : (
                          /* CLIENT STATUS CELL Safe statuses */
                          <td className="py-4 text-right">
                            <div className="inline-flex flex-col items-end">
                              <div className="flex items-center space-x-1.5 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-900">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  o.status === "Processing" ? "bg-amber-400 animate-pulse" : "bg-[#00FF66]"
                                }`}></span>
                                <span className="font-semibold text-[10.5px] text-zinc-300">
                                  {o.status === "Processing" ? "Prioritized Connection" : "Campaign Live"}
                                </span>
                              </div>
                              <div className="text-[9px] text-zinc-500 mt-1 font-sans">
                                Milestone Tracking Active
                              </div>
                            </div>
                          </td>
                        )}

                        {isOperator && (
                          <td className="py-4 pr-2 text-right">
                            <button
                              onClick={() => isEditing ? setEditingOrderId(null) : startEditing(o)}
                              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-all cursor-pointer inline-flex items-center space-x-1"
                              title="Manage Campaign Parameters"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#00FF66]" />
                              <span className="text-[10px] font-semibold hidden sm:inline">Manage</span>
                            </button>
                          </td>
                        )}
                      </tr>

                      {isEditing && (
                        <tr>
                          <td colSpan={5} className="bg-black border-t border-b border-zinc-900 p-4">
                            <div className="space-y-4 max-w-2xl mx-auto animate-in slide-in-from-top-1 duration-200">
                              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                                <span className="text-[11px] font-black uppercase text-white tracking-wider flex items-center gap-1 font-mono">
                                  <Cpu className="w-3.5 h-3.5 text-[#00FF66]" />
                                  <span>Edit Campaign Parameters: {o.id}</span>
                                </span>
                                <button 
                                  onClick={() => setEditingOrderId(null)}
                                  className="text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Campaign Status */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block font-mono">Campaign Status</label>
                                  <select
                                    value={editedStatus}
                                    onChange={(e) => setEditedStatus(e.target.value)}
                                    className="w-full text-xs bg-zinc-950 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] rounded-xl px-2.5 py-2 font-sans outline-none text-zinc-200"
                                  >
                                    <option value="Processing">Processing</option>
                                    <option value="Active Campaign">Active Campaign</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>

                                {/* Supplier status description */}
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block font-mono">Supplier/Fulfillment Status Detail</label>
                                  <input
                                    type="text"
                                    value={editedSupplierStatus}
                                    onChange={(e) => setEditedSupplierStatus(e.target.value)}
                                    placeholder="e.g. Dispatched to premium playlist network"
                                    className="w-full text-xs bg-zinc-950 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] rounded-xl px-2.5 py-2 font-sans outline-none text-zinc-200 placeholder:text-zinc-700"
                                  />
                                </div>

                                {showFinancials && (
                                  <>
                                    {/* Supplier name */}
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block font-mono">Supplier Network Name (Confidential)</label>
                                      <input
                                        type="text"
                                        value={editedSupplierName}
                                        onChange={(e) => setEditedSupplierName(e.target.value)}
                                        className="w-full text-xs bg-zinc-950 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] rounded-xl px-2.5 py-2 font-sans outline-none text-zinc-200"
                                      />
                                    </div>

                                    {/* Supplier cost */}
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block font-mono">Supplier Procurement Cost ($ Confidential)</label>
                                      <input
                                        type="number"
                                        value={editedSupplierCost}
                                        onChange={(e) => setEditedSupplierCost(Number(e.target.value))}
                                        className="w-full text-xs bg-zinc-950 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] rounded-xl px-2.5 py-2 font-sans outline-none text-zinc-200"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Form submit/controls */}
                              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-900">
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => setEditingOrderId(null)}
                                  className="px-3 py-1.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleSaveOrder(o.id)}
                                  className="px-4 py-1.5 bg-white hover:bg-[#00FF66] text-black rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center space-x-1 disabled:opacity-50 shadow-xs"
                                >
                                  {isSaving ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <span>Apply Updates</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-xs font-sans">
                {isOperator 
                  ? "There are no global campaigns in the backend systems yet." 
                  : "No campaigns registered under this profile yet. Start a campaign from the Campaign Desk!"}
              </div>
            )}
          </div>
        </div>

        {/* Strategic Audience Expansion Recommendations */}
        {isOperator && (
          <div className="bg-[#050505] border border-zinc-900 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#00FF66]" />
                  <h3 className="font-display font-semibold text-sm text-white">
                    Operator Trend Analyzer
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full font-mono">
                  Local Analytics
                </span>
              </div>

              {predictions ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-black p-3 rounded-2xl border border-zinc-900">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold block font-mono">Trending Segment Focus</span>
                      <span className="text-xs font-bold text-white">{predictions.trendingSector}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase text-zinc-500 font-bold block font-mono">Top Opportunity Area</span>
                      <span className="text-xs font-bold text-[#00FF66]">{predictions.recommendedCategory}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block font-mono">
                      Data-Driven Strategic Bulletins
                    </span>
                    <div className="space-y-2.5">
                      {predictions.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start text-xs text-zinc-300 gap-2 font-sans leading-normal">
                          <Zap className="w-3.5 h-3.5 text-[#00FF66] mt-0.5 shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-900 font-sans">
                    <span>Statistical Correlation Level:</span>
                    <span className="font-bold text-white font-mono">{predictions.confidenceFactor}% Match</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-zinc-500">
                  Synchronizing analytics correlation indices.
                </div>
              )}
            </div>

            {/* Google Search Trend Sourcing Portal */}
            <div className="bg-black p-4 rounded-2xl border border-zinc-900 mt-4 space-y-3">
              <div>
                <span className="text-xs font-bold text-white block">Sourcing Trend Finder</span>
                <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                  Query current campaigns or active niche markets directly through official search platforms instead of relying on LLM estimations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    id="trend_search_query"
                    value={googleSearchQuery}
                    onChange={(e) => setGoogleSearchQuery(e.target.value)}
                    placeholder="e.g. TikTok promotional campaigns, curator pricing"
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] rounded-xl px-3 py-2 pr-8 font-sans outline-none text-white transition-all placeholder:text-zinc-700"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5" />
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <button
                    id="search_type_web"
                    onClick={() => setSearchTarget("web")}
                    className={`flex-1 text-[10px] py-1 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                      searchTarget === "web"
                        ? "bg-[#00FF66] text-black border-transparent"
                        : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white"
                    }`}
                  >
                    Google Web Search
                  </button>
                  <button
                    id="search_type_trends"
                    onClick={() => setSearchTarget("trends")}
                    className={`flex-1 text-[10px] py-1 px-2 rounded-lg font-semibold border transition-all cursor-pointer text-center ${
                      searchTarget === "trends"
                        ? "bg-[#00FF66] text-black border-transparent"
                        : "bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-white"
                    }`}
                  >
                    Google Trends
                  </button>
                </div>

                <button
                  id="execute_trend_search"
                  onClick={handleTrendSearch}
                  className="w-full flex items-center justify-center space-x-1.5 bg-white hover:bg-[#00FF66] text-black font-semibold text-xs py-2 px-4 rounded-xl cursor-pointer shadow-xs transition-all mt-1 animate-in fade-in active:scale-[0.98]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Verify on Google</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
