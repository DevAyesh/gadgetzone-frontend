// @ts-nocheck
const createClient = async () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }), order: () => ({ data: [] }), returns: () => ({ data: [] }) }), order: () => ({ data: [] }), single: () => ({ data: null }), ilike: () => ({ data: [] }), limit: () => ({ data: [] }) }), insert: () => ({ select: () => ({ single: () => ({ error: null, data: null }) }), error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }), auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;
import { NextResponse } from "next/server";
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("is_popular")
    .limit(1);
  return NextResponse.json({ data, error });
}
