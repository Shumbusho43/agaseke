import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { useThemeMode } from '@theme/ThemeContext';
import api, { handleApiError } from '@services/api';

const NewGoalScreen = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useThemeMode();
  const navigation = useNavigation();
  const route = useRoute();
  const onSuccess = route.params?.onSuccess;

  const formatCurrency = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return Number(numericValue).toLocaleString('en-US');
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setDisplayAmount(formatCurrency(text));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDateDisplay = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCreate = async () => {
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Missing Fields', 'Please fill out all fields to create a goal.');
      return;
    }
    try {
      await api.post('/saving/create', {
        goalName: name,
        targetAmount: Number(amount),
        lockUntil: date.toISOString()
      });
      Alert.alert('Goal Created', `${name} target set for ${displayAmount} RWF by ${formatDateDisplay(date)}.`, [
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
            value={displayAmount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            style={[styles.input, inputStyle]}
          />
          <Pressable onPress={() => setShowDatePicker(true)}>
            <View pointerEvents="none">
              <TextInput
                placeholder="Target Date"
                placeholderTextColor={colors.subtitle}
                value={formatDateDisplay(date)}
                editable={false}
                style={[styles.input, inputStyle]}
              />
            </View>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
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

