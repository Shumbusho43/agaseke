import { View, Pressable, Text, StyleSheet } from "react-native";
import { useThemeMode } from "@theme/ThemeContext";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const NumberPad = ({ value, onChange }) => {
  const { colors } = useThemeMode();

  const handlePress = (key) => {
    if (key === "⌫") {
      onChange((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "." && value.includes(".")) {
      return;
    }
    onChange((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  };

  return (
    <View style={styles.grid}>
      {keys.map((key) => (
        <Pressable
          key={key}
          onPress={() => handlePress(key)}
          style={[
            styles.key,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  key: {
    width: "31%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  keyText: {
    fontSize: 20,
    fontWeight: "600",
  },
});

export default NumberPad;