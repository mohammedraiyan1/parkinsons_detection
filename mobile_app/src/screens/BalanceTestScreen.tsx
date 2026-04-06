import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Gyroscope } from 'expo-sensors';

export default function BalanceTestScreen({ navigation }: any) {
  const [data, setData] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let subscription: any;
    if (isRecording) {
      Gyroscope.setUpdateInterval(20); // 50Hz
      subscription = Gyroscope.addListener(gyroData => {
        setData(current => [...current, {
          x: gyroData.x,
          y: gyroData.y,
          z: gyroData.z,
          timestamp: Date.now()
        }]);
      });
      
      const interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            subscription?.remove();
            setIsRecording(false);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => subscription?.remove();
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance Test</Text>
      <Text style={styles.instructions}>
        Place the phone in your pocket, stand up straight, close your eyes, and remain as still as possible for 30 seconds.
      </Text>
      
      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>
      
      {!isRecording && timeLeft > 0 && (
        <TouchableOpacity style={styles.startBtn} onPress={() => setIsRecording(true)}>
          <Text style={styles.startText}>Start Test</Text>
        </TouchableOpacity>
      )}
      
      {timeLeft === 0 && (
        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.startText}>Save & Return</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 10 },
  instructions: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
  timerCircle: { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: '#F5A623', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  timerText: { fontSize: 36, fontWeight: 'bold', color: '#1A1F3C' },
  startBtn: { backgroundColor: '#1A1F3C', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
  submitBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
  startText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
