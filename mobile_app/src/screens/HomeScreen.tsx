import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function HomeScreen({ navigation }: any) {
  const riskScore = 42; 
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, User</Text>
        <Text style={styles.subtitle}>Your latest assessment overview</Text>
      </View>
      
      <View style={styles.gaugeContainer}>
        <Svg height="200" width="200" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke="#E0E0E0" strokeWidth="10" fill="transparent" />
          <Circle 
            cx="50" cy="50" r="45" 
            stroke="#F5A623" 
            strokeWidth="10" 
            fill="transparent" 
            strokeDasharray={`${riskScore * 2.82} 282`} 
            strokeLinecap="round" 
            transform="rotate(-90 50 50)"
          />
        </Svg>
        <View style={styles.scoreTextContainer}>
          <Text style={styles.scoreText}>{riskScore}</Text>
          <Text style={styles.scoreLabel}>Risk Score</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => navigation.navigate('Tests')}
      >
        <Text style={styles.ctaText}>Take Assessment</Text>
      </TouchableOpacity>
      
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Sessions</Text>
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.historyCard}>
            <Text style={styles.historyDate}>Oct {15 - i}, 2026</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Moderate</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },
  header: { padding: 20, backgroundColor: '#1A1F3C', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 16, color: '#A0AABF', marginTop: 5 },
  gaugeContainer: { alignItems: 'center', marginTop: 30, position: 'relative' },
  scoreTextContainer: { position: 'absolute', top: 75, alignItems: 'center' },
  scoreText: { fontSize: 36, fontWeight: 'bold', color: '#1A1F3C' },
  scoreLabel: { fontSize: 12, color: '#666' },
  ctaButton: { backgroundColor: '#F5A623', marginHorizontal: 20, marginTop: 30, padding: 18, borderRadius: 12, alignItems: 'center', elevation: 3 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  historySection: { padding: 20, marginTop: 10 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 15 },
  historyCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  historyDate: { fontSize: 16, color: '#333', fontWeight: '500' },
  badge: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { color: '#F5A623', fontSize: 12, fontWeight: 'bold' }
});
