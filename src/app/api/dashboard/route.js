import { connectDB } from "@/libs/connectDB";
import { Order } from "@/models/Order";
import { Category } from "@/models/Category";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || ""; // "" = tất cả trừ cancelled
  const monthFilter = searchParams.get("month") || "";   // "YYYY-MM" hoặc ""

  // --- match dùng cho doanh thu / khách hàng / pizza đã bán (loại cancelled mặc định) ---
  const match = { paid: true };
  if (statusFilter) {
    match.status = statusFilter;
  } else {
    match.status = { $ne: "cancelled" };
  }
  if (monthFilter) {
    const [y, m] = monthFilter.split("-").map(Number);
    match.createdAt = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }

  // --- match riêng cho "Tổng đơn hàng": lấy TẤT CẢ đơn (kể cả cancelled, kể cả chưa paid), chỉ lọc theo tháng nếu có ---
  const allOrdersMatch = {};
  if (monthFilter) {
    const [y, m] = monthFilter.split("-").map(Number);
    allOrdersMatch.createdAt = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }

  const pizzaCategory = await Category.findOne({ name: { $regex: /pizza/i } }).lean();
  const pizzaCategoryId = pizzaCategory?._id?.toString();
  const pizzaItemMatch = {
    "cartProducts.type": { $ne: "combo" },
    ...(pizzaCategoryId ? { "cartProducts.category": pizzaCategoryId } : {}),
  };
  const comboItemMatch = { "cartProducts.type": "combo" };

  const trendMatch = { paid: true };
  trendMatch.status = statusFilter ? statusFilter : { $ne: "cancelled" };

  const ratioMatch = {};
  if (monthFilter) {
    const [y, m] = monthFilter.split("-").map(Number);
    ratioMatch.createdAt = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }

  const [
    revenueAgg,
    totalOrders,
    customerAgg,
    pizzaSoldAgg,
    comboSoldAgg,
    revenueByMonth,
    topProducts,
    statusRatio,
    latestOrders,
  ] = await Promise.all([
    Order.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$totalOrder" } } },
    ]),

    // Tổng đơn hàng - TẤT CẢ, kể cả cancelled
    Order.countDocuments(allOrdersMatch),

    Order.aggregate([
      { $match: match },
      { $group: { _id: "$userEmail" } },
      { $count: "total" },
    ]),

    // Tổng pizza/món đơn đã bán (không tính combo)
    Order.aggregate([
      { $match: match },
      { $unwind: "$cartProducts" },
      { $match: pizzaItemMatch },
      { $group: { _id: null, total: { $sum: "$cartProducts.quantity" } } },
    ]),

    // Tổng combo đã bán
    Order.aggregate([
      { $match: match },
      { $unwind: "$cartProducts" },
      { $match: comboItemMatch },
      { $group: { _id: null, total: { $sum: "$cartProducts.quantity" } } },
    ]),

    Order.aggregate([
      { $match: trendMatch },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalOrder" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),

    // Top 5 sản phẩm bán chạy - TẤT CẢ (món đơn + combo)
    Order.aggregate([
      { $match: match },
      { $unwind: "$cartProducts" },
      { $group: { _id: "$cartProducts.name", quantity: { $sum: "$cartProducts.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),

    Order.aggregate([
      { $match: ratioMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Order.find(monthFilter ? { createdAt: ratioMatch.createdAt } : {})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("userName userEmail totalOrder status paid createdAt")
      .lean(),
  ]);

  const monthLabel = (y, m) => `${String(m).padStart(2, "0")}/${y}`;

  return NextResponse.json({
    totalRevenue: revenueAgg[0]?.total || 0,
    totalOrders,
    totalCustomers: customerAgg[0]?.total || 0,
    totalPizzaSold: pizzaSoldAgg[0]?.total || 0,
    totalComboSold: comboSoldAgg[0]?.total || 0,
    revenueByMonth: revenueByMonth.map((r) => ({
      month: monthLabel(r._id.year, r._id.month),
      revenue: r.total,
    })),
    topProducts: topProducts.map((p) => ({ name: p._id || "Không rõ", quantity: p.quantity })),
    statusRatio: statusRatio.map((s) => ({ status: s._id, count: s.count })),
    latestOrders,
  });
}