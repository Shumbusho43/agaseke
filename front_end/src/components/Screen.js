import { SafeAreaView, ScrollView, View, StyleSheet } from 'react-native';
import { useThemeMode } from '@theme/ThemeContext';

const Screen = ({
  children,
  scrollable = true,
  contentStyle,
  testID
}) => {
  const { colors } = useThemeMode();

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} testID={testID}>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} testID={testID}>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32
  }
});

export default Screen;
