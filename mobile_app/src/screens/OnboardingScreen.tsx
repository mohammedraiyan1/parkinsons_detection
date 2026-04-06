import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Welcome to NeuroCheck', desc: 'A comprehensive suite for tracking symptoms and progression.' },
  { id: '2', title: 'Interactive Modules', desc: 'Leverage your device sensors for accurate physical measurements.' },
  { id: '3', title: 'Privacy First', desc: 'Secure, encrypted, and designed to protect your medical data.' },
];

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <View style={styles.placeholderImage} />
        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.desc}>{SLIDES[currentIndex].desc}</Text>
      </View>
      
      <View style={styles.pagination}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
        ))}
      </View>
      
      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>{currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', alignItems: 'center', padding: 20, justifyContent: 'center' },
  slide: { width: width - 40, alignItems: 'center' },
  placeholderImage: { width: 250, height: 250, backgroundColor: '#E8EAF6', borderRadius: 125, marginBottom: 40, elevation: 2 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', textAlign: 'center', marginBottom: 15 },
  desc: { fontSize: 16, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
  pagination: { flexDirection: 'row', marginTop: 40, marginBottom: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc', marginHorizontal: 5 },
  activeDot: { backgroundColor: '#F5A623', width: 20 },
  nextBtn: { backgroundColor: '#1A1F3C', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, width: '100%', alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
