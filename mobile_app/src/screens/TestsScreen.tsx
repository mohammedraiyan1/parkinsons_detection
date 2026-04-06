import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const TEST_MODULES = [
  { id: 'tremor', name: 'Tremor Test', description: 'Hold phone still for 30s' },
  { id: 'tap', name: 'Finger Tap', description: 'Alternate tapping for 20s' },
  { id: 'spiral', name: 'Spiral Drawing', description: 'Trace spiral pattern' },
  { id: 'voice', name: 'Voice Test', description: 'Sustain "ahhh" for 5s' },
  { id: 'gait', name: 'Gait Test', description: 'Walk 10 steps' },
  { id: 'reaction', name: 'Reaction Time', description: 'Tap when color changes' },
  { id: 'handwriting', name: 'Handwriting', description: 'Write a short sentence' },
  { id: 'balance', name: 'Balance Test', description: 'Stand still for 30s' },
];

export default function TestsScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assesment Modules</Text>
      <Text style={styles.subtitle}>Complete all modules for an accurate score</Text>
      
      <View style={styles.grid}>
        {TEST_MODULES.map((module) => (
          <TouchableOpacity 
            key={module.id} 
            style={styles.card}
            onPress={() => {
              // Real implementation navigates here
            }}
          >
            <View style={styles.iconPlaceholder} />
            <Text style={styles.cardTitle}>{module.name}</Text>
            <Text style={styles.cardDesc}>{module.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>Submit Assessment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1A1F3C', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  iconPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8EAF6', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 5 },
  cardDesc: { fontSize: 12, color: '#888' },
  submitBtn: { backgroundColor: '#F5A623', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 30 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
