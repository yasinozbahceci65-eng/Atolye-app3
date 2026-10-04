export type PlanType = 'lifetime' | 'monthly';

export interface CheckoutResult {
  success: boolean;
  isPro: boolean;
  planId: string | null;
  error?: string;
  checkoutHtml?: string | null;
}

const STORAGE_KEY = 'atolye_pro_status';

const PLAN_PRICES: Record<PlanType, { price: number; name: string }> = {
  monthly: { price: 79.99, name: 'Atolyem Pro - Aylik' },
  lifetime: { price: 659.99, name: 'Atolyem Pro - Omur Boyu' },
};

function getSupabaseUrl(): string {
  return process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
}

function getSupabaseAnonKey(): string {
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

export async function initPurchases(): Promise<void> {
  // iyzico icin client-side init gerekmez
}

export async function startCheckout(
  planType: PlanType,
  user?: { id?: string; name?: string; surname?: string; email?: string }
): Promise<CheckoutResult> {
  const conversationId = generateConversationId();
  const supabaseUrl = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !anonKey) {
    return { success: false, isPro: false, planId: null, error: 'Supabase yapilandirmasi eksik.' };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/iyzico-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        planId: planType,
        conversationId,
        user,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, isPro: false, planId: null, error: errData?.error ?? `Sunucu hatasi (${response.status})` };
    }

    const data = await response.json();

    if (data?.mock) {
      return {
        success: false,
        isPro: false,
        planId: null,
        error: data.error ?? 'iyzico API anahtarlari yapilandirilmamis.',
      };
    }

    if (!data?.success) {
      return { success: false, isPro: false, planId: null, error: data?.error ?? 'Odeme baslatma basarisiz.' };
    }

    return {
      success: true,
      isPro: false,
      planId: planType,
      checkoutHtml: data.checkoutFormContent ?? null,
    };
  } catch (e: any) {
    return { success: false, isPro: false, planId: null, error: e?.message ?? 'Ag hatasi.' };
  }
}

export async function buyPackage(planType: PlanType): Promise<CheckoutResult> {
  return startCheckout(planType);
}

export async function restorePurchases(): Promise<CheckoutResult> {
  return { success: false, isPro: false, planId: null, error: 'iyzico odemeler geri yuklenemez. Lutfen tekrar odeme yapin.' };
}

export async function checkProStatus(): Promise<{ isPro: boolean; planId: string | null }> {
  return { isPro: false, planId: null };
}

export { PLAN_PRICES };
