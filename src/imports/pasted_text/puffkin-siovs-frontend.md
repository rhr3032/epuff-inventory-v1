You are a senior Next.js frontend engineer. Build a complete, production-quality 
frontend application called "Puffkin SIOVS" (Serialized Inventory & Order 
Verification System) using Next.js (App Router), TypeScript, Tailwind CSS, and 
shadcn/ui components.

This is a FRONTEND-ONLY build. All backend API calls should be written as 
async service functions using fetch/axios pointed to placeholder base URLs 
(e.g. process.env.NEXT_PUBLIC_API_URL). Use mock/static data for initial 
renders so every page is functional and demonstrable without a live backend.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Framework     : Next.js 14+ (App Router, Server & Client Components)
- Language      : TypeScript (strict mode)
- Styling       : Tailwind CSS + shadcn/ui
- State         : Zustand (global) + React Query (server state / API calls)
- Forms         : React Hook Form + Zod validation
- QR/Barcode    : qrcode.react (generate) + @zxing/library (scan via webcam)
- Charts        : Recharts
- PDF/Print     : react-to-print + jsPDF
- Icons         : Lucide React
- Dates         : date-fns
- Tables        : TanStack Table v8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/app
  /(auth)
    /login
  /(dashboard)
    /layout.tsx               ← sidebar + topbar shell
    /page.tsx                 ← dashboard overview
    /products
      /page.tsx               ← product list
      /new/page.tsx
      /[id]/page.tsx
    /categories/page.tsx
    /batches
      /page.tsx
      /new/page.tsx
      /[id]/page.tsx
    /serialization
      /page.tsx               ← generate serial codes
      /[batchId]/page.tsx
    /labels/page.tsx          ← label print module
    /inventory/page.tsx       ← serialized stock view
    /orders
      /page.tsx
      /new/page.tsx
      /[id]/page.tsx
    /scan/page.tsx            ← scan & verification engine
    /packing
      /page.tsx
      /[orderId]/page.tsx
    /invoices
      /page.tsx
      /[id]/page.tsx
    /returns/page.tsx
    /reports/page.tsx
    /users/page.tsx
    /settings/page.tsx
  /verify/[hash]/page.tsx     ← PUBLIC customer verification portal
/components
  /ui/                        ← shadcn components
  /layout/
    Sidebar.tsx
    Topbar.tsx
    Breadcrumb.tsx
  /shared/
    DataTable.tsx
    StatusBadge.tsx
    QRCodeDisplay.tsx
    QRScanner.tsx
    ConfirmDialog.tsx
    PageHeader.tsx
    StatCard.tsx
  /modules/                   ← feature-specific components
/lib
  /api/                       ← all API service functions
  /utils/
    serialization.ts          ← serial code generation logic
    checksum.ts               ← HMAC/checksum utilities
    sku.ts                    ← SKU auto-generation logic
  /validations/               ← all Zod schemas
  /hooks/                     ← custom React hooks
  /stores/                    ← Zustand stores
/types/index.ts               ← all TypeScript interfaces

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 MODULE 1 — AUTH & ROLE MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Roles: Admin | Production Operator | Warehouse Staff

- Login page with email + password (JWT stored in httpOnly cookie via 
  Next.js middleware)
- Role-based route protection using Next.js middleware.ts
- useAuth() hook returning current user, role, permissions
- Sidebar menu items filtered by role:
    Admin            → all modules
    Production Op    → Products, Batches, Serialization, Labels
    Warehouse Staff  → Inventory, Orders, Scan, Packing, Returns
- User management table (Admin only): list, invite, edit role, 
  activate/deactivate users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 MODULE 2 — PRODUCT MASTER MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript interfaces:
  Category { id, name, code, parentId?, level, children?, status }
  SKU { id, categoryId, subCategoryPath[], name, flavor, strength, 
        size, variant, skuCode, status, createdAt }

Features to build:

