import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '@theme/ThemeContext';

const getIcon = (actionKey) => {
  const size = 18;
  switch (actionKey) {
    case 'deposit':
      return <FontAwesome5 name="plus" size={size} color="#ffffff" />;
    case 'withdraw':
      return <MaterialIcons name="arrow-downward" size={size} color="#ffffff" />;
    case 'transfer':
      return <MaterialIcons name="arrow-forward" size={size} color="#ffffff" />;
    case 'goals':
      return <FontAwesome5 name="star" size={size} color="#ffffff" solid />;
    default:
      return null;
  }
};

const colorsByAction = {
  deposit: '#4CAF50',
  withdraw: '#FF7043',
  transfer: '#2196F3',
  goals: '#FFB74D'
};

const QuickActions = ({ onDeposit, onWithdraw, onTransfer, onGoals }) => {
  const { colors } = useThemeMode();
  const actions = [
    { key: 'deposit', label: 'Deposit Money', onPress: onDeposit },
    { key: 'withdraw', label: 'Request Withdrawal', onPress: onWithdraw },
    { key: 'transfer', label: 'Send Money', onPress: onTransfer },
    { key: 'goals', label: 'My Goals', onPress: onGoals }
  ];

  return (
    <View style={styles.grid}>
      {actions.map(action => (
        <Pressable
          key={action.key}
          style={[
            styles.action,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border
            }
          ]}
          onPress={action.onPress}
        >
          <View style={[styles.icon, { backgroundColor: colorsByAction[action.key] }]}>
            {getIcon(action.key)}
          </View>
          <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  action: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    flexWrap: 'wrap'
  }
});

export default QuickActions;