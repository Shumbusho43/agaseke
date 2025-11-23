import { View, Text, StyleSheet } from 'react-native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { termsSections } from '@data/mockData';
import { useThemeMode } from '@theme/ThemeContext';

const TermsScreen = () => {
  const { colors } = useThemeMode();
  return (
    <Screen>
      <Section title="Terms & Conditions">
        <View style={styles.timeline}>
          {termsSections.map(section => (
            <View key={section.title} style={styles.timelineItem}>
              <View style={[styles.bullet, { borderColor: colors.primary }]} />
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{section.title}</Text>
                {section.lines.map(line => (
                  <Text key={line} style={[styles.cardLine, { color: colors.subtitle }]}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  timeline: {
    gap: 20
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12
  },
  bullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 6
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: 8
  },
  cardLine: {
    fontSize: 14,
    marginBottom: 4
  }
});

export default TermsScreen;

