import { useState, useEffect } from "react";
import {
  LayoutDashboard, Package, Tag, Layers, QrCode, Printer, BarChart3,
  ShoppingCart, ScanLine, Box, FileText, RotateCcw, TrendingUp, Users,
  Settings, ChevronRight, ChevronDown, Bell, Search, LogOut, Menu, X,
  Plus, Download, Eye, Edit2, Trash2, Check, AlertTriangle, Shield,
  CheckCircle2, XCircle, Clock, ArrowRight, Filter, MoreHorizontal,
  RefreshCw, Upload, Zap, TrendingDown, Activity, Hash, Calendar,
  MapPin, Phone, Mail, Star, ChevronLeft, ChevronUp, Smartphone
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "Admin" | "Production Operator" | "Warehouse Staff";
type Page =
  | "dashboard" | "products" | "products-new" | "products-detail"
  | "categories" | "batches" | "batches-new" | "batches-detail"
  | "serialization" | "serialization-detail" | "labels" | "inventory"
  | "orders" | "orders-new" | "orders-detail" | "scan" | "packing"
  | "packing-detail" | "invoices" | "invoices-detail" | "returns"
  | "reports" | "users" | "settings" | "verify";

interface User { id: string; name: string; email: string; role: Role; avatar: string; status: "Active" | "Inactive"; }
interface Category { id: string; name: string; code: string; parentId?: string; level: number; status: "Active" | "Inactive"; children?: Category[]; }
interface Product { id: string; categoryId: string; name: string; flavor: string; strength: string; size: string; variant: string; skuCode: string; status: "Active" | "Inactive"; createdAt: string; }
interface Batch { id: string; batchId: string; skuId: string; sku: string; productionDate: string; expiryDate: string; quantity: number; status: "Draft" | "Active" | "Completed" | "Expired"; serialsGenerated: number; createdAt: string; }
interface Serial { id: string; code: string; batchId: string; skuId: string; status: "Available" | "Reserved" | "Sold" | "Returned"; createdAt: string; }
interface InventoryItem { id: string; sku: string; productName: string; batchId: string; totalUnits: number; inStock: number; reserved: number; picked: number; sold: number; delivered: number; expired: number; }
interface OrderItem { skuId: string; sku: string; requestedQty: number; availableQty: number; allocatedQty: number; }
interface Order { id: string; orderNo: string; customer: { name: string; mobile: string; address: string; gstin?: string; email?: string; }; items: OrderItem[]; status: "Draft" | "Confirmed" | "Packing" | "Dispatched" | "Delivered"; deliveryDate: string; createdAt: string; }
interface ReturnRecord { id: string; returnId: string; orderId: string; customer: string; product: string; sku: string; serialId: string; reason: string; condition: "Good" | "Damaged"; status: "Pending" | "Restocked" | "Damaged"; returnDate: string; }
interface ScanLog { id: string; serialCode: string; result: "ACCEPTED" | "REJECTED"; reason?: string; skuId: string; batchId: string; time: string; }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USER: User = { id: "u1", name: "Admin User", email: "admin@puffkin.com", role: "Admin", avatar: "AU", status: "Active" };

const MOCK_CATEGORIES: Category[] = [
  { id: "c1", name: "Cartridge", code: "CART", level: 0, status: "Active", children: [
    { id: "c2", name: "Ice", code: "ICE", parentId: "c1", level: 1, status: "Active" },
    { id: "c3", name: "Tobacco", code: "TOB", parentId: "c1", level: 1, status: "Active" },
    { id: "c4", name: "Dessert", code: "DES", parentId: "c1", level: 1, status: "Active" },
  ]},
  { id: "c5", name: "Disposable", code: "DISP", level: 0, status: "Active", children: [
    { id: "c6", name: "Salt Nic", code: "SLT", parentId: "c5", level: 1, status: "Active" },
  ]},
];

const MOCK_PRODUCTS: Product[] = [
  { id: "p1", categoryId: "c2", name: "Mango Ice 30ML 50MG", flavor: "Mango", strength: "50MG", size: "30ML", variant: "Standard", skuCode: "CART-ICE-MAN-30-50MG-STD", status: "Active", createdAt: "2024-01-15" },
  { id: "p2", categoryId: "c2", name: "Mint Ice 30ML 30MG", flavor: "Mint", strength: "30MG", size: "30ML", variant: "Standard", skuCode: "CART-ICE-MNT-30-30MG-STD", status: "Active", createdAt: "2024-01-16" },
  { id: "p3", categoryId: "c3", name: "Vanilla Tobacco 30ML 50MG", flavor: "Vanilla", strength: "50MG", size: "30ML", variant: "Standard", skuCode: "CART-TOB-VAN-30-50MG-STD", status: "Active", createdAt: "2024-01-17" },
  { id: "p4", categoryId: "c4", name: "Chocolate Dessert 30ML 30MG", flavor: "Chocolate", strength: "30MG", size: "30ML", variant: "Premium", skuCode: "CART-DES-CHO-30-30MG-PRM", status: "Active", createdAt: "2024-01-18" },
  { id: "p5", categoryId: "c2", name: "Lychee Ice 30ML 50MG", flavor: "Lychee", strength: "50MG", size: "30ML", variant: "Standard", skuCode: "CART-ICE-LYC-30-50MG-STD", status: "Inactive", createdAt: "2024-01-19" },
];

const MOCK_BATCHES: Batch[] = [
  { id: "b1", batchId: "BATCH-20240426-001", skuId: "p1", sku: "CART-ICE-MAN-30-50MG-STD", productionDate: "2024-04-26", expiryDate: "2025-04-26", quantity: 500, status: "Active", serialsGenerated: 500, createdAt: "2024-04-26" },
  { id: "b2", batchId: "BATCH-20240501-002", skuId: "p2", sku: "CART-ICE-MNT-30-30MG-STD", productionDate: "2024-05-01", expiryDate: "2025-05-01", quantity: 300, status: "Active", serialsGenerated: 300, createdAt: "2024-05-01" },
  { id: "b3", batchId: "BATCH-20240510-003", skuId: "p3", sku: "CART-TOB-VAN-30-50MG-STD", productionDate: "2024-05-10", expiryDate: "2025-05-10", quantity: 200, status: "Completed", serialsGenerated: 200, createdAt: "2024-05-10" },
  { id: "b4", batchId: "BATCH-20240515-004", skuId: "p4", sku: "CART-DES-CHO-30-30MG-PRM", productionDate: "2024-05-15", expiryDate: "2024-11-15", quantity: 150, status: "Active", serialsGenerated: 0, createdAt: "2024-05-15" },
  { id: "b5", batchId: "BATCH-20231001-005", skuId: "p1", sku: "CART-ICE-MAN-30-50MG-STD", productionDate: "2023-10-01", expiryDate: "2024-10-01", quantity: 400, status: "Expired", serialsGenerated: 400, createdAt: "2023-10-01" },
];

const MOCK_INVENTORY: InventoryItem[] = [
  { id: "i1", sku: "CART-ICE-MAN-30-50MG-STD", productName: "Mango Ice 30ML 50MG", batchId: "BATCH-20240426-001", totalUnits: 500, inStock: 320, reserved: 80, picked: 40, sold: 45, delivered: 15, expired: 0 },
  { id: "i2", sku: "CART-ICE-MNT-30-30MG-STD", productName: "Mint Ice 30ML 30MG", batchId: "BATCH-20240501-002", totalUnits: 300, inStock: 210, reserved: 50, picked: 20, sold: 15, delivered: 5, expired: 0 },
  { id: "i3", sku: "CART-TOB-VAN-30-50MG-STD", productName: "Vanilla Tobacco 30ML 50MG", batchId: "BATCH-20240510-003", totalUnits: 200, inStock: 80, reserved: 60, picked: 30, sold: 25, delivered: 5, expired: 0 },
  { id: "i4", sku: "CART-DES-CHO-30-30MG-PRM", productName: "Chocolate Dessert 30ML 30MG", batchId: "BATCH-20240515-004", totalUnits: 150, inStock: 12, reserved: 100, picked: 20, sold: 10, delivered: 8, expired: 0 },
];

const MOCK_ORDERS: Order[] = [
  { id: "o1", orderNo: "ORD-2024-000001", customer: { name: "Rajesh Distributors", mobile: "9876543210", address: "123 MG Road, Mumbai, MH 400001", gstin: "27AABCU9603R1ZX", email: "rajesh@dist.com" }, items: [{ skuId: "p1", sku: "CART-ICE-MAN-30-50MG-STD", requestedQty: 50, availableQty: 320, allocatedQty: 50 }], status: "Delivered", deliveryDate: "2024-05-10", createdAt: "2024-05-05" },
  { id: "o2", orderNo: "ORD-2024-000002", customer: { name: "Vikram Traders", mobile: "9123456789", address: "45 Anna Nagar, Chennai, TN 600040", gstin: "33BBBCU1234R1ZX", email: "vikram@traders.in" }, items: [{ skuId: "p2", sku: "CART-ICE-MNT-30-30MG-STD", requestedQty: 30, availableQty: 210, allocatedQty: 30 }, { skuId: "p3", sku: "CART-TOB-VAN-30-50MG-STD", requestedQty: 20, availableQty: 80, allocatedQty: 20 }], status: "Packing", deliveryDate: "2024-06-15", createdAt: "2024-06-10" },
  { id: "o3", orderNo: "ORD-2024-000003", customer: { name: "Priya Wholesale", mobile: "9988776655", address: "78 Koramangala, Bengaluru, KA 560034", email: "priya@wholesale.co" }, items: [{ skuId: "p4", sku: "CART-DES-CHO-30-30MG-PRM", requestedQty: 25, availableQty: 12, allocatedQty: 12 }], status: "Confirmed", deliveryDate: "2024-06-20", createdAt: "2024-06-12" },
  { id: "o4", orderNo: "ORD-2024-000004", customer: { name: "Mohan Enterprise", mobile: "9876512340", address: "22 Civil Lines, Delhi, DL 110001", gstin: "07CCBCU5678R1ZX" }, items: [{ skuId: "p1", sku: "CART-ICE-MAN-30-50MG-STD", requestedQty: 100, availableQty: 320, allocatedQty: 100 }], status: "Draft", deliveryDate: "2024-06-25", createdAt: "2024-06-14" },
];

const MOCK_RETURNS: ReturnRecord[] = [
  { id: "r1", returnId: "RET-2024-000001", orderId: "ORD-2024-000001", customer: "Rajesh Distributors", product: "Mango Ice 30ML 50MG", sku: "CART-ICE-MAN-30-50MG-STD", serialId: "PFK-ELIQ-240426-000042-X9K", reason: "Product Not as Expected", condition: "Good", status: "Restocked", returnDate: "2024-05-18" },
  { id: "r2", returnId: "RET-2024-000002", orderId: "ORD-2024-000001", customer: "Rajesh Distributors", product: "Mango Ice 30ML 50MG", sku: "CART-ICE-MAN-30-50MG-STD", serialId: "PFK-ELIQ-240426-000107-B3M", reason: "Damaged", condition: "Damaged", status: "Damaged", returnDate: "2024-05-19" },
];

const MOCK_USERS: User[] = [
  { id: "u1", name: "Admin User", email: "admin@puffkin.com", role: "Admin", avatar: "AU", status: "Active" },
  { id: "u2", name: "Suresh Kumar", email: "suresh@puffkin.com", role: "Production Operator", avatar: "SK", status: "Active" },
  { id: "u3", name: "Deepa Nair", email: "deepa@puffkin.com", role: "Warehouse Staff", avatar: "DN", status: "Active" },
  { id: "u4", name: "Ramesh Singh", email: "ramesh@puffkin.com", role: "Warehouse Staff", avatar: "RS", status: "Inactive" },
];

const CHART_PRODUCTION_SALES = [
  { month: "Jan", production: 1200, sales: 980 },
  { month: "Feb", production: 1400, sales: 1100 },
  { month: "Mar", production: 1100, sales: 1200 },
  { month: "Apr", production: 1600, sales: 1400 },
  { month: "May", production: 1800, sales: 1650 },
  { month: "Jun", production: 1500, sales: 1300 },
];
const CHART_DAILY_ORDERS = [
  { day: "Mon", orders: 12 }, { day: "Tue", orders: 18 }, { day: "Wed", orders: 14 },
  { day: "Thu", orders: 22 }, { day: "Fri", orders: 28 }, { day: "Sat", orders: 16 }, { day: "Sun", orders: 8 },
];
const CHART_INVENTORY_PIE = [
  { name: "In Stock", value: 622, color: "#2563EB" },
  { name: "Reserved", value: 290, color: "#D97706" },
  { name: "Picked", value: 110, color: "#7C3AED" },
  { name: "Sold", value: 95, color: "#16A34A" },
  { name: "Delivered", value: 33, color: "#0891B2" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateSerial(companyCode: string, productCode: string, batchDate: string, seq: number): string {
  const padded = String(seq).padStart(6, "0");
  const payload = `${companyCode}-${productCode}-${batchDate}-${padded}`;
  // Simple checksum: first 3 chars of base36 hash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) hash = ((hash << 5) - hash) + payload.charCodeAt(i);
  const checksum = Math.abs(hash).toString(36).toUpperCase().slice(0, 3).padStart(3, "0");
  return `${payload}-${checksum}`;
}

// ─── Design System Components ─────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  "Active": "bg-green-100 text-green-700",
  "Inactive": "bg-gray-100 text-gray-500",
  "Draft": "bg-gray-100 text-gray-600",
  "Confirmed": "bg-blue-100 text-blue-700",
  "Packing": "bg-amber-100 text-amber-700",
  "Dispatched": "bg-purple-100 text-purple-700",
  "Delivered": "bg-teal-100 text-teal-700",
  "Expired": "bg-red-100 text-red-700",
  "Completed": "bg-green-100 text-green-700",
  "In Stock": "bg-blue-100 text-blue-700",
  "Reserved": "bg-amber-100 text-amber-700",
  "Picked": "bg-orange-100 text-orange-700",
  "Sold": "bg-green-100 text-green-700",
  "Returned": "bg-red-100 text-red-700",
  "Restocked": "bg-teal-100 text-teal-700",
  "Damaged": "bg-red-100 text-red-700",
  "Available": "bg-blue-100 text-blue-700",
  "Pending": "bg-yellow-100 text-yellow-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, color = "blue", trend }: {
  label: string; value: string | number; sub?: string; icon: any; color?: string; trend?: number;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600", teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-semibold text-foreground font-mono">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <input
        className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-card w-64 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        placeholder={placeholder ?? "Search..."}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled }: {
  children?: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md"; icon?: any; disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-blue-700 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-accent focus:ring-primary",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-primary",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-700 focus:ring-destructive",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className={size === "sm" ? "size-3" : "size-4"} />}
      {children}
    </button>
  );
}

