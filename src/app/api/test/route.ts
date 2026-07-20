// @ts-nocheck
const mq = { select:function(){return this}, eq:function(){return this}, order:function(){return this}, limit:function(){return this}, single:async function(){return {data:null,error:null}}, ilike:function(){return this}, returns:function(){return this}, then:function(cb){cb({data:[],error:null})} };
const createClient = async () => ({ from: () => mq, insert: () => mq, update: () => mq, delete: () => mq, auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
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
