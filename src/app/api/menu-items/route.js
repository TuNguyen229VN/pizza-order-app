import { connectDB } from "@/libs/connectDB";
import { MenuItem } from "@/models/MenuItem";

export async function POST(req) {
    await connectDB();
    const data = await req.json();
    const menuItemdoc = await MenuItem.create(data);
    return Response.json(menuItemdoc);
}