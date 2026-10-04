export type PlanType = 'lifetime' | 'monthly';

export interface CheckoutResult {
  success: boolean;
  isPro: boolean;
  planId: string | null;
  error?: string;
  checkoutHtml?: string | null;
}

export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  planId: string | null;
  error?: string;
}

export function initPurchases(): Promise<void>;
export function startCheckout(
  planType: PlanType,
  user?: { id?: string; name?: string; surname?: string; email?: string }
): Promise<CheckoutResult>;
export function buyPackage(planType: PlanType): Promise<CheckoutResult>;
export function restorePurchases(): Promise<CheckoutResult>;
export function checkProStatus(): Promise<{ isPro: boolean; planId: string | null }>;
