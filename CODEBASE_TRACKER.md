# Codebase Tracker Log

This file tracks all core components, functions, hooks, and security schemas of the **Dollars not Sense** enterprise campaign desk platform. It serves as a single source of truth for security rules and logic audits.

---

## 1. Directory Structure

```
├── firestore.rules               # Multi-role hardened security rules (Admin, Staff, Mod, Client)
├── firebase-blueprint.json       # Document schemas and data types
├── metadata.json                 # App config & capability permissions
├── CODEBASE_TRACKER.md           # Single source of truth log of modified endpoints and components
├── src/
│   ├── main.tsx                  # Client entry point
│   ├── App.tsx                   # Central router, order state dispatcher & dark mode shell
│   ├── firebase.ts               # Firestore initializing, auth helpers & error wrappers
│   ├── types.ts                  # Shared typescript definitions
│   └── components/
│       ├── Navigation.tsx        # Compact, luxury dark nav bar with animated role badges & profile controls
│       ├── OperatorDashboard.tsx # Role-bifurcated KPI metrics, table registers & inline management forms
│       ├── SemanticHero.tsx      # Outcome-first search planner with curated action tags
│       ├── CampaignEcosystem.tsx # "Campaign Outcomes" selector displaying SLAs, reach & custom execution lanes
│       ├── ServiceCard.tsx       # Dark-glass service cards featuring electric green stars & ratings
│       └── CheckoutSheet.tsx     # Secure checkout sheet wrapper styled in black and electric green
```

---

## 2. Component & Function Inventory

### `App.tsx`
*   `currentUser` state: Tracks authenticated profiles (`role: "admin" | "staff" | "mod" | "user" | "guest"`).
*   `onAuthStateChanged`: Subscribes to auth states, dynamically queries user role doc from `/users/{uid}`, falls back to guest.
*   `loadOrders`: Administrative query fetching all campaign placements if operator; filters by client email if user.
*   `orders` state: Standardized collection matching.
*   *Styling*: True-black `#000000` background theme with high-contrast text layout.
*   *Mobile Layout Compression*: Reduced vertical sprawl, tightened spacing, reduced card padding, minimized repetitive copy, and condensed hero and sections for denser mobile layouts.
*   *Homepage Layout Modules*:
    1. **Hero / Outcome Search**: Strong headline, search form, primary CTA, and supporting proof lines.
    2. **Campaign Outcomes**: Specific selector cards with customizable parameters.
    3. **How DNS Routes Campaigns**: Elegant three-step pipeline breakdown.
    4. **Proof / Credibility Strip**: Horizontal high-impact metrics display.
    5. **Campaign Access Desk**: Premium booking invitation CTA leading back to outcome planners.

### `components/CampaignEcosystem.tsx` (Campaign Outcomes)
*   Replaced category workspace with "Campaign Outcomes" panel.
*   Renders exactly six core buyer outcomes:
    1. Playlist Traction
    2. TikTok Sound Activation
    3. Creator Promo Packages
    4. Release Rollout Support
    5. Brand & Visual Assets
    6. Private Campaign Lane
*   Features: Detail panel highlighting short buyer promises, "Best For," "What DNS Handles," "Campaign Includes," and "Next Step" indicators.

### `components/OperatorDashboard.tsx`
*   `predictions` state: Local strategy trend correlation factor without relying on external LLM calls.
*   `editingOrderId` / `isSaving` states: Controls the inline placement manager collapsible rows.
*   `startEditing()`: Pre-populates fields matching privilege constraints.
*   `handleSaveOrder()`: Issues direct transactional atomic updates to `/orders/{id}` via Firestore.
*   **True Black Dark Mode (#000000):** Visual redesign aligning with standard iOS / Apple software philosophy. Redesigned layout to utilize `#000000` canvas with `#050505` cards, `zinc-900` high-contrast borders, custom typography spacing, and neon green highlights.
*   **Role-Based Access Control Boundaries:**
    *   *Super Admin* (`role === 'admin'`) & *Campaign Staff* (`role === 'staff'`): Access to Capital Inflows, Procurement Costs, Sourcing Net Margin Arbitrage percentage, Supplier Network Names, and Supplier procurement cost edits.
    *   *Desk Moderator* (`role === 'mod'`): Least-privilege access restricted to Fulfillment rates, active connection volumes, inline Status modifiers, and delivery status text overrides (completely redacted of commercial financial costs/profits).

### `components/Navigation.tsx`
*   `isOperator`: Computes binary operator badge flag.
*   *Branding*: Clean luxury neon-ring badge containing `$` with "Dollars not Sense" typography.
*   *Responsive Elements*: Compact tab controllers and animated profile statuses for Super Admin (Purple), Campaign Staff (Emerald), and Desk Moderator (Amber).

### `components/SemanticHero.tsx`
*   DNS Doctrine Alignment: "Tell us what you need moved. DNS builds the campaign."
*   Curated quick tags: "Grow my song", "Activate creators", "Push a release", "Route to playlists", "Build a rollout", "Move attention".
*   Proof metrics line: "1.18B+ verified lifetime streams and video views across DNS / iKandy music, media, and creator surfaces."

### `components/CheckoutSheet.tsx`
*   Configured as an elegant dark side drawer, integrating border-zinc-900 grid layouts and high-impact transaction controls.
*   Selects execution tiers (One-Time, Ongoing Campaign, or Custom Setup) and logs them into `/orders` using PayPal SDK mock gateways.

---

## 3. Database & Security Schema

### Collection: `users`
*   **Fields**: `email` (string), `name` (string), `role` (`'admin' | 'staff' | 'mod' | 'user'`).
*   **Permissions**: Read allowed for Owners and Operators. Writes restricted to Owner creation or Admin overwrite.

### Collection: `orders`
*   **Fields**: `id` (string), `serviceId` (string), `serviceTitle` (string), `customerName` (string), `customerEmail` (string), `category` (string), `paidAmount` (number), `status` (string), `date` (string), `supplierCost` (number, optional), `arbitrageProfit` (number, optional), `supplierStatus` (string, optional), `supplierName` (string, optional).
*   **Permissions**: Read limited to owners or operators. Write/Modify locked to valid client order creation and operator connection controls.
