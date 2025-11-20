import { View, Text, StyleSheet, Pressable } from "react-native";
import { useThemeMode } from "@theme/ThemeContext";
import Screen from "@components/Screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GetStartedScreen = ({ navigation }) => {
  const { colors } = useThemeMode();

  const handleGetStarted = async () => {
    await AsyncStorage.setItem("hasLaunched", "true");
    navigation.navigate("Signup");
  };

  const handleSignIn = async () => {
    await AsyncStorage.setItem("hasLaunched", "true");
    navigation.navigate("Login");
  };

  return (
    <Screen scrollable={false} contentStyle={styles.content}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: colors.primary }]}>AGASEKE</Text>
          <Text style={[styles.tagline, { color: colors.subtitle }]}>
            Your Digital Piggy Bank
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleGetStarted}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            onPress={handleSignIn}
          >
            <Text style={[styles.secondaryText, { color: colors.primary }]}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  secondaryText: {
    fontWeight: "700",
    fontSize: 16,
  },
});

export default GetStartedScreen;

