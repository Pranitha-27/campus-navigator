import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use this instead of SafeAreaView on every screen
// It fixes the web scroll issue while keeping mobile safe areas
export default function Screen({ children, style, scrollable = false }) {
  const Wrapper = Platform.OS === 'web' ? View : SafeAreaView;

  if (scrollable) {
    return (
      <Wrapper style={[styles.wrapper, style]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {children}
        </ScrollView>
      </Wrapper>
    );
  }

  return (
    <Wrapper style={[styles.wrapper, style]}>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});