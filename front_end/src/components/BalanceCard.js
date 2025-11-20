import { View, Text, StyleSheet, Pressable } from "react-native";
import { useThemeMode } from "@theme/ThemeContext";

const BalanceCard = ({ label, amount, growth, onPress }) => {
  const { colors } = useThemeMode();
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View
        style={[styles.gradient, { backgroundColor: "#1565C0" }]}
      >
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.status}>
            <Text style={styles.statusText}>Protected</Text>
          </View>
        </View>
        <Text style={styles.amount}>{amount.toLocaleString()} RWF</Text>
        <Text style={styles.growth}>{growth}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.9,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  amount: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  growth: {
    color: "#ffffff",
    opacity: 0.9,
    fontSize: 12,
  },
});

export default BalanceCard;
