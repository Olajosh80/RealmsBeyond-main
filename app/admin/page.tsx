import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { StockStatus } from "@/components/admin/dashboard/StockStatus";
import { RecentReviews } from "@/components/admin/dashboard/RecentReviews";
import { Header } from "@/components/layout/Header";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow p-6 lg:p-10">
        <div className="mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rare-primary to-rare-secondary shadow-2xl shadow-rare-primary/20">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-rare-accent/20 blur-3xl opacity-50" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 p-10 md:p-14 text-white">
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 tracking-wide leading-tight">
                Welcome back, <span className="text-rare-accent">Admin</span>
              </h2>
              <p className="font-body text-slate-200 text-lg max-w-2xl leading-relaxed">
                Here's an overview of your store's performance today. You have new orders and messages waiting for your review.
              </p>

              <div className="mt-8 flex gap-4">
                <button className="px-6 py-3 bg-white text-rare-primary rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  View Orders
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-all duration-300">
                  Manage Products
                </button>
              </div>
            </div>
          </div>

          {/* Metrics Section */}
          <div>
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-heading text-2xl font-bold text-white">Overview</h3>
              <span className="text-sm text-slate-400 font-body bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Last 30 Days
              </span>
            </div>
            <EcommerceMetrics />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Recent Orders */}
            <div className="lg:col-span-2 space-y-8">
              <RecentOrders />
              <RecentReviews />
            </div>

            {/* Right Column - Stock Status & Extras */}
            <div className="space-y-8">
              <StockStatus />
              {/* Placeholder for future widget or marketing promo */}
              <div className="bg-gradient-to-br from-rare-primary to-rare-secondary p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-heading font-bold text-xl mb-2">Pro Tip</h3>
                  <p className="text-white/80 text-sm mb-4">You can now manage customer reviews directly from the dashboard.</p>
                  <button className="bg-white text-rare-primary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">
                    Try it out
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
