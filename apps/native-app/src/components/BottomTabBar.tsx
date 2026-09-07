import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "../theme/tokens";
import { TabKey } from "../data/mock";

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "dashboard", label: "홈", icon: "home-outline", activeIcon: "home" },
  { key: "room", label: "스터디", icon: "videocam-outline", activeIcon: "videocam" },
  { key: "community", label: "커뮤니티", icon: "chatbubbles-outline", activeIcon: "chatbubbles" },
  { key: "history", label: "기록", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "settings", label: "내 정보", icon: "person-outline", activeIcon: "person" },
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
          <Ionicons
            name={activeTab === tab.key ? tab.activeIcon : tab.icon}
            size={21}
            color={activeTab === tab.key ? colors.brand : colors.muted}
          />
          <Text style={[styles.label, activeTab === tab.key && styles.activeLabel]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 10,
    flexDirection: "row",
    paddingHorizontal: 7,
    paddingVertical: 8,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radii.md,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.brandSoft,
  },
  label: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 10,
    marginTop: 4,
  },
  activeLabel: {
    color: colors.brandDark,
  },
});
