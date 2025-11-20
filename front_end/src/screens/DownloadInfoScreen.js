import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { pricingInfo } from '@data/mockData';
import { useThemeMode } from '@theme/ThemeContext';

const DownloadInfoScreen = () => {
  const { colors } = useThemeMode();
  return (
    <Screen>
      <Section title="AGASEKE Mobile App">
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.heroIcon}>📱</Text>
          <Text style={[styles.heroText, { color: colors.primary }]}>{pricingInfo.hero}</Text>
        </View>
      </Section>

      <Section title="Regional Pricing">
        <View style={{ gap: 12 }}>
          {pricingInfo.tiers.map(tier => (
            <View key={tier.title} style={[styles.tierCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tierTitle, { color: colors.text }]}>{tier.title}</Text>
              <Text style={[styles.tierPrice, { color: colors.primary }]}>{tier.price}</Text>
              <Text style={[styles.tierRegions, { color: colors.subtitle }]}>{tier.regions}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Features Included">
        <View style={[styles.featureList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {pricingInfo.features.map(feature => (
            <Text key={feature} style={[styles.featureItem, { color: colors.text }]}>
              • {feature}
            </Text>
          ))}
        </View>
      </Section>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        onPress={() => alert('Download link will be emailed to you.')}
      >
        <Text style={styles.primaryBtnText}>Download Now</Text>
      </Pressable>
      <Text style={[styles.helperText, { color: colors.subtitle }]}>
        💳 Secure payment via Mobile Money or bank transfer. Link sent to anthonyregina48@gmail.com
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8
  },
  heroIcon: {
    fontSize: 48
  },
  heroText: {
    textAlign: 'center',
    fontWeight: '600'
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  tierTitle: {
    fontWeight: '700',
    fontSize: 16
  },
  tierPrice: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700'
  },
  tierRegions: {
    marginTop: 6,
    fontSize: 13
  },
  featureList: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8
  },
  featureItem: {
    fontSize: 14
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  helperText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8
  }
});

export default DownloadInfoScreen;
