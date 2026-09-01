import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet } from "react-native";

export function Screen({ children }: PropsWithChildren) {
  return <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView>;
}

const styles = StyleSheet.create({
  content: { gap: 14 },
});
