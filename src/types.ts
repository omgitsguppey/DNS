/**
 * Shared Type Definitions for Dollars not Sense
 */

export interface DigitalService {
  id: string;
  title: string;
  category: "Musicians" | "Influencers" | "Curators" | string;
  shortDesc: string;
  description: string;
  supplier: string;
  supplierCost: number;
  baseClientPrice: number;
  metrics: {
    rating: number;
    buyers: number;
    timeToDeliver: string;
  };
  // Optional search matching fields
  matchPercentage?: number;
  matchReason?: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  category: string;
  paidAmount: number;
  supplierCost: number;
  arbitrageProfit: number;
  status: string; // 'Processing' | 'Active Campaign' | 'Completed'
  supplierStatus: string;
  supplierName: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  trendingSector: string;
  recommendedCategory: string;
  confidenceFactor: number;
  bullets: string[];
}
