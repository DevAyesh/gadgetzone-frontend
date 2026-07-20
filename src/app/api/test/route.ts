import { NextResponse } from "next/server";
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("is_popular")
    .limit(1);
  return NextResponse.json({ data, error });
}
