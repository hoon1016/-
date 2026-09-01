import { PropsWithChildren } from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/tokens";

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: { color: colors.brandDark, fontSize: 12, fontWeight: "800" },
});
