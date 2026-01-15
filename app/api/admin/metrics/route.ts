import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [usersCount, ordersData, productsCount] = await Promise.all([
      User.countDocuments(),
      Order.find().select('total_amount created_at').lean(),
      Product.countDocuments()
    ]);

    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const now = new Date();
    const thisMonthRevenue = ordersData.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }).reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const revenueGrowth = totalRevenue > 0 ? ((thisMonthRevenue / totalRevenue) * 100).toFixed(1) : '0';

    const monthlyRevenue = new Array(12).fill(0);
    ordersData.forEach(order => {
      const date = new Date(order.created_at);
      const month = date.getMonth(); // 0-11
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();

      if (year === currentYear) {
        monthlyRevenue[month] += (order.total_amount || 0);
      }
    });

    return NextResponse.json({
      customers: usersCount,
      orders: ordersData.length,
      revenue: totalRevenue,
      revenueGrowth: `${revenueGrowth}%`,
      products: productsCount,
      chartData: monthlyRevenue
    });
  } catch (error: any) {
    console.error('[Metrics API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
