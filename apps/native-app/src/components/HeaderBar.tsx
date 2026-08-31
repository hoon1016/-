import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/tokens";

export function HeaderBar({
  title,
  subtitle,
  status,
  camera,
}: {
  title: string;
  subtitle: string;
  status: string;
  camera: string;
}) {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.kicker}>StudyBet Native</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.badges}>
        <View style={styles.badgePrimary}>
          <Text style={styles.badgePrimaryText}>{status}</Text>
        </View>
        <View style={styles.badgeSecondary}>
          <Text style={styles.badgeSecondaryText}>{camera}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  kicker: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  badgePrimary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.navy,
  },
  badgeSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.line,
  },
  badgePrimaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeSecondaryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
