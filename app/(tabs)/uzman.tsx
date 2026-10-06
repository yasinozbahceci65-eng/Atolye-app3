import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { HardHat, PencilRuler, ScanLine, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { useGuestGuard } from '@/lib/guest-guard';

export default function UzmanScreen() {
  const router = useRouter();
  const { requireAuth } = useGuestGuard();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Uzman Desteği</Text>
        <Text style={styles.title}>Danış & Çöz</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => requireAuth() && router.push({ pathname: '/consult', params: { type: 'usta' } })}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#FEF3C7' }]}>
            <HardHat color={Colors.secondary} size={28} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Ustaya Danış</Text>
            <Text style={styles.cardDesc}>Sorunlu bölgenin fotoğrafını yükleyin, açıklama yazın ve WhatsApp ile ustaya gönderin.</Text>
          </View>
          <ArrowRight color={Colors.neutral300} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => requireAuth() && router.push({ pathname: '/consult', params: { type: 'mimar' } })}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#DBEAFE' }]}>
            <PencilRuler color={Colors.primary} size={28} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Mimara Danış</Text>
            <Text style={styles.cardDesc}>Proje veya tasarım sorularınızı mimara iletin, fotoğraf ekleyerek destek alın.</Text>
          </View>
          <ArrowRight color={Colors.neutral300} size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => requireAuth() && router.push('/scanner')}
        >
          <View style={[styles.cardIcon, { backgroundColor: '#DCFCE7' }]}>
            <ScanLine color={Colors.accent} size={28} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Hızlı Tarayıcı</Text>
            <Text style={styles.cardDesc}>Barkod veya QR kod tarayarak malzemenin miktarını anında güncelleyin.</Text>
          </View>
          <ArrowRight color={Colors.neutral300} size={20} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral50 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: Colors.primary },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  title: { fontFamily: 'Inter-Bold', fontSize: 22, color: Colors.white },
  scroll: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardIcon: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1, marginLeft: 14 },
  cardTitle: { fontFamily: 'Inter-SemiBold', fontSize: 16, color: Colors.neutral800 },
  cardDesc: { fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.neutral500, marginTop: 4, lineHeight: 18 },
});
