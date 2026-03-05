import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  await requireSuperadmin();

  const { id } = await ctx.params;
  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from("images")
    .update({
      url: body.url,
      image_description: body.image_description,
    })
    .eq("id", id)
    .select("id,url,image_description")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ row: data });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  await requireSuperadmin();

  const { id } = await ctx.params;

  // delete dependent captions first (FK)
  const { error: capErr } = await supabaseAdmin
    .from("captions")
    .delete()
    .eq("image_id", id);

  if (capErr) {
    return NextResponse.json({ error: capErr.message }, { status: 500 });
  }

  const { error: imgErr } = await supabaseAdmin.from("images").delete().eq("id", id);

  if (imgErr) {
    return NextResponse.json({ error: imgErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}