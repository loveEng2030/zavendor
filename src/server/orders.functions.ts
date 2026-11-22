import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const CreateOrderInput = z.object({
  access_token: z.string().min(10).optional().nullable(),
  customer_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(30),
  address: z.string().trim().min(3).max(500),
  receipt_url: z.string().trim().min(1).max(500),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1)
    .max(100),
});

export const createOrder = createServerFn({ method: "POST" })
  .validator((input: unknown) => CreateOrderInput.parse(input))
  .handler(async ({ data }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Server is missing Supabase configuration");
    }

    let userId: string | null = null;
    const headers: Record<string, string> = {};

    if (data.access_token) {
      headers.Authorization = `Bearer ${data.access_token}`;
    }

    const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    if (data.access_token) {
      const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(
        data.access_token,
      );
      if (claimsErr || !claimsData?.claims?.sub) {
        throw new Error("Unauthorized");
      }
      userId = claimsData.claims.sub;
    }

    const ids = data.items.map((i) => i.id);
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", ids);

    if (prodErr) throw new Error(prodErr.message);
    if (!products || products.length !== ids.length) {
      throw new Error("Some products no longer exist");
    }

    const priceMap = new Map(
      products.map((p) => [p.id, { name: p.name, price: Number(p.price) }]),
    );

    let total = 0;
    const itemsForOrder = data.items.map((i) => {
      const p = priceMap.get(i.id);
      if (!p) throw new Error(`Unknown product: ${i.id}`);
      total += p.price * i.quantity;
      return { id: i.id, name: p.name, price: p.price, quantity: i.quantity };
    });

    if (total <= 0) throw new Error("Invalid order total");

    const { error: insErr } = await supabase.from("orders").insert({
      user_id: userId,
      customer_name: data.customer_name,
      phone: data.phone,
      address: data.address,
      total_amount: total,
      status: "pending",
      receipt_url: data.receipt_url,
      items: itemsForOrder,
    });

    if (insErr) throw new Error(insErr.message);

    return { success: true, total };
  });
