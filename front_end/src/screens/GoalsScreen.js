import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Screen from '@components/Screen';
import Section from '@components/Section';
import { useThemeMode } from '@theme/ThemeContext';
import api, { handleApiError } from '@services/api';

const GoalsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useThemeMode();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/saving');
      setGoals(data || []);
    } catch (error) {
      Alert.alert('Error', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const hasGoals = goals.length > 0;

  return (
    <Screen>
      <Section title="My Goals">
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : hasGoals ? (
          <View style={{ gap: 16 }}>
            {goals.map(goal => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome5 name="bullseye" size={48} color={colors.subtitle} />
            </View>
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>No goals yet. Start one today!</Text>
          </View>
        )}
      </Section>

      <Pressable
        style={[styles.secondaryBtn, { borderColor: colors.primary }]}
        onPress={() => navigation.navigate('NewGoal', { onSuccess: fetchGoals })}
      >
        <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>+ Create New Goal</Text>
      </Pressable>
    </Screen>
  );
};

const GoalCard = ({ goal }) => {
  const { colors } = useThemeMode();
  const progress = Math.min((goal.currentAmount || 0) / (goal.targetAmount || 1), 1);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.goalName}</Text>
        <Text style={[styles.goalDeadline, { color: colors.subtitle }]}>
          Target: {goal.targetAmount?.toLocaleString?.()} RWF
        </Text>
      </View>
      <Text style={{ color: colors.subtitle, marginBottom: 12 }}>
        {(goal.currentAmount || 0).toLocaleString()} / {goal.targetAmount?.toLocaleString?.()} RWF
      </Text>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  goalTitle: {
    fontWeight: '700',
    fontSize: 16
  },
  goalDeadline: {
    fontSize: 12
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%'
  },
  secondaryBtn: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24
  },
  secondaryBtnText: {
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyIconContainer: {
    marginBottom: 12
  },
  emptyText: {
    fontSize: 14
  }
});

export default GoalsScreen;