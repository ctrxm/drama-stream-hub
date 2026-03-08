import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BAYAR_GG_API_KEY = Deno.env.get("BAYAR_GG_API_KEY");
    if (!BAYAR_GG_API_KEY) throw new Error("BAYAR_GG_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Invalid auth token");

    const body = await req.json();
    const { amount = 20000, description, customer_email, payment_method = "gopay_qris" } = body;

    // Get the project URL for callbacks
    const projectUrl = req.headers.get("origin") || req.headers.get("referer") || "";

    // Create payment via bayar.gg
    const paymentRes = await fetch("https://www.bayar.gg/api/create-payment.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": BAYAR_GG_API_KEY,
      },
      body: JSON.stringify({
        amount,
        description: description || "Langganan OVRSD - 1 Bulan",
        customer_name: user.email?.split("@")[0],
        customer_email: customer_email || user.email,
        payment_method,
        callback_url: `${supabaseUrl}/functions/v1/payment-webhook`,
        redirect_url: `${projectUrl}/subscribe?status=success`,
      }),
    });

    const paymentData = await paymentRes.json();
    if (!paymentData.success) {
      throw new Error(paymentData.message || "Payment creation failed");
    }

    // Store subscription record
    const { error: insertError } = await supabaseClient
      .from("subscriptions")
      .insert({
        user_id: user.id,
        invoice_id: paymentData.data.invoice_id,
        status: "pending",
        amount,
        payment_method,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice_id: paymentData.data.invoice_id,
        payment_url: paymentData.data.payment_url,
        amount: paymentData.data.final_amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
