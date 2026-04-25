import { connectDB } from "@/libs/connectDB";
import { Category } from "@/models/Category";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();
  const { name } = await req.json();
  const categoryDoc = await Category.create({ name });
  return Response.json(categoryDoc);
}

export async function PUT(req) {
  await connectDB();
  const { _id, name } = await req.json();
  await Category.updateOne({ _id }, { name });
  return Response.json(true);
}

export async function GET() {
  await connectDB();
  return Response.json(await Category.find());
}

export async function DELETE(req) {
  await connectDB();
  const url = new URL(req.url);
  const _id = url.searchParams.get("_id");
  await Category.deleteOne({ _id });
  return Response.json(true)
}