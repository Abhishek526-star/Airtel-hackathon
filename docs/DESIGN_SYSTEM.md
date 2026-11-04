# PROJECT UDYAM DIGITAL — UI/UX DESIGN SYSTEM & VISUAL IDENTITY
**Hackathon:** Airtel SYNC Hackathon 2026 — Enterprise Track A  
**Platform:** Project Udyam Digital (Accel Business)  
**Theme:** Airtel SYNC Enterprise Brand Guidelines  
**Document Status:** Complete (Phase 2 Baseline)  

---

## 1. Design Philosophy & Direction

Project Udyam Digital is designed to feel like an authoritative, tier-1 enterprise telecommunications platform tailored specifically for Indian MSMEs. It eschews generic dashboard tropes in favor of:
- **Instant Clarity & Legibility:** High contrast typography, generous touch targets, and zero cognitive clutter for busy small business owners operating on smartphones in sunlit shops.
- **Enterprise Credibility & Trust:** Deep slates (`#111827`, `#1F2937`), crisp border radii (`rounded-xl`), and controlled, purposeful application of Airtel Signature Red (`#E31E24`) for calls to action, selected active states, and critical milestones.
- **DPDP & Transparency First:** Every document upload, consent prompt, and billing breakdown is laid out with crystal-clear itemization, eliminating anxiety around hidden telecom surcharges.

---

## 2. Color System & Design Tokens

```css
:root {
  /* Airtel SYNC Brand Accents */
  --color-primary-red: #E31E24;       /* Primary CTA, Selected States, Brand Badges */
  --color-dark-red: #B5121B;          /* Hover, Active Press, High-Emphasis Elements */
  --color-light-red: #FEF2F2;         /* Subtle Red Tint, Badge Backgrounds */
  --color-red-border: #FCA5A5;        /* Active Input Rings, Alert Borders */

  /* Neutral Surface & Canvas */
  --color-canvas-bg: #F8FAFC;         /* Soft Cool Gray Application Background */
  --color-surface-white: #FFFFFF;     /* Primary Card & Modal Background */
  --color-surface-subtle: #F1F5F9;   /* Table Headers, Disabled States */
  
  /* Enterprise Slate Hierarchy */
  --color-slate-primary: #111827;     /* Headings, Primary Labels, Deep Headers */
  --color-slate-secondary: #1F2937;   /* Sub-headings, Sidebar Fill */
  --color-slate-muted: #6B7280;       /* Secondary Captions, Timestamps, Placeholders */
  --color-border-subtle: #E5E7EB;     /* Dividers, Card Outlines */

  /* Semantic Feedback Tokens */
  --color-success: #16A34A;           /* Verified KYC, Active Service SLA, Healthy */
  --color-success-bg: #F0FDF4;        /* Success Alert Background */
  --color-warning: #F59E0B;           /* Incomplete Documents, Installation Pending */
  --color-warning-bg: #FFFBEB;        /* Warning Alert Background */
  --color-error: #DC2626;             /* Document Rejected, Validation Error */
  --color-error-bg: #FEF2F2;          /* Error Alert Background */
  --color-info: #0284C7;              /* Cloud / Bandwidth Telemetry, Informational */
  --color-info-bg: #F0F9FF;           /* Info Alert Background */
}
```

---

## 3. Typography Hierarchy

We utilize standard web font stacks prioritizing **Inter** and modern sans-serif typefaces:

| Token | CSS Class / Rules | Desktop Size | Mobile Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `text-4xl md:text-5xl font-extrabold tracking-tight` | 48px | 36px | 800 | Hero Value Proposition |
| **Heading 1** | `text-2xl md:text-3xl font-bold tracking-tight` | 30px | 24px | 700 | Main Section Titles, Dashboard Headers |
| **Heading 2** | `text-xl md:text-2xl font-semibold` | 24px | 20px | 600 | Card Titles, Modal Headers, Stepper Headings |
| **Heading 3** | `text-lg font-semibold` | 18px | 16px | 600 | Bundle Card Names, Form Section Titles |
| **Body Large**| `text-base font-normal leading-relaxed` | 16px | 15px | 400 | Introductory Paragraphs, Advisor Dialogue |
| **Body Reg**  | `text-sm font-normal leading-normal` | 14px | 14px | 400 | Standard Labels, Form Fields, Table Data |
| **Caption**   | `text-xs font-medium text-slate-500` | 12px | 12px | 500 | Badges, Timestamps, Disclaimers, GST notes |

---

## 4. Spacing, Elevation & Corner Radii

- **Grid Spacing System:** Strict multiples of 4px (`p-2`, `p-4`, `p-6`, `p-8`).
- **Container Max-Width:** Max 1280px (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).
- **Radii:**
  - Micro Badges & Pills: `rounded-full`
  - Form Inputs, Buttons, Small Cards: `rounded-lg` (8px)
  - Primary Product & Step Containers: `rounded-xl` (12px)
  - Hero Highlight Boxes & Large Modals: `rounded-2xl` (16px)
- **Shadows:**
  - Standard Card: `shadow-sm border border-slate-200`
  - Floating Popover / Dropdown: `shadow-lg border border-slate-100`
  - Selected Bundle Highlight: `shadow-md ring-2 ring-red-500`

---

## 5. Responsive Design Standards & Breakpoints

- **Mobile Viewports (360px – 640px):**
  - Full-width stacked form inputs.
  - Sticky bottom floating actions (`fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-xl`) for primary checkout/continue buttons.
  - Collapsible drawer navigation and horizontal touch-scrollable stepper headers.
- **Tablet (641px – 1024px):**
  - 2-column responsive grid for product cards.
  - Compact side navigation drawer.
- **Desktop (1025px+):**
  - Side-by-side split layouts (e.g., Left: Advisor Chat; Right: Live Dynamic Bundle Preview).
  - Fixed persistent enterprise top bar and left navigation sidebar for Partner and Admin dashboards.