A) CATEGORY TREE
   - Recursive tree component showing unlimited nesting levels
   - Inline add/edit/delete nodes at any level
   - Drag-to-reorder (optional)
   - Auto-generate category code from name (e.g. "Ice" → "ICE")

B) SKU MANAGEMENT
   - Table with filters: category, status, search
   - Create SKU form with:
     * Category selector (tree dropdown)
     * Attributes: Flavor, Strength (e.g. 30MG/50MG), Size (e.g. 30ML), 
       Variant (e.g. Standard)
   - SKU AUTO-GENERATION (implement in /lib/utils/sku.ts):
     Formula: {CAT_CODE}-{SUBCAT_CODE}-{FLAVOR_CODE}-{SIZE}-{STRENGTH}-{VARIANT}
     Example: ICE-DES-MAN-30-50MG-STD
     Show live preview as user fills the form
   - Active/Inactive toggle
   - SKU detail page showing full hierarchy path + all batches linked

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏭 MODULE 3 — BATCH & PRODUCTION MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript interface:
  Batch { id, batchId, skuId, sku, productionDate, expiryDate, 
          quantity, status, serialsGenerated, createdAt }

Features:
- Batch list table: sortable by date, filterable by SKU/status
- Create Batch form:
    * Batch ID: toggle Auto (BATCH-YYYYMMDD-NNN) or Manual entry
    * Select SKU from dropdown
    * Production date picker
    * Expiry date picker (warn if < 6 months)
    * Quantity (number input, drives serial generation count)
- Batch detail page showing:
    * All batch info
    * Serials generated count vs total quantity
    * Status: Draft → Active → Completed → Expired
    * Quick action buttons: "Generate Serials", "Print Labels", "View Inventory"

QR Data structure to display/explain in UI:
  { serialId, sku, batchId, productionDate, expiryDate, checksum }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 MODULE 4 — SERIALIZATION ENGINE (MOST CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Implement in /lib/utils/serialization.ts:

Serial Code Format:
  {COMPANY_CODE}-{PRODUCT_CODE}-{BATCH_DATE_YYMMDD}-{SERIAL_6DIGIT}-{CHECKSUM_3CHAR}
  Example: PFK-ELIQ-240426-000001-X9K

  generateChecksum(payload: string): string
    → Use a simple HMAC-SHA256 (via Web Crypto API), take first 3 chars 
      of hex output, uppercase

  generateSerialCode(params: {
    companyCode: string,   // "PFK"
    productCode: string,   // SKU short code e.g. "ELIQ"  
    batchDate: Date,       // formats to YYMMDD
    sequenceNumber: number // zero-padded to 6 digits
  }): string

UI — Serialization Page (/serialization/[batchId]):
- Show batch info header (SKU, Batch ID, Total Qty)
- Big action button: "Generate All Serials" with progress bar
- Preview table showing first 10 / last 10 serial codes with QR previews
- Stats: Total Generated | Already Used | Available
- Download serials as CSV button
- Each row: Serial Code | QR mini-preview | Status badge | Created At

Controls displayed prominently:
  ✅ No Duplication Allowed
  ✅ Auto Checksum Validation
  ✅ Encrypted Signature (HMAC)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖨️ MODULE 5 — LABEL PRINTING MODULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Features:
- Select batch → products auto-fetched
- Choose label template (50x30mm default, customizable)
- Set print range: From Serial No. → To Serial No.
- Set copies per label
- Label preview component showing:
    Product Name (bold)
    SKU code
    QR Code (generated via qrcode.react, value = full serial JSON)
    Batch ID | Mfg Date | Exp Date | Net Qty | Strength
    Barcode (serial code as CODE128)
    "Scan QR to verify authenticity" text
- Bulk print: "Print 1000 Labels at Once"
- Print via react-to-print
- Label grid preview (show 4-up, 8-up layout before printing)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MODULE 6 — INVENTORY MANAGEMENT (SERIALIZED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status lifecycle (show as visual stepper/timeline):
  Produced → In Stock → Reserved → Picked → Sold → Delivered → (Returned)

Dashboard cards (real-time stock overview):
  Total Units | In Stock | Reserved | Picked | Sold | Delivered

Main inventory table columns:
  SKU | Product Name | Batch ID | Total Units | In Stock | Reserved | 
  Picked | Sold | Delivered | Expired

Batch-wise view tab + Location-wise view tab (optional)

Unit-level tracking: search by serial ID → show full history timeline:
  PRODUCED → IN STOCK → RESERVED (for Order X) → PICKED → SOLD → DELIVERED

Alert banners:
  🔴 Low Stock Alert (< threshold)
  🟡 Batch Expiry Alert (expiring in 30 days)
  🔴 Negative Stock Alert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MODULE 7 — ORDER MANAGEMENT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TypeScript interface:
  Order { id, orderNo, customer{name,mobile,address,gstin?,email?}, 
          items[]{skuId, sku, requestedQty, availableQty, allocatedQty}, 
          status, deliveryDate, createdAt, batches[] }

Features:

A) ORDER LIST
   - Table with: Order No | Customer | Items | Status | Date | Actions
   - Status filter: Draft | Confirmed | Packing | Dispatched | Delivered
   - Quick view drawer

B) CREATE ORDER FORM
   - Step 1: Customer Details (Name*, Mobile*, Address*, GSTIN optional)
   - Step 2: Add Order Items
       * SKU search dropdown (with stock count shown)
       * Quantity input
       * Real-time stock availability check (green/red indicator)
       * Add multiple SKU lines
       * Show order total table
   - Step 3: System Checks (auto-run on submit):
       ✅ Stock Availability Check per SKU
       ✅ Batch Allocation (FIFO) — show which batches allocated
   - Step 4: Order Confirmation summary
   - Auto-generate Order No: ORD-YYYY-NNNNNN

