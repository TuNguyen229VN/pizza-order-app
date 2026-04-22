import { connectDB } from "@/libs/connectDB";
import { MenuItem } from "@/models/MenuItem";

export async function POST(req) {
    await connectDB();
    const data = await req.json();
    const menuItemdoc = await MenuItem.create(data);
    return Response.json(menuItemdoc);
}

export async function PUT(req) {
    await connectDB();
    const {_id, ...data} = await req.json();
    await MenuItem.findByIdAndUpdate(_id, data);
    return Response.json(true);
}

export async function GET() {
    await connectDB();
    const menuItems = await MenuItem.find();
    return Response.json(menuItems);
}