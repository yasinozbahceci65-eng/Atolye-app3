import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const IYZICO_API_KEY = Deno.env.get("IYZICO_API_KEY") ?? "";
const IYZICO_SECRET_KEY = Deno.env.get("IYZICO_SECRET_KEY") ?? "";
const IYZICO_BASE_URL = Deno.env.get("IYZICO_BASE_URL") ?? "https://sandbox-api.iyzipay.com";

const PLAN_PRICES: Record<string, { price: number; name: string }> = {
  monthly: { price: 79.99, name: "Atolyem Pro - Aylik Abonelik" },
  lifetime: { price: 659.99, name: "Atolyem Pro - Omur Boyu" },
};

async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateAuthorizationHeader(apiKey: string, secretKey: string, body: string): Promise<string> {
  const randomString = Math.random().toString(36).substring(2, 12);
  const dataToHash = apiKey + randomString + body + secretKey;
  const hash = await sha1Hex(dataToHash);
  return `IYZWS ${apiKey}:${hash}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { planId, conversationId, user } = await req.json();

    if (!planId || !PLAN_PRICES[planId]) {
      return new Response(
        JSON.stringify({ error: "Gecersiz plan secildi." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "Eksik bilgi: conversationId gerekli." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const plan = PLAN_PRICES[planId];

    if (!IYZICO_API_KEY || !IYZICO_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          error: "iyzico API anahtarlari yapilandirilmamis.",
          mock: true,
          checkoutFormContent: null,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const buyer = {
      id: user?.id ?? "guest",
      name: user?.name ?? "Atolye",
      surname: user?.surname ?? "Kullanici",
      email: user?.email ?? "guest@atolyem.com",
      identityNumber: "11111111111",
      registrationAddress: "Istanbul, Turkiye",
      city: "Istanbul",
      country: "Turkey",
      ip: "1.2.3.4",
    };

    const shippingAddress = {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Istanbul, Turkiye",
      zipCode: "34000",
    };

    const billingAddress = {
      contactName: `${buyer.name} ${buyer.surname}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Istanbul, Turkiye",
      zipCode: "34000",
    };

    const basketItems = [
      {
        id: planId,
        name: plan.name,
        category1: "Digital Urun",
        category2: "Abonelik",
        itemType: "VIRTUAL",
        price: plan.price,
      },
    ];

    const requestBody = {
      locale: "tr",
      conversationId,
      price: plan.price,
      paidPrice: plan.price,
      currency: "TRY",
      basketId: conversationId,
      paymentGroup: "PRODUCT",
      callbackUrl: `${req.headers.get("origin") ?? "https://atolyem.com"}/payment-callback`,
      enabledInstallments: [1],
      buyer,
      shippingAddress,
      billingAddress,
      basketItems,
    };

    const bodyStr = JSON.stringify(requestBody);
    const authHeader = await generateAuthorizationHeader(IYZICO_API_KEY, IYZICO_SECRET_KEY, bodyStr);

    const iyzicoResponse = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: bodyStr,
    });

    const iyzicoData = await iyzicoResponse.json();

    if (!iyzicoResponse.ok || iyzicoData?.status !== "success") {
      return new Response(
        JSON.stringify({
          error: iyzicoData?.errorMessage ?? "iyzico odeme baslatma basarisiz.",
          iyzicoResponse: iyzicoData,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkoutFormContent: iyzicoData?.checkoutFormContent ?? null,
        conversationId,
        token: iyzicoData?.token ?? null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
