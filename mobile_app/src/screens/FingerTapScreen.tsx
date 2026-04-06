import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function FingerTapScreen({ navigation }: any) {
  const [taps, setTaps] = useState<any[]>([]);
  const [isTestActive, setIsTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0) {
      setIsTestActive(false);
    }
  }, [isTestActive, timeLeft]);

  const handleTap = (side: 'left' | 'right') => {
    if (!isTestActive) setIsTestActive(true);
    setTaps([...taps, { side, timestamp: Date.now() }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finger Tap Test</Text>
      <Text style={styles.instructions}>
        Alternate tapping the large buttons with your index and middle fingers as fast as possible.
      </Text>
      
      <Text style={styles.timerText}>{timeLeft}s Remaining</Text>
      
      {timeLeft > 0 ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.tapButtonLeft} onPress={() => handleTap('left')}>
             <Text style={styles.tapText}>LEFT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tapButtonRight} onPress={() => handleTap('right')}>
             <Text style={styles.tapText}>RIGHT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.submitText}>Save & Return</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginTop: 40 },
  instructions: { fontSize: 16, textAlign: 'center', color: '#666', marginVertical: 20 },
  timerText: { fontSize: 24, fontWeight: 'bold', color: '#F5A623', marginBottom: 40 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  tapButtonLeft: { flex: 1, height: 200, backgroundColor: '#3498DB', borderRadius: 20, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  tapButtonRight: { flex: 1, height: 200, backgroundColor: '#E74C3C', borderRadius: 20, marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
  tapText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, marginTop: 50 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
