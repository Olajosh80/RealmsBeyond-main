import React from "react";
import OrdersContent from "@/app/admin/orders/OrdersContent";
import { createClient } from "@/lib/supabaseServer";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const supabase = await createClient();

  // Fetch orders on the server for instant loading
  const { data: initialOrders, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[OrdersPage] Server fetch error:', error);
  }

  return (
    <div className="p-6 space-y-6">
      <OrdersContent initialOrders={initialOrders || []} />
    </div>
  );
}
