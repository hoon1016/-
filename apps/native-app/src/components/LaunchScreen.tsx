import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { colors } from "../theme/tokens";

const logo = require("../../assets/studybet-icon.png");

export function LaunchScreen() {
  const entrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      tension: 54,
      friction: 9,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.65, duration: 520, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [entrance, pulse]);

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <Animated.View style={[styles.center, {
        opacity: entrance,
        transform: [
          { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
        ],
      }]}>
        <View style={styles.logoShell}><Image source={logo} style={styles.logo} resizeMode="contain" /></View>
        <Text style={styles.wordmark}>STUDYBET</Text>
        <Text style={styles.tagline}>함께 지키는 오늘의 공부 약속</Text>
      </Animated.View>
      <View style={styles.loadingWrap}>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, { opacity: pulse }]} />
          <Animated.View style={[styles.dot, styles.dotSoft, { opacity: pulse.interpolate({ inputRange: [0.65, 1], outputRange: [1, 0.65] }) }]} />
          <Animated.View style={[styles.dot, styles.dotFaint, { opacity: pulse }]} />
        </View>
        <Text style={styles.loadingText}>오늘의 스터디를 준비하고 있어요</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glowTop: { position: "absolute", width: 330, height: 330, borderRadius: 165, right: -145, top: -120, backgroundColor: "rgba(255,107,74,0.12)" },
  glowBottom: { position: "absolute", width: 380, height: 380, borderRadius: 190, left: -220, bottom: -170, backgroundColor: "rgba(89,162,137,0.13)" },
  center: { alignItems: "center", marginBottom: 48 },
  logoShell: { width: 136, height: 136, borderRadius: 42, backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)", alignItems: "center", justifyContent: "center" },
  logo: { width: 122, height: 122 },
  wordmark: { marginTop: 24, color: "#FFFFFF", fontSize: 27, fontWeight: "900", letterSpacing: 3.1 },
  tagline: { marginTop: 10, color: "#B8D0C9", fontSize: 13, fontWeight: "600" },
  loadingWrap: { position: "absolute", bottom: 64, alignItems: "center" },
  loadingDots: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand },
  dotSoft: { backgroundColor: "#F6B5A4" },
  dotFaint: { backgroundColor: "#7FA99D" },
  loadingText: { marginTop: 13, color: "#8EB1A7", fontSize: 11, fontWeight: "700" },
});
