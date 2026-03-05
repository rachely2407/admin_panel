import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  await requireSuperadmin();

  const { data, error } = await supabaseAdmin
    .from("images")
    .select("id,url,image_description")
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data });
}

export async function POST(req: Request) {
  await requireSuperadmin();

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("images")
    .insert([
      {
        url: body.url,
        image_description: body.image_description,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data });
}