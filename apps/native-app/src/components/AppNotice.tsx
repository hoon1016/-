import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "../theme/tokens";

export function AppNotice({
  tone = "info",
  title,
  body,
}: {
  tone?: "info" | "warn";
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.wrap, tone === "warn" && styles.warnWrap]}>
      <Text style={[styles.title, tone === "warn" && styles.warnTitle]}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: "#FFF8F1",
    borderWidth: 1,
    borderColor: colors.line,
  },
  warnWrap: {
    backgroundColor: "#FFF5EE",
  },
  title: {
    color: colors.navy,
    fontSize: 13,
    fontWeight: "800",
  },
  warnTitle: {
    color: colors.warn,
  },
  body: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
