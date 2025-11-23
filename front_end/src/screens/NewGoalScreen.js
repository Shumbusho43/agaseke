import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { useThemeMode } from '@theme/ThemeContext';
import api, { handleApiError } from '@services/api';

const NewGoalScreen = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const { colors } = useThemeMode();
  const navigation = useNavigation();
  const route = useRoute();
  const onSuccess = route.params?.onSuccess;

  const handleCreate = async () => {
    if (!name.trim() || !amount.trim() || !date.trim()) {
      Alert.alert('Missing Fields', 'Please fill out all fields to create a goal.');
      return;
    }
    try {
      await api.post('/saving/create', {
        goalName: name,
        targetAmount: Number(amount),
        lockUntil: new Date(date).toISOString()
      });
      Alert.alert('Goal Created', `${name} target set for ${amount} RWF by ${date}.`, [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', handleApiError(error));
    }
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.text
  };

  return (
    <Screen>
      <Section title="Create New Goal">
        <View style={{ gap: 16 }}>
          <TextInput
            placeholder="Goal Name"
            placeholderTextColor={colors.subtitle}
            value={name}
            onChangeText={setName}
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Target Amount (RWF)"
            placeholderTextColor={colors.subtitle}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={[styles.input, inputStyle]}
          />
          <TextInput
            placeholder="Target Date (YYYY-MM-DD)"
            placeholderTextColor={colors.subtitle}
            value={date}
            onChangeText={setDate}
            style={[styles.input, inputStyle]}
          />
        </View>
      </Section>

      <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleCreate}>
        <Text style={styles.primaryBtnText}>Create Savings Goal</Text>
      </Pressable>
    </Screen>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    fontSize: 16
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
  }
});

export default NewGoalScreen;

