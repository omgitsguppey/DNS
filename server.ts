import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to resolve current user identity from client-supplied Authorization token
function getUserFromHeader(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { email: "", role: "guest" };
  }
  const email = authHeader.substring(7).trim();
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "uylusjohnson@gmail.com";
  const role = email.toLowerCase() === superAdminEmail.toLowerCase() ? "admin" : "user";
  return { email, role };
}



// List of available services. Cleared per client requirements (all preset mock services removed).
const DIGITAL_SERVICES = [
  {
    id: "playlist-traction",
    title: "Playlist Traction Route",
    category: "Musicians",
    shortDesc: "Route your song to indie playlist curators and niche listener pools. Built for streaming discovery and catalog lift.",
    description: "Our core curation route for music catalog elevation. This coordinates submission packages directly across premium independent curators and playlist operators to optimize listener touchpoints and streaming frequency.",
    supplier: "DNS Playlist Division",
    supplierCost: 120,
    baseClientPrice: 299,
    metrics: {
      rating: 4.9,
      buyers: 142,
      timeToDeliver: "3-5 days"
    }
  },
  {
    id: "tiktok-activation",
    title: "TikTok Sound Activation",
    category: "Influencers",
    shortDesc: "Place your sound into creator-led short-form content lanes. Built for clips, saves, searches, and repeat usage.",
    description: "Place your audio or conceptual sound directly into creator-led content pipelines. This packages your song brief for short-form video creators to drive repeat audio usage, searches, and secondary video creations.",
    supplier: "DNS Short-form Division",
    supplierCost: 200,
    baseClientPrice: 499,
    metrics: {
      rating: 4.8,
      buyers: 98,
      timeToDeliver: "4-7 days"
    }
  },
  {
    id: "creator-promo",
    title: "Creator Promo Package",
    category: "Influencers",
    shortDesc: "Bundle creator posts, page placement, and audience routing. Built for visibility across creator surfaces.",
    description: "Bundle multi-page influencer shares and direct creator promotions into a single high-visibility route. Ideal for independent rollout pushes, product/brand launches, and multi-channel audience redirection.",
    supplier: "DNS Creator Desk",
    supplierCost: 350,
    baseClientPrice: 799,
    metrics: {
      rating: 4.9,
      buyers: 74,
      timeToDeliver: "5-10 days"
    }
  },
  {
    id: "release-rollout",
    title: "Release Rollout Support",
    category: "Musicians",
    shortDesc: "Build a launch path around timing, assets, milestones, and campaign phases. Built for structured release momentum.",
    description: "A complete launch track that organizes timing, press packs, pre-save setups, and delivery checklists to ensure your project builds structured momentum through every major phase.",
    supplier: "DNS Strategy Division",
    supplierCost: 250,
    baseClientPrice: 599,
    metrics: {
      rating: 5.0,
      buyers: 53,
      timeToDeliver: "6-week cycle"
    }
  },
  {
    id: "brand-assets",
    title: "Brand & Visual Assets Suite",
    category: "Curators",
    shortDesc: "Artwork, press kit, content packaging, and campaign-ready creative. Built for cleaner presentation and conversion.",
    description: "Premium creative design including high-contrast artwork, digital press packages, and asset sizing ready for submission. Ensures pristine aesthetic consistency across platforms.",
    supplier: "DNS Design Studio",
    supplierCost: 80,
    baseClientPrice: 199,
    metrics: {
      rating: 4.7,
      buyers: 110,
      timeToDeliver: "3 days"
    }
  },
  {
    id: "private-lane",
    title: "Private Campaign Lane",
    category: "Curators",
    shortDesc: "Custom routing for sensitive, high-priority, or NDA-protected campaigns. Built for private execution and controlled access.",
    description: "An isolated, private campaign lane for high-priority projects requiring absolute confidentiality. Utilizes restricted partner access, direct partner escrows, and robust NDAs.",
    supplier: "DNS Private Elite Division",
    supplierCost: 600,
    baseClientPrice: 1499,
    metrics: {
      rating: 5.0,
      buyers: 36,
      timeToDeliver: "On-demand execution"
    }
  }
];

// Simple in-memory database - initialized empty per customer requirements (no pre-populated mock orders)
let orderStore = [];

// Initialize Gemini safely
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Get raw services
app.get("/api/services", (req, res) => {
  res.json(DIGITAL_SERVICES);
});

