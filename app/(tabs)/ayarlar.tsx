import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Star, Bell, Shield, Info, LogOut, X, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { usePro } from '@/lib/pro-context';
import { useProfile } from '@/lib/profile-context';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { Image, Alert as RNAlert } from 'react-native';

export default function AyarlarScreen() {
  const router = useRouter();
  const { isPro, planId, cancelPro } = usePro();
  const { profile } = useProfile();
  const { profile: authProfile, signOut } = useAuth();
  const [notifModal, setNotifModal] = useState(false);
  const [privacyModal, setPrivacyModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() ?? 'A';
  };

  const handleSignOut = () => {
    RNAlert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: async () => { await signOut(); } },
    ]);
  };

  const handleRateApp = () => {
    const storeUrl = Platform.OS === 'ios'
      ? 'itms-apps://itunes.apple.com/app/idAPP_ID?action=write-review'
      : 'market://details?id=com.atolyem.app';
    Linking.canOpenURL(storeUrl).then(can => {
      if (can) Linking.openURL(storeUrl);
      else Linking.openURL('https://play.google.com/store/apps/details?id=com.atolyem.app');
    });
  };

  const displayName = authProfile?.name ?? profile?.name ?? 'Atölye Kullanıcısı';
  const displayEmail = authProfile?.email ?? profile?.email ?? null;
  const avatarUrl = authProfile?.avatar_url ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card - read only */}
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
            <View style={styles.planRow}>
              {isPro ? (
                <>
                  <Crown color={Colors.proGold} size={14} />
                  <Text style={styles.planTextPro}>Pro Üye</Text>
                </>
              ) : (
                <Text style={styles.planTextFree}>Ücretsiz Plan</Text>
              )}
            </View>
          </View>
        </View>

        {!isPro && (
          <TouchableOpacity style={styles.upgradeCard} onPress={() => router.push('/pro-upgrade')}>
            <View style={styles.upgradeLeft}>
              <Crown color={Colors.proGold} size={28} />
              <View>
                <Text style={styles.upgradeTitle}>Pro'ya Yükseltin</Text>
                <Text style={styles.upgradeDesc}>Yapay zeka teşhisi, reklamsız deneyim ve daha fazlası</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Genel</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => setNotifModal(true)}>
            <Bell color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Bildirimler</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => setPrivacyModal(true)}>
            <Shield color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Gizlilik</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => setAboutModal(true)}>
            <Info color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Hakkında</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Premium</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => isPro ? null : router.push('/pro-upgrade')}>
            <Crown color={isPro ? Colors.proGold : Colors.neutral400} size={20} />
            <Text style={styles.rowText}>Pro Üyelik</Text>
            <Text style={styles.rowValue}>{isPro ? 'Aktif' : 'Pasif'}</Text>
          </TouchableOpacity>
          {isPro && (
            <TouchableOpacity
              style={styles.row}
              onPress={() => Alert.alert('Pro Üyelik İptali', 'Pro üyeliğinizi iptal etmek istediğinize emin misiniz?', [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'İptal Et', style: 'destructive', onPress: async () => { await cancelPro(); Alert.alert('İptal Edildi', 'Pro üyeliğiniz iptal edildi.'); } },
              ])}
            >
              <LogOut color={Colors.danger} size={20} />
              <Text style={styles.rowText}>Pro Üyeliği İptal Et</Text>
              {planId && <Text style={styles.rowValue}>{planId === 'yearly' ? 'Yıllık' : 'Aylık'}</Text>}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.row} onPress={handleRateApp}>
            <Star color={Colors.neutral500} size={20} />
            <Text style={styles.rowText}>Uygulamayı Değerlendir</Text>
            <ChevronRight color={Colors.neutral300} size={18} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut color={Colors.danger} size={20} />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bildirimler Modal */}
      <Modal visible={notifModal} animationType="slide" transparent onRequestClose={() => setNotifModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bildirimler</Text>
              <TouchableOpacity onPress={() => setNotifModal(false)} style={styles.modalCloseBtn}>
                <X color={Colors.neutral500} size={22} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>
              Stok bildirimleri, malzeme miktarı kritik seviyenin altına düştüğünde otomatik olarak gönderilir.{"\n\n"}
              Bildirim izinlerini cihazınızın ayarlarından yönetebilirsiniz.
            </Text>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.modalBody}>
              Verileriniz cihazınızda ve güvenli altyapıda saklanır.{"\n\n"}
              Malzeme envanteriniz ve proje bilgileriniz şifrelenerek depolanır. Hiçbir kişisel veriniz üçüncü taraflarla paylaşılmaz.{"\n\n"}
              Çevrimdışı modda veriler cihazınızda saklanır, internet bağlantısı sağlandığında güvenli olarak senkronize edilir.
            </Text>
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
            <Text style={styles.aboutVersion}>Atölyem v1.0.0</Text>
            <Text style={styles.modalBody}>
              Atölye & Şantiye Yönetim Asistanınız{"\n\n"}
              Malzeme envanteri, proje yönetimi, metraj hesaplama ve uzman danışmanlığı tek bir uygulamada.{"\n\n"}
              Geliştirici: Atölyem Ekibi{"\n"}
              İletişim: destek@atolyem.com
            </Text>
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
    backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarImage: {
    width: 56, height: 56, borderRadius: 28,
  },
  providerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.neutral100, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start',
  },
  providerText: { fontFamily: 'Inter-SemiBold', fontSize: 10, color: Colors.neutral500 },
  profileAvatarText: { fontFamily: 'Inter-Bold', fontSize: 24, color: Colors.white },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: Colors.neutral800 },
  profileEmail: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.neutral400, marginTop: 2 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  planTextPro: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: Colors.proGold },
  planTextFree: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.neutral400 },
  upgradeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.neutral900,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  upgradeLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  upgradeTitle: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: Colors.white },
  upgradeDesc: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.neutral400, marginTop: 2 },
  sectionTitle: { fontFamily: 'Inter-SemiBold', fontSize: 13, color: Colors.neutral500, marginBottom: 8, marginLeft: 4 },
  section: {
    backgroundColor: Colors.white, borderRadius: 14, marginBottom: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral100, gap: 12,
  },
  rowText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 15, color: Colors.neutral800 },
  rowValue: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.neutral400 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 14, marginBottom: 20,
    borderWidth: 1.5, borderColor: Colors.dangerLight,
  },
  signOutText: { fontFamily: 'Inter-SemiBold', fontSize: 15, color: Colors.danger },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Inter-Bold', fontSize: 20, color: Colors.neutral800 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.neutral100, justifyContent: 'center', alignItems: 'center' },
  modalBody: { fontFamily: 'Inter-Regular', fontSize: 15, color: Colors.neutral600, lineHeight: 24 },
  aboutVersion: { fontFamily: 'Inter-Bold', fontSize: 18, color: Colors.primary, marginBottom: 12 },
});
