import { View, Text, StyleSheet } from 'react-native';
import { useThemeMode } from '@theme/ThemeContext';

const Section = ({ title, children, action }) => {
  const { colors } = useThemeMode();
  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {action}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '700'
  }
});

export default Section;