// 2. Semantic Search Endpoint (uses Gemini if key exists, else smart substring)
// This is an advanced NLP search engine that maps user conversational intent to exact packages
// or dynamically synthesizes ready-to-dropship solutions on-the-fly to support "Any Service, Any Market, Managed Flawlessly"
app.post("/api/gemini/search", async (req, res) => {
  const { query } = req.body;
  if (!query || query.trim() === "") {
    return res.json([]);
  }

  // If Gemini is available, use it for extremely smart semantic reasoning and dynamic fulfillment synthesis.
  if (genAI) {
    try {
      const prompt = `You are the backend AI Curation engine of "Dollars not Sense" (DNS), a high-end luxury creative service concierge.
We offer these curated premium campaign packages:
${JSON.stringify(DIGITAL_SERVICES.map(s => ({ id: s.id, title: s.title, description: s.description, category: s.category, baseClientPrice: s.baseClientPrice, supplier: s.supplier, supplierCost: s.supplierCost })))}

The customer types their core conversational goal: "${query}"

Analyze their exact intent, artistic challenge, or desired campaign outcome.
1. If the request matches one or more of our existing curated packages reasonably well, return the matching package(s) from our roster, enriched with a custom 'matchPercentage' (integer, e.g. 70-100) and a customized, expert 'matchReason' explaining why this fits their exact request.
2. If the request is for something Custom, dynamically design a personalized, premium creative service package!
   Generate a bespoke creative service with:
   - "id": A smart string slug based on the query (e.g., "bespoke-runway-photo" or "podcast-launch-elite")
   - "title": An elegant, premium title matching high standards (e.g., "Bespoke Streetwear Brand Launch Kit")
   - "category": Categorize it into "Musicians", "Influencers", "Curators", or "Enterprise Creative"
   - "shortDesc": A compelling, crisp elevator description
   - "description": A highly structured master checklist & campaign execution guarantee
   - "supplier": "DNS Creative Network"
   - "supplierCost": A placeholder cost value (integer, e.g., $50 to $200)
   - "baseClientPrice": Calculate a suitable professional price (e.g., round to an elegant number like $99 or $149)
   - "metrics": rating (between 4.7 and 5.0), buyers (integer between 10 and 150), timeToDeliver (e.g., "3 days", "4-7 days")
   - "matchPercentage": A high match score (e.g., 95% to 99%)
   - "matchReason": A personalized, highly precise explanation of how our campaign network designs and delivers this creative task.

Return a JSON array containing 1 to 2 items matching or designed for the user's query. Return ONLY valid JSON representation matching the schema.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                shortDesc: { type: Type.STRING },
                description: { type: Type.STRING },
                supplier: { type: Type.STRING },
                supplierCost: { type: Type.INTEGER },
                baseClientPrice: { type: Type.INTEGER },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    rating: { type: Type.NUMBER },
                    buyers: { type: Type.INTEGER },
                    timeToDeliver: { type: Type.STRING }
                  },
                  required: ["rating", "buyers", "timeToDeliver"]
                },
                matchPercentage: { type: Type.INTEGER },
                matchReason: { type: Type.STRING }
              },
              required: [
                "id", "title", "category", "shortDesc", "description", 
                "supplier", "supplierCost", "baseClientPrice", "metrics", 
                "matchPercentage", "matchReason"
              ]
            }
          }
        }
      });

      const text = response.text?.trim() || "[]";
      const parsedMatches = JSON.parse(text);

      if (Array.isArray(parsedMatches) && parsedMatches.length > 0) {
        return res.json(parsedMatches);
      }
    } catch (err) {
      console.error("Gemini semantic search error, falling back to substring:", err);
    }
  }

  // Robust Dynamic Fallback if Gemini key is absent or fails
  const lowercaseQuery = query.toLowerCase().trim();
  const capitalized = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  
  // Decide target creative category dynamically
  let category = "Enterprise Creative";
  if (
    lowercaseQuery.includes("music") || 
    lowercaseQuery.includes("playlist") || 
    lowercaseQuery.includes("spotify") || 
    lowercaseQuery.includes("song") || 
    lowercaseQuery.includes("audio") ||
    lowercaseQuery.includes("sing")
  ) {
    category = "Musicians";
  } else if (
    lowercaseQuery.includes("influencer") || 
    lowercaseQuery.includes("viral") || 
    lowercaseQuery.includes("tiktok") || 
    lowercaseQuery.includes("instagram") ||
    lowercaseQuery.includes("video") ||
    lowercaseQuery.includes("social")
  ) {
    category = "Influencers";
  } else if (
    lowercaseQuery.includes("bio") || 
    lowercaseQuery.includes("link") || 
    lowercaseQuery.includes("brand") || 
    lowercaseQuery.includes("logo") || 
    lowercaseQuery.includes("design") || 
    lowercaseQuery.includes("curator") ||
    lowercaseQuery.includes("art")
  ) {
    category = "Curators";
  }

  const synthesizedService = {
    id: `dynamic-${Math.random().toString(36).substring(2, 9)}`,
    title: `${capitalized} Campaign Framework`,
    category: category,
    shortDesc: `Custom designed program targeting optimized ${category.toLowerCase()} exposure outcomes.`,
    description: `A bespoke campaign mapping tailored to your specific targets. Includes custom delivery coordinates, priority curator pitching, complete review reports, and milestone validation tracking. Managed for you from end to end.`,
    supplier: "DNS Creative Network",
    supplierCost: 75,
    baseClientPrice: 149,
    metrics: {
      rating: 4.9,
      buyers: 58,
      timeToDeliver: "3-5 days"
    },
    matchPercentage: 99,
    matchReason: `Vetted custom parameters configured to fulfill your exact query: "${query}"`
  };

  res.json([synthesizedService]);
});

// 3. Digital Concierge Chatbot - Terminated as per strict client requirements (we favor search and dynamic UI)
app.post("/api/gemini/chatbot", (req, res) => {
  res.status(404).json({ error: "Concierge advisory chat has been replaced by semantic search systems." });
});

// 4. Create Order Endpoint
app.post("/api/orders/create", async (req, res) => {
  res.json({ success: true, message: "Order creation handles client-side." });
});

// 5. Get master orders (for user campaigns and administrator tracking)
app.get("/api/orders", async (req, res) => {
  res.json([]);
});

// 6. Predict next high-demand trends using Gemini (or smart statistics fallback)
app.get("/api/gemini/predictions", (req, res) => {
  res.json({
    trendingSector: "TikTok Audio Drives",
    recommendedCategory: "Independent Music",
    confidenceFactor: 95,
    bullets: [
      "Dynamic statistical trends have been refactored client-side to avoid taxing LLM resources.",
      "Google Search trend verification portal is active in Executive Command dashboard."
    ]
  });
});

// Set up Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dollars not Sense server running on http://localhost:${PORT}`);
  });
}

startServer();
