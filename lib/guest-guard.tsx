import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { useAuth } from '@/lib/auth-context';

interface GuestGuardState {
  requireAuth: (action?: string) => boolean;
  modalVisible: boolean;
}

const GuestGuardContext = createContext<GuestGuardState>({
  requireAuth: () => false,
  modalVisible: false,
});

export function GuestGuardProvider({ children }: { children: ReactNode }) {
  const { isGuest, session } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const requireAuth = useCallback((): boolean => {
    if (session) return true;
    if (isGuest) {
      setModalVisible(true);
      return false;
    }
    return true;
  }, [isGuest, session]);

  const goToLogin = () => {
    setModalVisible(false);
    router.replace('/login');
  };

  return (
    <GuestGuardContext.Provider value={{ requireAuth, modalVisible }}>
      {children}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Lock color={Colors.primary} size={32} />
            </View>
            <Text style={styles.title}>Giriş Yapmanız Gerekiyor</Text>
            <Text style={styles.desc}>Bu özelliği kullanabilmek için lütfen giriş yapın.</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={goToLogin}>
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GuestGuardContext.Provider>
  );
}

export function useGuestGuard() { return useContext(GuestGuardContext); }

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.neutral100, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.neutral800, textAlign: 'center' },
  desc: { fontFamily: 'Inter-Regular', fontSize: 14, color: Colors.neutral500, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 24 },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, alignItems: 'center', width: '100%' },
  loginBtnText: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: Colors.white },
  cancelBtn: { marginTop: 12, paddingVertical: 10, paddingHorizontal: 24 },
  cancelBtnText: { fontFamily: 'Inter-Medium', fontSize: 14, color: Colors.neutral400 },
});
