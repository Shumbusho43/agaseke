import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Screen from "@components/Screen";
import Section from "@components/Section";
import { useThemeMode } from "@theme/ThemeContext";
import api, { handleApiError } from "@services/api";

const filters = ["all", "withdraw", "pending"];

const ActivityScreen = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeMode();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const { data } = await api.get("/withdrawal");
          setWithdrawals(data || []);
        } catch (error) {
          Alert.alert("Error", handleApiError(error));
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const stats = useMemo(() => {
    const totalWithdrawals = withdrawals.filter(
      (item) => item.status === "approved"
    ).length;
    const pending = withdrawals.filter(
      (item) => item.status === "pending"
    ).length;
    return {
      withdrawals: totalWithdrawals,
      pending,
    };
  }, [withdrawals]);

  const filteredTransactions =
    activeFilter === "all"
      ? withdrawals
      : withdrawals.filter((item) =>
          activeFilter === "pending"
            ? item.status === "pending"
            : item.status !== "pending"
        );

  return (
    <Screen>
      <Section title="Stats">
        <View style={styles.statsGrid}>
          <Stat label="Approved Withdrawals" value={stats.withdrawals} />
          <Stat label="Pending Requests" value={stats.pending} />
        </View>
      </Section>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          {stats.pending > 0 && (
            <Section title="Pending Withdrawal Requests">
              <View
                style={[styles.pendingList, { borderColor: colors.border }]}
              >
                {withdrawals
                  .filter((item) => item.status === "pending")
                  .map((item) => (
                    <View
                      key={item._id}
                      style={[
                        styles.pendingRow,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <View>
                        <Text
                          style={[styles.pendingTitle, { color: colors.text }]}
                        >
                          {item.amount.toLocaleString()} RWF
                        </Text>
                        <Text style={{ color: colors.subtitle, fontSize: 12 }}>
                          Requested{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.pendingAmount,
                          { color: colors.primary },
                        ]}
                      >
                        Awaiting
                      </Text>
                    </View>
                  ))}
              </View>
            </Section>
          )}

          <Section
            title="Withdrawals"
            action={
              <View style={styles.filterRow}>
                {filters.map((filter) => (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          activeFilter === filter
                            ? colors.primary
                            : "transparent",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          activeFilter === filter ? "#ffffff" : colors.subtitle,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            }
          >
            <View style={{ gap: 12 }}>
              {filteredTransactions.map((item) => (
                <TransactionRow key={item._id} item={item} />
              ))}
              {filteredTransactions.length === 0 && (
                <Text style={{ color: colors.subtitle }}>No activity yet.</Text>
              )}
            </View>
          </Section>
        </>
      )}
    </Screen>
  );
};

const Stat = ({ label, value }) => {
  const { colors } = useThemeMode();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.subtitle }]}>
        {label}
      </Text>
    </View>
  );
};

const TransactionRow = ({ item }) => {
  const { colors } = useThemeMode();
  const isPending = item.status === "pending";
  return (
    <View
      style={[
        styles.transactionRow,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View>
        <Text style={[styles.transactionLabel, { color: colors.text }]}>
          Withdrawal • {item.status}
        </Text>
        <Text style={{ color: colors.subtitle, fontSize: 12 }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <Text
        style={{
          color: isPending ? colors.warning : colors.danger,
          fontWeight: "700",
        }}
      >
        -{item.amount.toLocaleString()} RWF
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 12,
  },
  pendingList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  pendingRow: {
    padding: 16,
    borderBottomWidth: 1,
  },
  pendingTitle: {
    fontWeight: "600",
  },
  pendingAmount: {
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  transactionRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLabel: {
    fontWeight: "600",
  },
  loader: {
    paddingVertical: 32,
    alignItems: "center",
  },
});

export default ActivityScreen;