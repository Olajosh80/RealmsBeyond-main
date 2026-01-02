import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <p>Welcome to your admin portal.</p>
      <EcommerceMetrics />
    </div>
  );
}
