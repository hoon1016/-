import { PropsWithChildren } from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/tokens";

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: { color: colors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 0.4 },
});
