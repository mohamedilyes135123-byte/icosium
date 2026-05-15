import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Platform, StatusBar as RNStatusBar, ScrollView,
  Dimensions, Linking, SafeAreaView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';

const PATIENT_URL = 'https://3inaya-patient.vercel.app';
const { width } = Dimensions.get('window');
const STATUSBAR_H = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 44;

// ─── Emoji Icons (Clay-style via emoji) ────────────────────────────────────────
const Icon = ({ emoji, size = 36 }: { emoji: string; size?: number }) => (
  <Text style={{ fontSize: size, lineHeight: size + 8 }}>{emoji}</Text>
);

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync(PATIENT_URL, {
        toolbarColor: '#16a34a',
        controlsColor: '#ffffff',
        showTitle: true,
        enableBarCollapsing: true,
      });
    } catch {
      Linking.openURL(PATIENT_URL);
    } finally {
      setLoading(false);
    }
  };

  const serviceCards = [
    { emoji: '🩺', label: 'استشارة طبية', color: '#dcfce7' },
    { emoji: '📋', label: 'طلباتي', color: '#fef9c3' },
    { emoji: '📅', label: 'مواعيدي', color: '#dcfce7' },
  ];

  const metricCards = [
    { emoji: '❤️', label: 'معدل القلب', value: '78 bpm', bg: '#fff1f2', accent: '#ef4444' },
    { emoji: '😊', label: 'الحالة النفسية', value: 'جيدة', bg: '#fefce8', accent: '#f59e0b' },
  ];

  const navItems = [
    { emoji: '🏠', label: 'الرئيسية' },
    { emoji: '💬', label: 'الرسائل' },
    { emoji: '💓', label: 'الصحة' },
    { emoji: '👤', label: 'ملفي' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Hero Header ─────────────────────────────────────── */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroInner}>
          <View style={styles.heroTop}>
            <View style={styles.bellWrap}>
              <Text style={{ fontSize: 22 }}>🔔</Text>
              <View style={styles.bellDot} />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroGreet}>مرحباً بك 👋</Text>
              <Text style={styles.heroName}>بوابة المريض — عناية</Text>
            </View>
          </View>
        </View>
        {/* Organic wave */}
        <View style={styles.wave} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Alert Banner ─────────────────────────────────── */}
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>لديك موعد طبي غداً الساعة 10:00 ص</Text>
        </View>

        {/* ── Service Cards Row ──────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خدماتي الطبية</Text>
          <View style={styles.serviceRow}>
            {serviceCards.map((c, i) => (
              <TouchableOpacity key={i} style={[styles.serviceCard, { backgroundColor: c.color }]} activeOpacity={0.75}>
                {/* Glossy circle behind icon */}
                <View style={styles.serviceIconCircle}>
                  <Icon emoji={c.emoji} size={34} />
                </View>
                <Text style={styles.serviceLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Metric Cards ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مؤشرات الصحة</Text>
          <View style={styles.metricRow}>
            {metricCards.map((m, i) => (
              <View key={i} style={[styles.metricCard, { backgroundColor: m.bg }]}>
                {/* Glossy inner */}
                <View style={[styles.metricIconWrap, { backgroundColor: m.bg }]}>
                  <Icon emoji={m.emoji} size={38} />
                </View>
                <Text style={[styles.metricValue, { color: m.accent }]}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA Buttons ───────────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.btnPrimary, loading && { opacity: 0.75 }]}
            onPress={openPortal}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? '⏳  جاري الفتح...' : '🚀  دخول البوابة الطبية'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnOutline} activeOpacity={0.75}>
            <Text style={styles.btnOutlineText}>📞  تواصل مع الدعم</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Stats ─────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLbl}>طلبات نشطة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statChip}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLbl}>وصفة تاريخية</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statChip}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLbl}>تحاليل جاهزة</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Bottom Navigation ────────────────────────────── */}
      <View style={styles.navBar}>
        {navItems.map((n, i) => (
          <TouchableOpacity
            key={i}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(i);
              if (i !== 0) openPortal();
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.navIconWrap, activeTab === i && styles.navIconActive]}>
              <Text style={{ fontSize: activeTab === i ? 22 : 20 }}>{n.emoji}</Text>
            </View>
            <Text style={[styles.navLabel, activeTab === i && styles.navLabelActive]}>
              {n.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const GREEN_DARK = '#16a34a';
const GREEN_MID = '#22c55e';
const GREEN_LIGHT = '#4ade80';
const BG = '#f0fdf4';
const WHITE = '#ffffff';
const SHADOW = {
  shadowColor: '#15803d',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4,
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Hero ──────────────────────────────────────────────────
  heroWrapper: {
    backgroundColor: GREEN_DARK,
    paddingTop: STATUSBAR_H,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroInner: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
    background: 'transparent',
  },
  heroTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bellWrap: {
    position: 'relative',
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fbbf24',
    borderWidth: 2,
    borderColor: WHITE,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: 14,
    alignItems: 'flex-end',
  },
  heroGreet: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  heroName: {
    fontSize: 20,
    color: WHITE,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  wave: {
    height: 20,
    backgroundColor: BG,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },

  // ── Scroll ─────────────────────────────────────────────────
  scrollContent: {
    paddingTop: 4,
    paddingHorizontal: 20,
  },

  // ── Alert ──────────────────────────────────────────────────
  alertBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    ...SHADOW,
    shadowColor: '#ca8a04',
    shadowOpacity: 0.08,
  },
  alertIcon: { fontSize: 20, marginLeft: 10 },
  alertText: { fontSize: 13, color: '#92400e', fontWeight: '600', textAlign: 'right', flex: 1 },

  // ── Section ────────────────────────────────────────────────
  section: { marginBottom: 22 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#14532d',
    textAlign: 'right',
    marginBottom: 12,
  },

  // ── Service Cards ──────────────────────────────────────────
  serviceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    ...SHADOW,
    shadowOpacity: 0.08,
  },
  serviceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...SHADOW,
    shadowOpacity: 0.1,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'center',
  },

  // ── Metric Cards ───────────────────────────────────────────
  metricRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 20,
    alignItems: 'center',
    ...SHADOW,
    shadowOpacity: 0.08,
  },
  metricIconWrap: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...SHADOW,
    shadowOpacity: 0.12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },

  // ── Buttons ────────────────────────────────────────────────
  btnPrimary: {
    backgroundColor: GREEN_DARK,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW,
    shadowOpacity: 0.35,
  },
  btnPrimaryText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
  },
  btnOutline: {
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: GREEN_DARK,
    backgroundColor: 'rgba(22,163,74,0.05)',
  },
  btnOutlineText: {
    color: GREEN_DARK,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Stats ──────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row-reverse',
    backgroundColor: WHITE,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...SHADOW,
    shadowOpacity: 0.07,
  },
  statChip: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 22, fontWeight: '900', color: GREEN_DARK },
  statLbl: { fontSize: 10, color: '#9ca3af', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: '#e5e7eb' },

  // ── Bottom Nav ─────────────────────────────────────────────
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    flexDirection: 'row-reverse',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...SHADOW,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIconWrap: {
    width: 46,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconActive: {
    backgroundColor: '#dcfce7',
  },
  navLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '600',
    marginTop: 2,
  },
  navLabelActive: {
    color: GREEN_DARK,
    fontWeight: '800',
  },
});
