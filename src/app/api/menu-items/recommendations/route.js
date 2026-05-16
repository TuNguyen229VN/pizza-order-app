import { connectDB } from "@/libs/connectDB";
import { MenuItem } from "@/models/MenuItem";


export async function POST(req) {
  await connectDB();

  const body = await req.json().catch(() => ({}));
  const cart = body.cart || []; // array cart items

  // Lấy tất cả items đang active
  const allActiveItems = await MenuItem.find({ status: "on" });

  let recommended = [];

  if (cart.length > 0) {
    // Lấy danh sách categoryId từ cart (unique)
    const cartCategoryIds = [
      ...new Set(cart.map((item) => item.category?.toString()).filter(Boolean)),
    ];

    // Items cùng category với cart, loại trừ items đã có trong cart
    const cartItemIds = cart.map((item) => item._id?.toString());

    const sameCategory = allActiveItems.filter(
      (item) =>
        cartCategoryIds.includes(item.category?.toString()) &&
        !cartItemIds.includes(item._id.toString())
    );

    // Shuffle sameCategory
    const shuffledSameCategory = sameCategory.sort(() => Math.random() - 0.5);

    recommended = shuffledSameCategory.slice(0, 10);

    // Nếu chưa đủ 10 → fill thêm bằng random từ các items còn lại
    if (recommended.length < 10) {
      const usedIds = new Set([
        ...cartItemIds,
        ...recommended.map((i) => i._id.toString()),
      ]);

      const remaining = allActiveItems
        .filter((item) => !usedIds.has(item._id.toString()))
        .sort(() => Math.random() - 0.5);

      recommended = [...recommended, ...remaining].slice(0, 10);
    }
  } else {
    // Không có cart → random 10 items
    recommended = allActiveItems.sort(() => Math.random() - 0.5).slice(0, 10);
  }

  return Response.json({ menuItems: recommended });
}