function Table<T>({ columns, data, emptyMsg = "No records found" }: {
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode; className?: string }[];
  data: T[];
  emptyMsg?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted border-b border-border">
            {columns.map(c => (
              <th key={c.key} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide ${c.className ?? ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
              <div className="flex flex-col items-center gap-2">
                <Package className="size-8 text-muted-foreground/40" />
                {emptyMsg}
              </div>
            </td></tr>
          ) : data.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              {columns.map(c => (
                <td key={c.key} className={`px-4 py-3 text-foreground ${c.className ?? ""}`}>
                  {c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QRBlock({ value, size = 80 }: { value: string; size?: number }) {
  // Simple QR visual placeholder with grid pattern
  const cells = 11;
  const pattern = value.split("").reduce((acc, c, i) => { acc[i % (cells * cells)] = c.charCodeAt(0) % 2 === 0; return acc; }, {} as Record<number, boolean>);
  return (
    <div style={{ width: size, height: size }} className="bg-white border border-border rounded p-1 flex-shrink-0">
      <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${cells}, 1fr)` }}>
        {Array.from({ length: cells * cells }).map((_, i) => (
          <div key={i} className={`${pattern[i] ? "bg-[#0F172A]" : "bg-white"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  { group: "SETUP", items: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "users", label: "Users", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]},
  { group: "PRODUCTION", items: [
    { id: "batches", label: "Batches", icon: Layers },
    { id: "serialization", label: "Serialization", icon: Hash },
    { id: "labels", label: "Labels", icon: Printer },
  ]},
  { group: "OPERATIONS", items: [
    { id: "inventory", label: "Inventory", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "scan", label: "Scan & Verify", icon: ScanLine },
    { id: "packing", label: "Packing", icon: Box },
  ]},
  { group: "MANAGEMENT", items: [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "returns", label: "Returns", icon: RotateCcw },
    { id: "reports", label: "Reports", icon: TrendingUp },
  ]},
];

function Sidebar({ current, onNavigate, collapsed, onCollapse }: {
  current: Page; onNavigate: (p: Page) => void; collapsed: boolean; onCollapse: () => void;
}) {
  return (
    <aside className={`flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-200 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-base tracking-tight">Puffkin</div>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest">SIOVS</div>
          </div>
        )}
        <button onClick={onCollapse} className="text-slate-400 hover:text-white transition-colors p-1 rounded">
          <Menu className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        {NAV_GROUPS.map(g => (
          <div key={g.group} className="mb-3">
            {!collapsed && <div className="px-4 py-1 text-[9px] font-semibold text-slate-500 tracking-widest uppercase">{g.group}</div>}
            {g.items.map(item => {
              const active = current.startsWith(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as Page)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-white font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                  }`}
                >
                  <item.icon className={`size-4 flex-shrink-0 ${active ? "text-primary" : ""}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && active && <ChevronRight className="size-3 ml-auto text-primary" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{MOCK_USER.avatar}</div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{MOCK_USER.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{MOCK_USER.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{MOCK_USER.role}</div>
            </div>
            <button className="text-slate-500 hover:text-slate-300"><LogOut className="size-4" /></button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ title, onNavigate }: { title: string; onNavigate: (p: Page) => void }) {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input className="pl-9 pr-4 py-1.5 text-sm bg-muted border border-border rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Quick search..." />
        </div>
        <button onClick={() => onNavigate("verify")} className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="p-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Puffkin SIOVS — Serialized Inventory & Order Verification System"
        actions={
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            <Activity className="size-3 text-green-500" />
            Live · {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
        }
      />

      {/* Alert banners */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertTriangle className="size-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 font-medium">Low Stock Alert:</span>
          <span className="text-red-600">Chocolate Dessert 30ML 30MG — only 12 units remaining</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <AlertTriangle className="size-4 text-amber-500 flex-shrink-0" />
          <span className="text-amber-700 font-medium">Batch Expiry Alert:</span>
          <span className="text-amber-600">BATCH-20240515-004 expires in 138 days (Nov 2024)</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Units" value="1,150" icon={Package} color="blue" trend={8} />
        <StatCard label="In Stock" value="622" icon={BarChart3} color="green" trend={-3} />
        <StatCard label="Active Orders" value="4" icon={ShoppingCart} color="amber" />
        <StatCard label="Returns Today" value="2" icon={RotateCcw} color="red" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Batches" value="3" icon={Layers} color="purple" />
        <StatCard label="Serials Generated" value="1,400" icon={Hash} color="teal" />
        <StatCard label="Labels Printed" value="980" icon={Printer} color="blue" />
        <StatCard label="Verified Today" value="58" icon={Shield} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-foreground mb-4">Production vs Sales (Monthly)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHART_PRODUCTION_SALES} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="production" fill="#2563EB" name="Production" radius={[3,3,0,0]} />
              <Bar dataKey="sales" fill="#16A34A" name="Sales" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-foreground mb-4">Inventory Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CHART_INVENTORY_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {CHART_INVENTORY_PIE.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {CHART_INVENTORY_PIE.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-mono font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm font-medium text-foreground mb-4">Daily Order Volume (This Week)</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={CHART_DAILY_ORDERS}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: "#2563EB" }} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Products Page ────────────────────────────────────────────────────────────

function ProductsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = MOCK_PRODUCTS.filter(p =>
    (statusFilter === "All" || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.skuCode.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="p-6">
      <PageHeader
        title="Product Master"
        subtitle={`${MOCK_PRODUCTS.length} SKUs defined`}
        actions={<Btn icon={Plus} onClick={() => onNavigate("products-new")}>Add SKU</Btn>}
      />
      <div className="flex items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search SKU or name..." />
        <select className="text-sm border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary/30" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
        <div className="ml-auto text-sm text-muted-foreground">{filtered.length} records</div>
      </div>
      <Table<Product>
        data={filtered}
        columns={[
          { key: "skuCode", label: "SKU Code", render: r => <span className="font-mono text-xs text-primary font-medium">{r.skuCode}</span> },
          { key: "name", label: "Product Name", render: r => <span className="font-medium">{r.name}</span> },
          { key: "flavor", label: "Flavor" },
          { key: "strength", label: "Strength", render: r => <span className="font-mono text-xs">{r.strength}</span> },
          { key: "size", label: "Size", render: r => <span className="font-mono text-xs">{r.size}</span> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "createdAt", label: "Created", render: r => <span className="text-muted-foreground text-xs">{r.createdAt}</span> },
          { key: "actions", label: "Actions", render: () => (
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Eye className="size-3.5" /></button>
              <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 className="size-3.5" /></button>
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── New Product Page ─────────────────────────────────────────────────────────

function NewProductPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [form, setForm] = useState({ flavor: "", strength: "", size: "", variant: "" });
  const [category, setCategory] = useState("Ice");
  const sub: Record<string, string> = { Ice: "ICE", Tobacco: "TOB", Dessert: "DES", "Salt Nic": "SLT" };
  const fCode: Record<string, string> = { Mango: "MAN", Mint: "MNT", Vanilla: "VAN", Chocolate: "CHO", Lychee: "LYC" };
  const sku = form.flavor && form.strength && form.size && form.variant
    ? `CART-${sub[category] || "XXX"}-${fCode[form.flavor] || form.flavor.slice(0,3).toUpperCase()}-${form.size.replace("ML","")}-${form.strength}-${form.variant.slice(0,3).toUpperCase()}`
    : "---";
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Add New SKU" subtitle="Define a new product in the master catalog" />
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium block mb-1.5">Category</label>
            <select className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" value={category} onChange={e => setCategory(e.target.value)}>
              {["Ice","Tobacco","Dessert","Salt Nic"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {[
            { key: "flavor", label: "Flavor", opts: ["Mango","Mint","Vanilla","Chocolate","Lychee"] },
            { key: "strength", label: "Strength", opts: ["30MG","50MG"] },
            { key: "size", label: "Size", opts: ["30ML","60ML"] },
            { key: "variant", label: "Variant", opts: ["Standard","Premium"] },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium block mb-1.5">{f.label}</label>
              <select className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                <option value="">Select {f.label}</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="mt-5 p-3 bg-muted rounded-lg border border-border">
          <div className="text-xs text-muted-foreground mb-1">Auto-generated SKU Code</div>
          <div className="font-mono text-sm font-semibold text-primary">{sku}</div>
        </div>
        <div className="flex gap-3 mt-5">
          <Btn onClick={() => onNavigate("products")}>Save SKU</Btn>
          <Btn variant="secondary" onClick={() => onNavigate("products")}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Categories Page ──────────────────────────────────────────────────────────

function CategoryNode({ cat, depth = 0 }: { cat: Category; depth?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className={`flex items-center gap-2 p-2 hover:bg-muted rounded-lg group`} style={{ paddingLeft: `${depth * 20 + 8}px` }}>
        {cat.children?.length ? (
          <button onClick={() => setOpen(!open)} className="text-muted-foreground">
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ) : <div className="size-4" />}
        <Tag className="size-4 text-primary" />
        <span className="text-sm font-medium flex-1">{cat.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{cat.code}</span>
        <StatusBadge status={cat.status} />
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2">
          <button className="p-1 rounded hover:bg-accent text-muted-foreground"><Plus className="size-3.5" /></button>
          <button className="p-1 rounded hover:bg-accent text-muted-foreground"><Edit2 className="size-3.5" /></button>
          <button className="p-1 rounded hover:bg-accent text-red-500"><Trash2 className="size-3.5" /></button>
        </div>
      </div>
      {open && cat.children?.map(child => <CategoryNode key={child.id} cat={child} depth={depth + 1} />)}
    </div>
  );
}

function CategoriesPage() {
  return (
    <div className="p-6">
      <PageHeader title="Category Tree" subtitle="Manage product category hierarchy" actions={<Btn icon={Plus}>Add Category</Btn>} />
      <div className="bg-card border border-border rounded-lg p-4">
        {MOCK_CATEGORIES.map(c => <CategoryNode key={c.id} cat={c} />)}
      </div>
    </div>
  );
}

// ─── Batches Page ─────────────────────────────────────────────────────────────

function BatchesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = MOCK_BATCHES.filter(b =>
    (statusFilter === "All" || b.status === statusFilter) &&
    (b.batchId.toLowerCase().includes(search.toLowerCase()) || b.sku.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="p-6">
      <PageHeader title="Batch Management" subtitle={`${MOCK_BATCHES.length} production batches`} actions={<Btn icon={Plus} onClick={() => onNavigate("batches-new")}>Create Batch</Btn>} />
      <div className="flex items-center gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search batch..." />
        <select className="text-sm border border-border rounded-lg px-3 py-2 bg-card focus:outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option><option>Draft</option><option>Active</option><option>Completed</option><option>Expired</option>
        </select>
      </div>
      <Table<Batch>
        data={filtered}
        columns={[
          { key: "batchId", label: "Batch ID", render: r => <span className="font-mono text-xs font-medium">{r.batchId}</span> },
          { key: "sku", label: "SKU", render: r => <span className="font-mono text-xs text-primary">{r.sku}</span> },
          { key: "productionDate", label: "Mfg Date", render: r => <span className="text-xs">{r.productionDate}</span> },
          { key: "expiryDate", label: "Exp Date", render: r => <span className={`text-xs ${new Date(r.expiryDate) < new Date(Date.now() + 30*86400000) ? "text-red-500 font-medium" : ""}`}>{r.expiryDate}</span> },
          { key: "quantity", label: "Qty", render: r => <span className="font-mono">{r.quantity}</span> },
          { key: "serialsGenerated", label: "Serials", render: r => (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-muted rounded-full">
                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(r.serialsGenerated/r.quantity)*100}%` }} />
              </div>
              <span className="font-mono text-xs">{r.serialsGenerated}/{r.quantity}</span>
            </div>
          )},
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "actions", label: "Actions", render: r => (
            <div className="flex items-center gap-1">
              <Btn size="sm" variant="ghost" icon={Hash} onClick={() => onNavigate("serialization-detail")}>Serials</Btn>
              <Btn size="sm" variant="ghost" icon={Printer}>Labels</Btn>
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── New Batch Page ───────────────────────────────────────────────────────────

function NewBatchPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [autoId, setAutoId] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  const autoBatchId = `BATCH-${today.replace(/-/g, "")}-00${MOCK_BATCHES.length + 1}`;
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Create New Batch" />
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Batch ID</label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={autoId} onChange={e => setAutoId(e.target.checked)} className="rounded" />
              Auto-generate
            </label>
          </div>
          <input className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" value={autoId ? autoBatchId : ""} readOnly={autoId} placeholder="Manual batch ID" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Select SKU *</label>
          <select className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">Choose SKU...</option>
            {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.skuCode} — {p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Production Date *</label>
            <input type="date" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue={today} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Expiry Date *</label>
            <input type="date" className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Quantity *</label>
          <input type="number" className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="e.g. 500" min="1" />
        </div>
        <div className="flex gap-3 pt-2">
          <Btn onClick={() => onNavigate("batches")}>Create Batch</Btn>
          <Btn variant="secondary" onClick={() => onNavigate("batches")}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Serialization Page ───────────────────────────────────────────────────────

function SerializationPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="p-6">
      <PageHeader title="Serialization Engine" subtitle="Generate and manage serial codes for batches" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {MOCK_BATCHES.filter(b => b.status !== "Expired").map(batch => (
          <div key={batch.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-mono text-xs text-primary font-medium">{batch.batchId}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{batch.sku}</div>
              </div>
              <StatusBadge status={batch.status} />
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Generated</span>
                <span className="font-mono">{batch.serialsGenerated} / {batch.quantity}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full">
                <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${(batch.serialsGenerated/batch.quantity)*100}%` }} />
              </div>
            </div>
            <div className="flex gap-2">
              {batch.serialsGenerated === 0 ? (
                <Btn size="sm" icon={Zap} onClick={() => onNavigate("serialization-detail")}>Generate All</Btn>
              ) : (
                <Btn size="sm" variant="secondary" icon={Eye} onClick={() => onNavigate("serialization-detail")}>View Serials</Btn>
              )}
              <Btn size="sm" variant="ghost" icon={Download}>CSV</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Serialization Detail Page ────────────────────────────────────────────────

function SerializationDetailPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const batch = MOCK_BATCHES[0];
  const [progress, setProgress] = useState(100);
  const serials = Array.from({ length: 10 }, (_, i) => ({
    code: generateSerial("PFK", "ELIQ", "240426", i + 1),
    status: i < 8 ? "Available" : "Reserved",
    createdAt: "2024-04-26 09:00",
  }));

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <button onClick={() => onNavigate("serialization")} className="hover:text-foreground">Serialization</button>
        <ChevronRight className="size-3" />
        <span className="text-foreground">{batch.batchId}</span>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 mb-4">
        <div className="flex items-start justify-between">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><div className="text-xs text-muted-foreground">Batch ID</div><div className="font-mono text-sm font-medium mt-0.5">{batch.batchId}</div></div>
            <div><div className="text-xs text-muted-foreground">SKU</div><div className="font-mono text-xs text-primary mt-0.5">{batch.sku}</div></div>
            <div><div className="text-xs text-muted-foreground">Total Quantity</div><div className="font-mono text-sm mt-0.5">{batch.quantity}</div></div>
            <div><div className="text-xs text-muted-foreground">Generated</div><div className="font-mono text-sm mt-0.5 text-green-600">{batch.serialsGenerated}</div></div>
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" icon={Download}>Download CSV</Btn>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-blue-700">{batch.serialsGenerated}</div>
          <div className="text-xs text-blue-600 mt-0.5">Total Generated</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-green-700">443</div>
          <div className="text-xs text-green-600 mt-0.5">Available</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <div className="text-2xl font-mono font-bold text-amber-700">57</div>
          <div className="text-xs text-amber-600 mt-0.5">Used</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="size-4" /> No Duplication Allowed</div>
          <div className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="size-4" /> Auto Checksum Validation</div>
          <div className="flex items-center gap-2 text-xs text-green-600"><CheckCircle2 className="size-4" /> Encrypted Signature (HMAC)</div>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-muted rounded px-3 py-2">
          Format: PFK-ELIQ-YYMMDD-000001-XXX (Company-Product-Date-Sequence-Checksum)
        </div>
      </div>

      <Table
        data={serials}
        columns={[
          { key: "code", label: "Serial Code", render: r => <span className="font-mono text-xs">{r.code}</span> },
          { key: "qr", label: "QR", render: r => <QRBlock value={r.code} size={40} /> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "createdAt", label: "Generated At", render: r => <span className="text-xs text-muted-foreground">{r.createdAt}</span> },
        ]}
      />
    </div>
  );
}

// ─── Labels Page ──────────────────────────────────────────────────────────────

function LabelsPage() {
  const [selectedBatch, setSelectedBatch] = useState(MOCK_BATCHES[0]);
  const [layout, setLayout] = useState<"4up" | "8up">("4up");
  const demoSerials = Array.from({ length: layout === "4up" ? 4 : 8 }, (_, i) =>
    generateSerial("PFK", "ELIQ", "240426", i + 1)
  );
  return (
    <div className="p-6">
      <PageHeader title="Label Printing" subtitle="Configure and print product labels" actions={<Btn icon={Printer}>Print Labels</Btn>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Select Batch</label>
            <select className="w-full text-sm border border-border rounded-lg px-3 py-2" onChange={e => { const b = MOCK_BATCHES.find(b => b.id === e.target.value); if(b) setSelectedBatch(b); }}>
              {MOCK_BATCHES.filter(b => b.serialsGenerated > 0).map(b => <option key={b.id} value={b.id}>{b.batchId}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground block mb-1">From Serial #</label><input type="number" className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono" defaultValue="1" /></div>
            <div><label className="text-xs text-muted-foreground block mb-1">To Serial #</label><input type="number" className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono" defaultValue="100" /></div>
          </div>
          <div><label className="text-xs text-muted-foreground block mb-1">Copies per Label</label><input type="number" className="w-full text-sm border border-border rounded-lg px-3 py-2" defaultValue="1" min="1" /></div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Layout Preview</label>
            <div className="flex gap-2">
              {(["4up","8up"] as const).map(l => (
                <button key={l} onClick={() => setLayout(l)} className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${layout === l ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <Btn icon={Printer} onClick={() => {}}>Print {selectedBatch.quantity} Labels</Btn>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <div className="text-sm font-medium mb-4 text-muted-foreground">Label Preview</div>
          <div className={`grid gap-3 ${layout === "4up" ? "grid-cols-2" : "grid-cols-4"}`}>
            {demoSerials.map((serial, i) => (
              <div key={i} className="border-2 border-dashed border-border rounded-lg p-3 bg-white" style={{ minWidth: 0 }}>
                <div className="text-center text-[10px] font-bold text-slate-900 leading-tight">PFK VAPES PVT. LTD.</div>
                <div className="text-center text-[8px] text-slate-500 mb-1">{selectedBatch.sku}</div>
                <div className="flex justify-center mb-1"><QRBlock value={serial} size={56} /></div>
                <div className="text-center text-[7px] font-mono text-slate-700 leading-tight">{serial}</div>
                <div className="mt-1 grid grid-cols-2 gap-x-2 text-[7px] text-slate-600">
                  <div>Batch: <span className="font-mono">{selectedBatch.batchId.slice(-7)}</span></div>
                  <div>Exp: {selectedBatch.expiryDate}</div>
                  <div>Size: 30ML</div>
                  <div>Str: 50MG</div>
                </div>
                <div className="text-center text-[6px] text-slate-400 mt-1">Scan QR to verify authenticity</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inventory Page ───────────────────────────────────────────────────────────

function InventoryPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"batch" | "unit">("batch");
  const total = MOCK_INVENTORY.reduce((a, i) => ({ inStock: a.inStock + i.inStock, reserved: a.reserved + i.reserved, picked: a.picked + i.picked, sold: a.sold + i.sold, delivered: a.delivered + i.delivered }), { inStock: 0, reserved: 0, picked: 0, sold: 0, delivered: 0 });

  return (
    <div className="p-6">
      <PageHeader title="Serialized Inventory" subtitle="Real-time stock overview by SKU and batch" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="In Stock" value={total.inStock} icon={Package} color="blue" />
        <StatCard label="Reserved" value={total.reserved} icon={Clock} color="amber" />
        <StatCard label="Picked" value={total.picked} icon={CheckCircle2} color="purple" />
        <StatCard label="Sold" value={total.sold} icon={ShoppingCart} color="green" />
        <StatCard label="Delivered" value={total.delivered} icon={Check} color="teal" />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex border border-border rounded-lg overflow-hidden">
          {(["batch","unit"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>{t}-wise View</button>
          ))}
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search SKU..." />
      </div>

      <Table<InventoryItem>
        data={MOCK_INVENTORY.filter(i => i.sku.toLowerCase().includes(search.toLowerCase()) || i.productName.toLowerCase().includes(search.toLowerCase()))}
        columns={[
          { key: "sku", label: "SKU", render: r => <span className="font-mono text-xs text-primary">{r.sku}</span> },
          { key: "productName", label: "Product Name", render: r => <span className="font-medium text-sm">{r.productName}</span> },
          { key: "batchId", label: "Batch ID", render: r => <span className="font-mono text-xs">{r.batchId}</span> },
          { key: "totalUnits", label: "Total", render: r => <span className="font-mono font-medium">{r.totalUnits}</span> },
          { key: "inStock", label: "In Stock", render: r => <span className={`font-mono font-medium ${r.inStock < 20 ? "text-red-600" : "text-blue-600"}`}>{r.inStock}</span> },
          { key: "reserved", label: "Reserved", render: r => <span className="font-mono text-amber-600">{r.reserved}</span> },
          { key: "picked", label: "Picked", render: r => <span className="font-mono text-purple-600">{r.picked}</span> },
          { key: "sold", label: "Sold", render: r => <span className="font-mono text-green-600">{r.sold}</span> },
          { key: "delivered", label: "Delivered", render: r => <span className="font-mono text-teal-600">{r.delivered}</span> },
        ]}
      />
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────

function OrdersPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = MOCK_ORDERS.filter(o => statusFilter === "All" || o.status === statusFilter);
  return (
    <div className="p-6">
      <PageHeader title="Order Management" subtitle={`${MOCK_ORDERS.length} orders total`} actions={<Btn icon={Plus} onClick={() => onNavigate("orders-new")}>New Order</Btn>} />
      <div className="flex items-center gap-3 mb-4">
        {["All","Draft","Confirmed","Packing","Dispatched","Delivered"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${statusFilter === s ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{s}</button>
        ))}
      </div>
      <Table<Order>
        data={filtered}
        columns={[
          { key: "orderNo", label: "Order No", render: r => <span className="font-mono text-xs font-medium text-primary">{r.orderNo}</span> },
          { key: "customer", label: "Customer", render: r => (
            <div><div className="font-medium text-sm">{r.customer.name}</div><div className="text-xs text-muted-foreground">{r.customer.mobile}</div></div>
          )},
          { key: "items", label: "Items", render: r => <span className="font-mono">{r.items.reduce((a,i) => a + i.requestedQty, 0)} units</span> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "deliveryDate", label: "Delivery Date", render: r => <span className="text-xs">{r.deliveryDate}</span> },
          { key: "actions", label: "Actions", render: r => (
            <div className="flex items-center gap-1">
              <Btn size="sm" variant="ghost" icon={Eye} onClick={() => onNavigate("orders-detail")}>View</Btn>
              {r.status === "Confirmed" && <Btn size="sm" icon={ScanLine} onClick={() => onNavigate("scan")}>Pack</Btn>}
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── New Order Page ───────────────────────────────────────────────────────────

function NewOrderPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState([{ skuId: "", sku: "", qty: 1 }]);
  const steps = ["Customer Details", "Order Items", "System Checks", "Confirm"];
  return (
    <div className="p-6 max-w-3xl">
      <PageHeader title="Create New Order" />
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 text-sm ${step > i + 1 ? "text-green-600" : step === i + 1 ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${step > i + 1 ? "bg-green-600 border-green-600 text-white" : step === i + 1 ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                {step > i + 1 ? <Check className="size-3" /> : i + 1}
              </div>
              <span className="hidden md:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="size-4 text-muted-foreground mx-2" />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[["Customer Name *","text","Rajesh Distributors"],["Mobile *","tel","9876543210"],["Email","email","rajesh@dist.com"],["GSTIN","text","27AABCU9603R1ZX"]].map(([l,t,p]) => (
                <div key={l}>
                  <label className="text-sm font-medium block mb-1.5">{l}</label>
                  <input type={t as string} placeholder={p as string} className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Delivery Address *</label>
              <textarea rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Full delivery address..." />
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <select className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-card" value={item.skuId} onChange={e => { const sku = MOCK_PRODUCTS.find(p => p.id === e.target.value); setItems(prev => prev.map((it, idx) => idx === i ? { ...it, skuId: e.target.value, sku: sku?.skuCode ?? "" } : it)); }}>
                    <option value="">Select SKU...</option>
                    {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.skuCode} (Stock: {MOCK_INVENTORY.find(inv => inv.sku === p.skuCode)?.inStock ?? 0})</option>)}
                  </select>
                  <input type="number" min="1" className="w-24 text-sm border border-border rounded-lg px-3 py-2 font-mono" value={item.qty} onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, qty: +e.target.value } : it))} />
                  {items.length > 1 && <button onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 className="size-4" /></button>}
                </div>
              ))}
            </div>
            <Btn variant="secondary" icon={Plus} size="sm" onClick={() => setItems(p => [...p, { skuId: "", sku: "", qty: 1 }])}>Add Item</Btn>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            {[["Stock Availability Check","All requested SKUs have sufficient stock","PASS"],["Batch Allocation (FIFO)","Allocated from earliest batch: BATCH-20240426-001","PASS"],["Checksum Validation","All serial codes validated","PASS"]].map(([title, msg, result]) => (
              <div key={title} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-green-800">{title}</div>
                  <div className="text-xs text-green-700 mt-0.5">{msg}</div>
                </div>
                <span className="ml-auto font-mono text-xs font-bold text-green-600">{result}</span>
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4 flex items-center gap-3">
              <CheckCircle2 className="size-6 text-green-600" />
              <div><div className="font-medium text-green-800">Order Ready to Confirm</div><div className="text-sm text-green-700">Order No: <span className="font-mono">ORD-2024-000005</span></div></div>
            </div>
            <Table data={items.filter(i => i.skuId)} columns={[
              { key: "sku", label: "SKU", render: r => <span className="font-mono text-xs">{(r as any).sku || "—"}</span> },
              { key: "qty", label: "Qty", render: r => <span className="font-mono">{(r as any).qty}</span> },
            ]} />
          </div>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          <Btn variant="secondary" onClick={() => step > 1 ? setStep(s => s - 1) : onNavigate("orders")} icon={ChevronLeft}>{step > 1 ? "Back" : "Cancel"}</Btn>
          {step < 4 ? (
            <Btn onClick={() => setStep(s => s + 1)} icon={ChevronRight}>Next</Btn>
          ) : (
            <Btn onClick={() => onNavigate("orders")} icon={Check}>Confirm Order</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Scan & Verification Page ─────────────────────────────────────────────────

function ScanPage() {
  const [scanInput, setScanInput] = useState("");
  const [logs, setLogs] = useState<ScanLog[]>([
    { id: "s1", serialCode: "PFK-ELIQ-240426-000042-X9K", result: "ACCEPTED", skuId: "p1", batchId: "BATCH-20240426-001", time: "09:14:22" },
    { id: "s2", serialCode: "PFK-ELIQ-240426-000107-B3M", result: "ACCEPTED", skuId: "p1", batchId: "BATCH-20240426-001", time: "09:14:45" },
    { id: "s3", serialCode: "PFK-ELIQ-240426-000042-X9K", result: "REJECTED", reason: "Duplicate Scan", skuId: "p1", batchId: "BATCH-20240426-001", time: "09:15:12" },
    { id: "s4", serialCode: "PFK-ELIQ-240501-000011-ZKX", result: "REJECTED", reason: "Wrong SKU", skuId: "p2", batchId: "BATCH-20240501-002", time: "09:16:03" },
  ]);
  const accepted = logs.filter(l => l.result === "ACCEPTED").length;
  const rejected = logs.filter(l => l.result === "REJECTED").length;

  const handleScan = () => {
    if (!scanInput.trim()) return;
    const isDuplicate = logs.some(l => l.serialCode === scanInput && l.result === "ACCEPTED");
    const newLog: ScanLog = {
      id: `s${Date.now()}`,
      serialCode: scanInput,
      result: isDuplicate ? "REJECTED" : "ACCEPTED",
      reason: isDuplicate ? "Duplicate Scan" : undefined,
      skuId: "p1",
      batchId: "BATCH-20240426-001",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setLogs(prev => [newLog, ...prev]);
    setScanInput("");
  };

  return (
    <div className="p-6 h-full">
      <PageHeader title="Scan & Verification Engine" subtitle="Order: ORD-2024-000002 — Vikram Traders" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-120px)]">
        {/* Left: Order Info */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Details</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order No</span><span className="font-mono font-medium">ORD-2024-000002</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>Vikram Traders</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Items</span><span className="font-mono">50 units</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Scan Progress</div>
            <div className="w-full h-3 bg-muted rounded-full mb-2">
              <div className="h-3 bg-primary rounded-full transition-all" style={{ width: `${((accepted) / 50) * 100}%` }} />
            </div>
            <div className="text-xs text-center text-muted-foreground font-mono">{accepted} / 50 scanned</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[["ACCEPTED", accepted, "bg-green-50 text-green-700"],["REJECTED", rejected, "bg-red-50 text-red-700"]].map(([l, v, cls]) => (
              <div key={l as string} className={`rounded-lg p-3 text-center ${cls}`}>
                <div className="text-2xl font-mono font-bold">{v}</div>
                <div className="text-xs font-medium">{l}</div>
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <Btn icon={CheckCircle2} onClick={() => {}}>Complete Session</Btn>
          </div>
        </div>

        {/* Center: Scanner */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col items-center gap-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start">Scanner</div>
          <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-blue-500 to-transparent" />
            <div className="text-center z-10">
              <Smartphone className="size-12 text-slate-500 mx-auto mb-3" />
              <div className="text-slate-400 text-sm">Camera Viewfinder</div>
              <div className="text-slate-600 text-xs mt-1">@zxing/library QR Scanner</div>
            </div>
            <div className="absolute inset-4 border-2 border-blue-500/40 rounded-lg" />
            <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-blue-400" />
            <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-blue-400" />
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-blue-400" />
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-blue-400" />
          </div>
          <div className="text-xs text-muted-foreground">— or enter manually —</div>
          <div className="flex w-full gap-2">
            <input
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter serial code..."
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleScan()}
            />
            <Btn icon={ScanLine} onClick={handleScan}>Scan</Btn>
          </div>
          {logs[0] && (
            <div className={`w-full p-3 rounded-lg border text-sm ${logs[0].result === "ACCEPTED" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
              <div className={`flex items-center gap-2 font-bold mb-1 ${logs[0].result === "ACCEPTED" ? "text-green-700" : "text-red-700"}`}>
                {logs[0].result === "ACCEPTED" ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                {logs[0].result}
                {logs[0].reason && <span className="font-normal text-xs ml-1">— {logs[0].reason}</span>}
              </div>
              <div className="font-mono text-xs text-slate-600">{logs[0].serialCode}</div>
              <div className="text-xs text-slate-500 mt-0.5">{logs[0].time}</div>
            </div>
          )}
        </div>

        {/* Right: Log Feed */}
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Live Scan Log</div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {logs.map(log => (
              <div key={log.id} className={`p-2.5 rounded-lg border text-xs ${log.result === "ACCEPTED" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className={`flex items-center gap-1.5 font-semibold ${log.result === "ACCEPTED" ? "text-green-700" : "text-red-700"}`}>
                    {log.result === "ACCEPTED" ? <Check className="size-3" /> : <X className="size-3" />}
                    {log.result}
                  </div>
                  <span className="font-mono text-muted-foreground">{log.time}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate">{log.serialCode}</div>
                {log.reason && <div className="text-[10px] text-red-600 mt-0.5">{log.reason}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Packing Page ─────────────────────────────────────────────────────────────

function PackingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="p-6">
      <PageHeader title="Packing & Dispatch" subtitle="Manage order packing and dispatch operations" />
      <Table<Order>
        data={MOCK_ORDERS.filter(o => ["Confirmed","Packing"].includes(o.status))}
        columns={[
          { key: "orderNo", label: "Order No", render: r => <span className="font-mono text-xs text-primary font-medium">{r.orderNo}</span> },
          { key: "customer", label: "Customer", render: r => <span className="font-medium">{r.customer.name}</span> },
          { key: "items", label: "Items", render: r => <span className="font-mono">{r.items.reduce((a,i) => a+i.requestedQty,0)} units</span> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "deliveryDate", label: "Delivery Date", render: r => <span className="text-xs">{r.deliveryDate}</span> },
          { key: "actions", label: "Actions", render: () => (
            <div className="flex gap-2">
              <Btn size="sm" icon={ScanLine} onClick={() => onNavigate("scan")}>Start Packing</Btn>
              <Btn size="sm" variant="secondary" icon={Printer}>Print List</Btn>
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── Invoices Page ────────────────────────────────────────────────────────────

function InvoicesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="p-6">
      <PageHeader title="Invoices" subtitle={`${MOCK_ORDERS.filter(o=>o.status==="Delivered").length} invoices generated`} />
      <Table<Order>
        data={MOCK_ORDERS.filter(o => ["Delivered","Dispatched"].includes(o.status))}
        columns={[
          { key: "orderNo", label: "Invoice No", render: r => <span className="font-mono text-xs text-primary font-medium">INV-2024-{r.orderNo.slice(-6)}</span> },
          { key: "orderNo2", label: "Order No", render: r => <span className="font-mono text-xs">{r.orderNo}</span> },
          { key: "customer", label: "Customer", render: r => <span className="font-medium">{r.customer.name}</span> },
          { key: "amount", label: "Amount", render: () => <span className="font-mono font-medium">₹4,720</span> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "createdAt", label: "Date", render: r => <span className="text-xs text-muted-foreground">{r.createdAt}</span> },
          { key: "actions", label: "Actions", render: () => (
            <div className="flex gap-1">
              <Btn size="sm" variant="ghost" icon={Eye} onClick={() => onNavigate("invoices-detail")}>View</Btn>
              <Btn size="sm" variant="ghost" icon={Download}>PDF</Btn>
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── Invoice Detail Page ──────────────────────────────────────────────────────

function InvoiceDetailPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const order = MOCK_ORDERS[0];
  const invoiceNo = "INV-2024-000001";
  const hash = "a1b2c3d4e5f678901234567890abcdef";
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <button onClick={() => onNavigate("invoices")} className="hover:text-foreground">Invoices</button>
        <ChevronRight className="size-3" /><span className="text-foreground">{invoiceNo}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
              <div>
                <div className="text-xl font-bold text-foreground">PFK VAPES PVT. LTD.</div>
                <div className="text-xs text-muted-foreground mt-1">GSTIN: 27AABCU9603R1ZX | CIN: U74999MH2022PTC1234</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-primary text-lg">{invoiceNo}</div>
                <div className="text-xs text-muted-foreground mt-1">Date: {order.createdAt}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-4 text-sm">
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Bill To</div>
                <div className="font-medium">{order.customer.name}</div>
                <div className="text-muted-foreground text-xs mt-1">{order.customer.address}</div>
                {order.customer.gstin && <div className="text-xs mt-1 font-mono">GSTIN: {order.customer.gstin}</div>}
                <div className="text-xs mt-1">{order.customer.mobile}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Order Details</div>
                {[["Order No", order.orderNo],["Status", order.status],["Delivery Date", order.deliveryDate],["Payment", "Net 30"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{k}</span><span className="font-medium font-mono">{v}</span></div>
                ))}
              </div>
            </div>
            <Table
              data={order.items.map(item => ({ ...item, unitPrice: 94, total: item.allocatedQty * 94 }))}
              columns={[
                { key: "sku", label: "SKU", render: r => <span className="font-mono text-xs text-primary">{(r as any).sku}</span> },
                { key: "batchId", label: "Batch", render: () => <span className="font-mono text-xs">BATCH-20240426-001</span> },
                { key: "allocatedQty", label: "Qty", render: r => <span className="font-mono">{(r as any).allocatedQty}</span> },
                { key: "unitPrice", label: "Unit Price", render: r => <span className="font-mono">₹{(r as any).unitPrice}</span> },
                { key: "total", label: "Total", render: r => <span className="font-mono font-medium">₹{(r as any).total}</span> },
              ]}
            />
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-end">
                <div className="w-48 space-y-1.5 text-sm">
                  {[["Subtotal","₹4,700"],["Discount","₹0"],["CGST (9%)","₹423"],["SGST (9%)","₹423"],["Shipping","₹0"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Grand Total</span><span className="font-mono text-primary">₹5,546</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Btn icon={Download}>Download PDF</Btn>
            <Btn variant="secondary" icon={Printer}>Print</Btn>
            <Btn variant="secondary" icon={Smartphone}>WhatsApp</Btn>
          </div>
        </div>

        {/* Right: QR */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 text-center">
            <div className="text-sm font-medium mb-3">Invoice QR Code</div>
            <div className="flex justify-center mb-3"><QRBlock value={JSON.stringify({ orderId: order.id, secureHash: hash, verifyUrl: `https://verify.puffkin.com/${hash}` })} size={140} /></div>
            <div className="text-xs text-muted-foreground">Scan to verify authenticity</div>
            <div className="mt-3 p-2 bg-muted rounded text-[10px] font-mono text-muted-foreground break-all">{hash}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 mb-2">
              <Shield className="size-4 text-green-600" /> Invoice Integrity
            </div>
            <div className="text-xs text-muted-foreground">HMAC-SHA256 signed. Tampering will invalidate the QR code.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Returns Page ─────────────────────────────────────────────────────────────

function ReturnsPage() {
  const [showForm, setShowForm] = useState(false);
  const stats = [
    { label: "Total Returns", value: MOCK_RETURNS.length, icon: RotateCcw, color: "blue" as const },
    { label: "Restocked", value: MOCK_RETURNS.filter(r => r.status === "Restocked").length, icon: RefreshCw, color: "green" as const },
    { label: "Damaged", value: MOCK_RETURNS.filter(r => r.status === "Damaged").length, icon: AlertTriangle, color: "red" as const },
    { label: "Return Rate", value: "4%", icon: TrendingDown, color: "amber" as const },
  ];
  return (
    <div className="p-6">
      <PageHeader title="Returns & Reverse Logistics" subtitle="Manage product returns and restocking" actions={<Btn icon={Plus} onClick={() => setShowForm(!showForm)}>Process Return</Btn>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <div className="text-sm font-semibold mb-4">Process New Return</div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <input className="flex-1 text-sm border border-border rounded-lg px-3 py-2 font-mono" placeholder="Scan QR or enter serial code..." />
              <Btn icon={ScanLine}>Scan</Btn>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Return Reason *</label>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-2">
                  <option>Product Not as Expected</option><option>Wrong Item</option><option>Damaged</option><option>Taste Not Expected</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Item Condition *</label>
                <select className="w-full text-sm border border-border rounded-lg px-3 py-2">
                  <option>Good (Restockable)</option><option>Damaged / Used</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Additional Remarks</label>
              <textarea rows={2} className="w-full text-sm border border-border rounded-lg px-3 py-2 resize-none" placeholder="Optional notes..." />
            </div>
            <div className="flex gap-3">
              <Btn icon={Check}>Confirm Return</Btn>
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      <Table<ReturnRecord>
        data={MOCK_RETURNS}
        columns={[
          { key: "returnId", label: "Return ID", render: r => <span className="font-mono text-xs font-medium text-primary">{r.returnId}</span> },
          { key: "orderId", label: "Order ID", render: r => <span className="font-mono text-xs">{r.orderId}</span> },
          { key: "customer", label: "Customer", render: r => <span className="font-medium text-sm">{r.customer}</span> },
          { key: "product", label: "Product", render: r => <span className="text-sm">{r.product}</span> },
          { key: "reason", label: "Reason", render: r => <span className="text-xs">{r.reason}</span> },
          { key: "condition", label: "Condition", render: r => <StatusBadge status={r.condition} /> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "returnDate", label: "Date", render: r => <span className="text-xs text-muted-foreground">{r.returnDate}</span> },
          { key: "actions", label: "", render: () => <Btn size="sm" variant="ghost" icon={Download}>Note</Btn> },
        ]}
      />
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────────

function ReportsPage() {
  const [range, setRange] = useState("month");
  return (
    <div className="p-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Production, sales, and inventory insights"
        actions={
          <div className="flex gap-2">
            {["today","week","month","custom"].map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs rounded-lg border capitalize transition-colors ${range === r ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>{r}</button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Production vs Sales</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CHART_PRODUCTION_SALES} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="production" fill="#2563EB" name="Production" radius={[3,3,0,0]} />
              <Bar dataKey="sales" fill="#16A34A" name="Sales" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm font-medium mb-4">Daily Order Volume</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={CHART_DAILY_ORDERS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Expiry Tracking (Next 90 Days)</div>
            <Btn size="sm" variant="secondary" icon={Download}>Export CSV</Btn>
          </div>
          <Table
            data={MOCK_BATCHES.filter(b => new Date(b.expiryDate) < new Date(Date.now() + 90*86400000) && b.status !== "Expired")}
            columns={[
              { key: "batchId", label: "Batch ID", render: r => <span className="font-mono text-xs">{r.batchId}</span> },
              { key: "sku", label: "SKU", render: r => <span className="font-mono text-xs text-primary">{r.sku}</span> },
              { key: "expiryDate", label: "Expiry", render: r => <span className="text-xs font-medium text-amber-600">{r.expiryDate}</span> },
              { key: "quantity", label: "Qty", render: r => <span className="font-mono">{r.quantity}</span> },
            ]}
          />
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Scan Mismatch Logs</div>
            <Btn size="sm" variant="secondary" icon={Download}>Export CSV</Btn>
          </div>
          <Table
            data={[
              { serial: "PFK-ELIQ-240426-000042-X9K", reason: "Duplicate Scan", time: "09:15:12", operator: "Deepa Nair" },
              { serial: "PFK-ELIQ-240501-000011-ZKX", reason: "Wrong SKU", time: "09:16:03", operator: "Deepa Nair" },
            ]}
            columns={[
              { key: "serial", label: "Serial", render: r => <span className="font-mono text-[10px]">{(r as any).serial}</span> },
              { key: "reason", label: "Reason", render: r => <span className="text-xs text-red-600">{(r as any).reason}</span> },
              { key: "time", label: "Time", render: r => <span className="font-mono text-xs">{(r as any).time}</span> },
              { key: "operator", label: "Operator", render: r => <span className="text-xs">{(r as any).operator}</span> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Users Page ───────────────────────────────────────────────────────────────

function UsersPage() {
  const roleColor: Record<string, string> = { "Admin": "bg-purple-100 text-purple-700", "Production Operator": "bg-blue-100 text-blue-700", "Warehouse Staff": "bg-green-100 text-green-700" };
  return (
    <div className="p-6">
      <PageHeader title="User Management" subtitle="Manage system users and roles (Admin only)" actions={<Btn icon={Plus}>Invite User</Btn>} />
      <Table<User>
        data={MOCK_USERS}
        columns={[
          { key: "avatar", label: "", render: r => <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">{r.avatar}</div> },
          { key: "name", label: "Name", render: r => <span className="font-medium">{r.name}</span> },
          { key: "email", label: "Email", render: r => <span className="text-sm text-muted-foreground font-mono">{r.email}</span> },
          { key: "role", label: "Role", render: r => <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleColor[r.role]}`}>{r.role}</span> },
          { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
          { key: "actions", label: "Actions", render: () => (
            <div className="flex gap-1">
              <Btn size="sm" variant="ghost" icon={Edit2}>Edit</Btn>
              <Btn size="sm" variant="ghost" icon={Trash2}>Deactivate</Btn>
            </div>
          )},
        ]}
      />
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="System Settings" />
      <div className="space-y-4">
        {[
          { title: "Company", fields: [["Company Name","PFK Vapes Pvt. Ltd."],["Company Code","PFK"],["GSTIN","27AABCU9603R1ZX"],["Verification Base URL","https://verify.puffkin.com"]] },
          { title: "Serialization", fields: [["Company Code Prefix","PFK"],["Product Code","ELIQ"],["Serial Length","6 digits"],["Checksum Length","3 chars"]] },
        ].map(section => (
          <div key={section.title} className="bg-card border border-border rounded-lg p-5">
            <div className="text-sm font-semibold mb-4">{section.title} Settings</div>
            <div className="grid grid-cols-2 gap-4">
              {section.fields.map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                  <input className="w-full text-sm border border-border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue={value} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Btn icon={Check}>Save Settings</Btn>
      </div>
    </div>
  );
}

// ─── Verify Portal (Public) ───────────────────────────────────────────────────

function VerifyPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  useEffect(() => { const t = setTimeout(() => setStatus("valid"), 1800); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="mb-6 text-center">
        <div className="text-2xl font-bold text-white tracking-tight">Puffkin</div>
        <div className="text-xs text-blue-300 font-mono tracking-widest">SIOVS · VERIFY PORTAL</div>
      </div>

      <div className="w-full max-w-sm">
        {status === "loading" && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center border border-white/20">
            <div className="size-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white font-medium">Verifying invoice QR...</div>
            <div className="text-blue-300 text-sm mt-1">Please wait</div>
          </div>
        )}
        {status === "valid" && (
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="size-8 text-green-600" />
              </div>
            </div>
            <div className="text-center mb-4">
              <div className="font-bold text-lg text-slate-900">Authentic Product</div>
              <div className="text-sm text-slate-600 mt-1">This product is original and verified</div>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                <CheckCircle2 className="size-3.5" /> VERIFIED
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Order ID</span><span className="font-mono font-medium">ORD-2024-000001</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date</span><span>2024-05-05</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Secure Hash</span><span className="font-mono text-xs text-slate-400">a1b2c3d4...</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Verified At</span><span className="text-xs">{new Date().toLocaleString()}</span></div>
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4">
              <div className="text-xs font-semibold text-slate-700 mb-2">Product Details</div>
              {[{ name: "Mango Ice 30ML 50MG", sku: "CART-ICE-MAN-30-50MG-STD", batch: "BATCH-20240426-001", exp: "2025-04-26" }].map(p => (
                <div key={p.sku} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <div className="font-mono text-primary">{p.sku}</div>
                  <div className="flex gap-3 text-slate-500"><span>Batch: {p.batch}</span><span>Exp: {p.exp}</span></div>
                  <StatusBadge status="Delivered" />
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 text-center">
              This invoice is genuine and has not been tampered.
            </div>
          </div>
        )}
        {status === "invalid" && (
          <div className="bg-white rounded-2xl p-6 shadow-2xl text-center">
            <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="size-8 text-red-600" />
            </div>
            <div className="font-bold text-lg text-slate-900">Verification Failed</div>
            <div className="text-sm text-slate-600 mt-2">This product could not be verified. Please contact the seller for assistance.</div>
          </div>
        )}
        <button onClick={() => onNavigate("dashboard")} className="mt-6 text-blue-300 hover:text-white text-sm text-center w-full transition-colors">
          ← Back to SIOVS Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const PAGE_TITLES: Partial<Record<Page, string>> = {
  dashboard: "Dashboard",
  products: "Products", "products-new": "New Product", "products-detail": "Product Detail",
  categories: "Categories",
  batches: "Batches", "batches-new": "New Batch", "batches-detail": "Batch Detail",
  serialization: "Serialization", "serialization-detail": "Serialization Detail",
  labels: "Label Printing", inventory: "Inventory",
  orders: "Orders", "orders-new": "New Order", "orders-detail": "Order Detail",
  scan: "Scan & Verify", packing: "Packing", "packing-detail": "Packing Detail",
  invoices: "Invoices", "invoices-detail": "Invoice Detail",
  returns: "Returns", reports: "Reports", users: "Users", settings: "Settings",
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (page === "verify") {
    return <VerifyPage onNavigate={setPage} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage onNavigate={setPage} />;
      case "products": return <ProductsPage onNavigate={setPage} />;
      case "products-new": return <NewProductPage onNavigate={setPage} />;
      case "categories": return <CategoriesPage />;
      case "batches": return <BatchesPage onNavigate={setPage} />;
      case "batches-new": return <NewBatchPage onNavigate={setPage} />;
      case "serialization": return <SerializationPage onNavigate={setPage} />;
      case "serialization-detail": return <SerializationDetailPage onNavigate={setPage} />;
      case "labels": return <LabelsPage />;
      case "inventory": return <InventoryPage />;
      case "orders": return <OrdersPage onNavigate={setPage} />;
      case "orders-new": return <NewOrderPage onNavigate={setPage} />;
      case "scan": return <ScanPage />;
      case "packing": return <PackingPage onNavigate={setPage} />;
      case "invoices": return <InvoicesPage onNavigate={setPage} />;
      case "invoices-detail": return <InvoiceDetailPage onNavigate={setPage} />;
      case "returns": return <ReturnsPage />;
      case "reports": return <ReportsPage />;
      case "users": return <UsersPage />;
      case "settings": return <SettingsPage />;
      default: return <DashboardPage onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar current={page} onNavigate={setPage} collapsed={sidebarCollapsed} onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={PAGE_TITLES[page] ?? "Puffkin SIOVS"} onNavigate={setPage} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
