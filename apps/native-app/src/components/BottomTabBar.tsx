import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../theme/tokens";
import { TabKey } from "../data/mock";

const tabs: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "대시보드" },
  { key: "room", label: "스터디룸" },
  { key: "penalties", label: "패널티" },
  { key: "history", label: "기록" },
];

export function BottomTabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.key}
          onPress={() => onChange(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
        >
          <Text style={[styles.label, activeTab === tab.key && styles.activeLabel]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 8,
    padding: 8,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,248,241,0.96)",
    borderWidth: 1,
    borderColor: colors.line,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.navy,
  },
  label: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  activeLabel: {
    color: "#FFFFFF",
  },
});