C) BATCH ALLOCATION VIEW (FIFO)
   Show allocation table: SKU | Batch ID | Mfg Date | Exp Date | 
   Available Qty | Allocated Qty | Remaining Qty
   (oldest batch first)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📷 MODULE 8 — SCAN & VERIFICATION ENGINE (CORE LOGIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the most critical UX module. Build it as a full-screen 
focused interface.

Layout:
  Left panel: Order info + scan progress (X / Y items scanned)
  Center: Camera viewfinder (QR scanner via @zxing/library) 
          + Manual serial entry fallback input
  Right panel: Live scan log feed

For each scan, run these validations IN ORDER and show result instantly:

  Validation Logic (implement in /lib/utils/verification.ts):
  ┌──────────────────┬─────────────────────────────┬──────────┐
  │ Check            │ Condition                   │ Result   │
  ├──────────────────┼─────────────────────────────┼──────────┤
  │ Exists in system │ Serial found in DB          │ ACCEPT / │
  │ Matches SKU      │ Serial SKU = Order SKU      │ REJECT   │
  │ Not already sold │ Status ≠ Sold/Delivered     │          │
  │ Not duplicated   │ Not scanned in this session │          │
  │ Checksum valid   │ HMAC verify passes          │          │
  └──────────────────┴─────────────────────────────┴──────────┘

Scan result display:
  ✅ ACCEPTED → green flash, chime sound, add to list
  ❌ REJECTED → red flash, error sound, show reason:
     "Duplicate Scan" | "Wrong SKU" | "Already Sold" | "Extra Scan"

Accept response card shows:
  Status | Serial ID | SKU | Batch ID | Scan Count | Time

Reject response card shows:
  Status | Reason | Message | Serial ID | Time

Bottom bar: Accepted: X | Rejected: Y | Pending: Z | [Complete Scan Session]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 MODULE 9 — PACKING & DISPATCH MODULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Flow: Select Order → Scan Items → Assign → Mark Dispatched → 
      Generate Packing List

Packing page (/packing/[orderId]):
- Order details header
- Scanned items table:
    # | Serial ID (QR) | SKU | Batch ID | Status | Scan Time | Assigned By
- Actions panel:
    [Start Packing] [Scan Item] [Complete Packing] [Dispatch Order] 
    [Print Packing List]
- Status flow visual: Reserved → Dispatched (on complete)
- Packing summary card:
    Total Items | Scanned Items | Pending Items | Status badge

Packing List (printable PDF):
  Company header (PFK VAPES PVT. LTD.)
  Packing List No. | Order No. | Customer | Delivery Address
  Table: # | Serial ID | Product Name | SKU | Batch ID | Qty
  Total Items | Dispatch Date | Checked By | Authorized By
  Barcode of Order No. at bottom
  "Thank you for your business!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 MODULE 10 — INVOICE GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-triggered after successful scan & dispatch.

Invoice page (/invoices/[id]):

Left side — Order & Customer Details:
  Invoice No. (INV-YYYY-NNNNNN) | Invoice Date | Order No. | Order Date
  Payment Method | Order Status | Delivery Date
  Customer: Name | Mobile | Address | GSTIN | Email

Center — Invoice Items Table:
  # | SKU | Product Name | Batch ID | Serial ID (optional) | Qty | 
  Unit Price | Total Price

Right side:
  Invoice QR Code (contains: OrderID + SecureHash + VerificationURL)
  QR preview with "Scan to verify authenticity" label

Payment Summary:
  Subtotal | Discount | Shipping | CGST (9%) | SGST (9%) | Grand Total

Action buttons:
  [Download Invoice PDF] [Print Invoice] [Share Invoice] 
  [Send on WhatsApp] (wa.me link)

PDF export using jsPDF with company branding.

Invoice QR value:
  JSON.stringify({ orderId, secureHash: hmac(orderId), 
                   verifyUrl: `${BASE_URL}/verify/${hash}` })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 MODULE 11 — CUSTOMER VERIFICATION PORTAL (PUBLIC)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Route: /verify/[hash] — NO authentication required, publicly accessible

Layout (simple, clean, mobile-first — customers scan this on phone):

Step 1: Show "Scanning invoice QR..." loader
Step 2: Verify secure hash via API call
Step 3: Display result:

  ✅ AUTHENTIC PRODUCT card:
    Shield icon (green) + "This product is original and verified"
    Verification Status: VERIFIED
    Secure Hash: a1b2c3d4...
    Verification Time: [timestamp]
    
    Order Details section:
      Order ID | Date | Total Amount | Products ordered
    
    Product Authenticity details per item:
      Product Name | SKU | Batch | Exp Date | Status
    
    "This invoice is genuine and has not been tampered."

  ❌ INVALID card (if hash fails):
    Warning icon (red) + "This product could not be verified"
    "Please contact the seller for assistance."

Mobile-optimized layout, Puffkin/PFK branding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↩️ MODULE 12 — RETURNS & REVERSE LOGISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return flow: Scan QR → Validate → Confirm Return → Update Status → 
             Generate Return Note

Return form:
  1. Scan returned item QR (or manual serial entry)
  2. System shows: Item & Order Details, Customer, Sale Date, 
     Delivery Status
  3. Return details form:
     * Return Date (auto: today)
     * Return Reason* (dropdown: Product Not as Expected | Wrong Item | 
       Damaged | Taste Not Expected | Other)
     * Additional Remarks
     * Item Condition: Good (Restockable) | Damaged / Used
  4. [Confirm Return] button

Status update: Delivered → Returned → Restocked (if Good) / Damaged

Return Note (downloadable PDF):
  Return ID | Order ID | Return Date | Customer info | 
  Product | SKU | Serial ID | Condition | Action Taken

Returns list table:
  Filterable by: date range, product, reason, condition, status
  Columns: Return ID | Order ID | Customer | Product | Reason | 
           Condition | Status | Return Date

Return Statistics cards:
  Total Returns | Restocked Items | Damaged Items | Return Rate %

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 MODULE 13 — REPORTING & ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dashboard page with date range filter (today/week/month/custom).

Charts (using Recharts):
  1. Production vs Sales (bar chart, monthly)
  2. Batch-wise Movement (stacked bar: In Stock / Reserved / Sold / 
     Delivered per batch)
  3. Inventory Status Distribution (pie/donut chart)
  4. Daily Order Volume (line chart)
  5. Return Rate Trend (line chart)

Report Tables with export to CSV:
  - Expiry Tracking: batches expiring in next 30/60/90 days
  - Scan Mismatch Logs: all rejected scans with reason + time + operator
  - Duplicate Scan Alerts: flagged duplicates with serial + order details
  - Top Selling SKUs
  - Stock by Location (if locations enabled)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 UI/UX DESIGN REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Color palette (professional inventory system):
  Primary:    #1E3A5F (dark navy blue)
  Secondary:  #2563EB (blue)
  Success:    #16A34A (green)
  Warning:    #D97706 (amber)
  Danger:     #DC2626 (red)
  Background: #F8FAFC (very light gray)
  Sidebar bg: #0F172A (dark)

Typography: Inter font family

Sidebar:
  Dark background, collapsible on mobile
  Group menu items: SETUP | OPERATIONS | MANAGEMENT | REPORTS
  Show current user avatar + role badge at bottom
  Active route highlighted

Status badges (colored pills):
  Produced=gray | In Stock=blue | Reserved=yellow | 
  Picked=orange | Sold=green | Delivered=teal | Returned=red

All tables must have:
  - Column sorting
  - Search/filter
  - Pagination
  - Row actions (view/edit/delete dropdown)
  - Loading skeletons
  - Empty state illustrations

Forms must have:
  - Zod validation with inline error messages
  - Disabled state during submission
  - Success/error toast notifications (sonner)
  - Auto-save drafts where applicable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 RESPONSIVE & ACCESSIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Mobile-responsive for all pages (sidebar collapses to bottom nav on mobile)
- Scan page optimized for tablet (warehouse use case)
- Customer Verification Portal fully mobile-first
- ARIA labels on all interactive elements
- Keyboard navigation support
- Color-contrast AA compliant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 MOCK DATA & API SERVICE LAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create /lib/api/ with these service files:
  products.ts | categories.ts | batches.ts | serials.ts | 
  inventory.ts | orders.ts | scan.ts | packing.ts | 
  invoices.ts | returns.ts | reports.ts | users.ts

Each service function:
  - Uses React Query for caching
  - Has a mock data fallback (import from /lib/mock/)
  - Is typed with TypeScript generics

Create /lib/mock/ with realistic sample data matching Puffkin's 
e-liquid product catalog (Category: Cartridge, Sub: Ice/Tobacco, 
Flavors: Mango/Vanilla/Mint/Chocolate, Strength: 30MG/50MG, 
Size: 30ML).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ ENVIRONMENT & CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
.env.local:
  NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
  NEXT_PUBLIC_APP_NAME=Puffkin SIOVS
  NEXT_PUBLIC_COMPANY_CODE=PFK
  NEXT_PUBLIC_VERIFY_BASE_URL=https://verify.puffkin.com

next.config.ts: configure image domains, set strictMode: true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 BUILD ORDER (implement in this sequence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Project setup (Next.js + TS + Tailwind + shadcn/ui init)
2. Layout shell (sidebar, topbar, routing)
3. Auth (login page + middleware + useAuth hook)
4. TypeScript types & mock data
5. Dashboard overview page
6. Products & Categories module
7. Batch Management module
8. Serialization Engine (utils + UI)
9. Label Printing module
10. Inventory Management
11. Order Management
12. Scan & Verification Engine (most critical — build carefully)
13. Packing & Dispatch
14. Invoice Generation + PDF export
15. Customer Verification Portal (public)
16. Returns & Reverse Logistics
17. Reports & Analytics
18. User Management
19. Polish: loading states, error boundaries, toasts, responsive

Begin with step 1 and complete each module fully before moving to the next.