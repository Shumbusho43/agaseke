import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import api, { handleApiError } from '@services/api';
import { useThemeMode } from '@theme/ThemeContext';

const CoSignerPendingScreen = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const { colors } = useThemeMode();

  const fetchPending = () => {
    api.get('/withdrawal/pending')
      .then(res => setWithdrawals(res.data))
      .catch(err => Alert.alert('Error', handleApiError(err)));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = (id, action) => {
    api.post(`/withdrawal/approve/${id}`, { status: action })
      .then(() => {
        Alert.alert('Success', `Withdrawal ${action}`);
        fetchPending();
      })
      .catch(err => Alert.alert('Error', handleApiError(err)));
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.amount, { color: colors.text }]}>{item.amount} RWF</Text>
      <Text style={[styles.meta, { color: colors.subtitle }]}>Requester: {item.userId?.name || item.userId?.email || item.userId}</Text>
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.approve]} onPress={() => handleAction(item._id, 'approved')}>
          <Text style={styles.btnText}>Approve</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.reject]} onPress={() => handleAction(item._id, 'rejected')}>
          <Text style={styles.btnText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen>
      <Section title="Pending Withdrawals">
        <FlatList
          data={withdrawals}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ color: colors.subtitle }}>No pending withdrawals</Text>}
        />
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  amount: { fontSize: 18, fontWeight: '700' },
  meta: { marginTop: 6, fontSize: 12 },
  actions: { flexDirection: 'row', marginTop: 12 },
  btn: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 },
  approve: { backgroundColor: '#2ecc71' },
  reject: { backgroundColor: '#e74c3c' },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default CoSignerPendingScreen;
