import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Image } from 'react-native';
import { Shield, Info, LogOut, X, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { useProfile } from '@/lib/profile-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';

export default function AyarlarScreen() {
  const { profile } = useProfile();
  const { profile: authProfile, signOut } = useAuth();
  const [privacyModal, setPrivacyModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const displayName = authProfile?.name ?? profile?.name ?? 'Atölye Kullanıcısı';
  const displayEmail = authProfile?.email ?? profile?.email ?? null;
  const avatarUrl = authProfile?.avatar_url ?? null;

  const getInitials = (name: string) => name?.charAt(0)?.toUpperCase() ?? 'A';

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.profileAvatarImage} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: profile?.avatar_color || Colors.primary }]}>
              <Text style={styles.profileAvatarText}>{getInitials(displayName)}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail || 'İletişim bilgisi yok'}</Text>
            {authProfile?.provider && (
              <View style={styles.providerBadge}>
                {authProfile.provider === 'google' && <Text style={styles.providerText}>Google</Text>}
                {authProfile.provider === 'phone' && <Text style={styles.providerText}>Telefon</Text>}
              </View>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Genel</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setPrivacyModal(true)}>
            <Shield color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Gizlilik</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={() => setAboutModal(true)}>
            <Info color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Hakkında</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut color={Colors.danger} size={20} />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Gizlilik Modal */}
      <Modal visible={privacyModal} animationType="slide" transparent onRequestClose={() => setPrivacyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gizlilik Politikası</Text>
              <TouchableOpacity onPress={() => setPrivacyModal(false)} style={styles.modalCloseBtn}>
                <X color={Colors.neutral500} size={22} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>
                Verileriniz cihazınızda ve güvenli altyapıda saklanır.{"\n\n"}
                Malzeme envanteriniz ve proje bilgileriniz şifrelenerek depolanır. Hiçbir kişisel veriniz üçüncü taraflarla paylaşılmaz.{"\n\n"}
                Çevrimdışı modda veriler cihazınızda saklanır, internet bağlantısı sağlandığında güvenli olarak senkronize edilir.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hakkında Modal */}
      <Modal visible={aboutModal} animationType="slide" transparent onRequestClose={() => setAboutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hakkında</Text>
              <TouchableOpacity onPress={() => setAboutModal(false)} style={styles.modalCloseBtn}>
                <X color={Colors.neutral500} size={22} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.aboutVersion}>Atölye; Mimar, Usta v1.0.0</Text>
              <Text style={styles.modalBody}>
                Atölye ve Şantiye Yönetim Asistanınız{"\n\n"}
                Malzeme envanteri, proje yönetimi, metraj hesaplama ve uzman danışmanlığı tek bir uygulamada.{"\n\n"}
                Geliştirici: Atölyem Ekibi{"\n"}
                İletişim: destek.atolyem@gmail.com
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral50 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: Colors.primary },
  title: { fontFamily: 'Inter-Bold', fontSize: 22, color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 20, paddingBottom: 100 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  profileAvatarImage: { width: 56, height: 56, borderRadius: 28 },
  profileAvatarText: { fontFamily: 'Inter-Bold', fontSize: 24, color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: Colors.neutral800 },
  profileEmail: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.neutral400, marginTop: 2 },
  providerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.neutral100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start',
  },
  providerText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: Colors.neutral500 },
  sectionTitle: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: Colors.neutral500, marginBottom: 8, marginLeft: 4 },
  section: {
    backgroundColor: Colors.white, borderRadius: 14, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral100, gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rowText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 15, color: Colors.neutral800 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 14, marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.dangerLight,
  },
  signOutText: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: Colors.danger },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: Colors.neutral800 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral100, justifyContent: 'center', alignItems: 'center' },
  modalBody: { fontFamily: 'Inter-Regular', fontSize: 15, color: Colors.neutral600, lineHeight: 24, paddingBottom: 24 },
  aboutVersion: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.primary, marginBottom: 12 },
});
