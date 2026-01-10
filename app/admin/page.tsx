import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
        <h2 className="text-4xl font-heading font-normal text-rare-primary mb-2">Admin Dashboard</h2>
        <p className="text-rare-text-light font-body">Welcome back to your portal. Here&apos;s what&apos;s happening today.</p>
      </div>
      
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <EcommerceMetrics />
      </div>
    </div>
  );
}
