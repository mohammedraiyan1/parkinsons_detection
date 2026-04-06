import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { RadarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ResultsScreen({ navigation }: any) {
  const compositeScore = 42;
  const riskLevel = 'Moderate';
  
  const data = {
    labels: ['Tremor', 'Tap', 'Spiral', 'Voice', 'Gait', 'Reaction', 'Writing', 'Balance'],
    datasets: [{
      data: [30, 45, 60, 25, 40, 50, 65, 35]
    }]
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(26, 31, 60, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assessment Results</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreNumber}>{compositeScore}/100</Text>
        <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.badgeText, { color: '#F5A623' }]}>{riskLevel} Risk</Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        *Disclaimer: This is not a medical diagnosis. Please consult a neurologist or healthcare professional.*
      </Text>

      <View style={styles.chartContainer}>
        <RadarChart
          data={data}
          width={screenWidth - 40}
          height={300}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <TouchableOpacity style={styles.btnSecondary}>
        <Text style={styles.btnTextSecondary}>Share with Doctor (PDF)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.btnTextPrimary}>Return to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginTop: 20, textAlign: 'center' },
  scoreContainer: { alignItems: 'center', marginVertical: 30 },
  scoreNumber: { fontSize: 48, fontWeight: 'bold', color: '#1A1F3C' },
  badge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 10 },
  badgeText: { fontSize: 18, fontWeight: 'bold' },
  disclaimer: { fontSize: 12, color: '#E74C3C', textAlign: 'center', marginBottom: 30, fontStyle: 'italic' },
  chartContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, alignItems: 'center', elevation: 3, marginBottom: 30 },
  chart: { marginVertical: 8, borderRadius: 16 },
  btnPrimary: { backgroundColor: '#1A1F3C', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
  btnSecondary: { backgroundColor: '#transparent', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: '#1A1F3C', marginBottom: 15 },
  btnTextPrimary: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  btnTextSecondary: { color: '#1A1F3C', fontSize: 18, fontWeight: 'bold' }
});
