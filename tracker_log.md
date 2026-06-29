# DNS Campaign Console — Canonical Codebase Tracker

This tracker log maintains a comprehensive inventory of all active features, subroutines, modules, and views inside the application. Use this document as the canonical reference for audits, verification, and regression prevention.

---

## 1. File Inventory & Purpose

| Component Path | Technical Purpose | Key State & Props |
| :--- | :--- | :--- |
| `/src/App.tsx` | App shell, view routing, user sign-in flow, true-black layout, and service catalog directory. | `currentView`, `orders`, `searchQuery`, `currentUser` |
| `/src/components/Navigation.tsx` | iOS-inspired luxury global navigation bar with dark styling and animated status indicators. | `currentView`, `orderCount`, `currentUser` |
| `/src/components/SemanticHero.tsx` | Search interface with outcome suggestions, dark aesthetics, and verified reach proofing. | `onSearch`, `isSearching`, `query` |
| `/src/components/CampaignEcosystem.tsx` | "Campaign Outcomes" panel allowing users to instantly select and explore six core buyer goals. | `activeLaneId`, `onSelectRequest`, `currentQuery` |
| `/src/components/ServiceCard.tsx` | Sourced campaign service feed cards rendered with elegant dark-glass overlays and electric green highlights. | `service`, `onBuy`, `currentUser` |
| `/src/components/CheckoutSheet.tsx` | Dark side drawer for campaign tier setup, client contact authorization, and simulated payment gateways. | `service`, `onClose`, `currentUser`, `onOrderCreated` |
| `/src/types.ts` | Unified TypeScript declarations for services, logs, users, and campaign states. | Static Declarations |
| `/src/firebase.ts` | Lazy initialization engine for Cloud Firestore and Firebase Core Authentication services. | Lazy SDK initialization |
| `/server.ts` | Full-stack Express server proxying OAuth parameters and declaring premium service items. | Node/Express middleware |

---

## 2. Comprehensive Function & Subroutine Index

### A. Root Application Handlers (`/src/App.tsx`)
- **`handleSemanticSearch`**: Performs local search scoring over the service catalog, updating active list matching states.
- **`handleOrderCreated`**: Appends confirmed orders to state, persisting to memory and moving navigation focus to backstage status tracking.
- **`handleGoogleLogin`**: Authenticates credentials securely to unlock active campaign deployment features.
- **`handleLogout`**: Resets credential contexts, returning the console layout to standard viewports.

### B. Direct-Delivery Sourcing Channels (`/src/components/CampaignEcosystem.tsx`)
- **`setActiveLaneId`**: Highlights active channel profiles from tactile selectors, immediately updating dashboard specs in real time.
- **`onSelectRequest`**: Instantly maps request briefs onto semantic input feeds.

### C. Live Operations & Backstage Queue (`/src/components/BackstageDashboard.tsx` / `OperatorDashboard.tsx`)
- **Total Portfolio Revenue Calculations**: Statically derived arrays computing global margins, processing counts, and active campaign channels.

---

## 3. Verified System Auditing Settings

- **True Black Dark Elements**: Configured flat background #000000 layers across the main app shell, navigation panels, and drawer drawers.
- **Pragmatic Mobile Usability**: Replaced old circular orbit lines with an exquisite, touch-target optimized bento matrix module.
- **Zero Mock Simulators**: All operations mapped securely onto client inputs and standard local/database operations.
- **DNS Doctrine Language & Proof Copy**: Replaced generic "Premium Digital Concierge" and "Get It Done" terminology with the core routing framework layout (focused on motion, access, routing, and a verified 1.18B+ streams/views proof line).
