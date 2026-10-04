import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { supabase, ProSubscription } from '@/lib/supabase';
import { initPurchases, startCheckout, checkProStatus, PlanType, CheckoutResult } from '@/lib/purchase-service';
import { useAuth } from '@/lib/auth-context';

interface ProState {
  isPro: boolean;
  planId: string | null;
  loading: boolean;
  checkout: (planType: PlanType) => Promise<CheckoutResult>;
  confirmPayment: (planType: PlanType) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; error?: string }>;
  cancelPro: () => Promise<void>;
}

const ProContext = createContext<ProState>({
  isPro: false,
  planId: null,
  loading: true,
  checkout: async () => ({ success: false, isPro: false, planId: null }),
  confirmPayment: async () => ({ success: false }),
  restore: async () => ({ success: false }),
  cancelPro: async () => {},
});

export function ProProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPro = useCallback(async () => {
    await initPurchases();
    const rcStatus = await checkProStatus();

    if (rcStatus.isPro) {
      setIsPro(true);
      setPlanId(rcStatus.planId);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('pro_subscriptions')
      .select('*')
      .eq('id', 1)
      .maybeSingle<ProSubscription>();

    if (data) {
      setIsPro(data.is_pro);
      setPlanId(data.plan_id);
    } else {
      await supabase.from('pro_subscriptions').insert({ id: 1, is_pro: false });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPro();
  }, [loadPro]);

  const checkout = useCallback(async (planType: PlanType): Promise<CheckoutResult> => {
    const result = await startCheckout(planType, {
      id: profile?.name ?? undefined,
      name: profile?.name ?? 'Atolye',
      surname: 'Kullanici',
      email: profile?.email ?? undefined,
    });
    return result;
  }, [profile]);

  const confirmPayment = useCallback(async (planType: PlanType): Promise<{ success: boolean; error?: string }> => {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        Alert.alert(
          'Test Modu',
          'Web tarayicisinda gercek odeme yapilamaz. Bu, mobil cihazda iyzico ile gereceklestirilecektir. Test icin Pro uyelik simülasyonu olarak aktif edilsin mi?',
          [
            { text: 'Iptal', onPress: () => resolve({ success: false, error: 'Iptal edildi' }) },
            {
              text: 'Evet, Test Et',
              onPress: async () => {
                const now = new Date();
                const expires = new Date();
                if (planType === 'lifetime') expires.setFullYear(expires.getFullYear() + 100);
                else expires.setMonth(expires.getMonth() + 1);

                await supabase
                  .from('pro_subscriptions')
                  .update({
                    is_pro: true,
                    plan_id: planType,
                    purchased_at: now.toISOString(),
                    expires_at: expires.toISOString(),
                    updated_at: now.toISOString(),
                    iyzico_last_payment_status: 'success',
                  })
                  .eq('id', 1);

                setIsPro(true);
                setPlanId(planType);
                resolve({ success: true });
              },
            },
          ]
        );
      });
    }

    const now = new Date();
    const expires = new Date();
    if (planType === 'lifetime') expires.setFullYear(expires.getFullYear() + 100);
    else expires.setMonth(expires.getMonth() + 1);

    await supabase
      .from('pro_subscriptions')
      .update({
        is_pro: true,
        plan_id: planType,
        purchased_at: now.toISOString(),
        expires_at: expires.toISOString(),
        updated_at: now.toISOString(),
        iyzico_last_payment_status: 'success',
      })
      .eq('id', 1);

    setIsPro(true);
    setPlanId(planType);
    return { success: true };
  }, []);

  const restore = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const { data } = await supabase
      .from('pro_subscriptions')
      .select('*')
      .eq('id', 1)
      .maybeSingle<ProSubscription>();

    if (data?.is_pro) {
      setIsPro(true);
      setPlanId(data.plan_id);
      return { success: true };
    }
    return { success: false, error: 'Geri yuklenecek odeme bulunamadi.' };
  }, []);

  const cancelPro = useCallback(async () => {
    await supabase
      .from('pro_subscriptions')
      .update({ is_pro: false, plan_id: null, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setIsPro(false);
    setPlanId(null);
  }, []);

  return (
    <ProContext.Provider value={{ isPro, planId, loading, checkout, confirmPayment, restore, cancelPro }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() { return useContext(ProContext); }
