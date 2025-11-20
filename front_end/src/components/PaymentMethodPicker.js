import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useThemeMode } from '@theme/ThemeContext';

const PaymentMethodPicker = ({ methods, selected, onSelect }) => {
  const { colors } = useThemeMode();
  return (
    <View style={styles.container}>
      {methods.map(method => {
        const isSelected = method.id === selected;
        return (
          <Pressable
            key={method.id}
            onPress={() => onSelect(method.id)}
            style={[
              styles.method,
              {
                backgroundColor: colors.surface,
                borderColor: isSelected ? colors.primary : colors.border
              }
            ]}
          >
            <View>
              <Text style={[styles.label, { color: colors.text }]}>{method.label}</Text>
              {method.hint && <Text style={[styles.hint, { color: colors.subtitle }]}>{method.hint}</Text>}
            </View>
            <Text style={{ color: isSelected ? colors.primary : colors.subtitle }}>{isSelected ? '●' : '○'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  method: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontWeight: '600',
    fontSize: 15
  },
  hint: {
    marginTop: 4,
    fontSize: 12
  }
});

export default PaymentMethodPicker;

