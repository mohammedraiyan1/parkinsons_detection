import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function HistoryScreen() {
  const dummyData = Array.from({ length: 15 }).map((_, i) => ({
    id: i.toString(),
    date: `2026-10-${(15 - i).toString().padStart(2, '0')}`,
    score: Math.floor(Math.random() * 100),
    level: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Moderate' : 'Low'
  }));

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.scoreText}>Score: {item.score}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: item.level === 'High' ? '#FFEBEE' : item.level === 'Moderate' ? '#FFF3E0' : '#E8F5E9' }]}>
        <Text style={[styles.badgeText, { color: item.level === 'High' ? '#E74C3C' : item.level === 'Moderate' ? '#F5A623' : '#2ECC71' }]}>
          {item.level}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessment History</Text>
      <FlatList 
        data={dummyData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  date: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  scoreText: { fontSize: 14, color: '#666', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' }
});
