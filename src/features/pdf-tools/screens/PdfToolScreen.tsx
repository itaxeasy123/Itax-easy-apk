import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PdfToolScreenProps = {
  bullets: string[];
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
};

export default function PdfToolScreen({
  bullets,
  description,
  icon,
  title,
}: PdfToolScreenProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color="#2C5FCD" name="chevron-back" size={20} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.iconWrap}>
            <Ionicons color="#2C5FCD" name={icon} size={28} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you can do</Text>
          {bullets.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <Ionicons color="#347BE5" name="checkmark-circle" size={16} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F5F9FF',
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 18,
  },
  backText: {
    color: '#2C5FCD',
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    marginBottom: 14,
    width: 60,
  },
  title: {
    color: '#1F2940',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#60708A',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  cardTitle: {
    color: '#1F2940',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  bulletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  bulletText: {
    color: '#51627F',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
