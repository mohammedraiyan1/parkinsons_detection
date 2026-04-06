import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ReactionTimeScreen({ navigation }: any) {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'done'>('waiting');
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [trialsCount, setTrialsCount] = useState(0);

  const startTrial = () => {
    setGameState('ready');
    const delay = Math.random() * 2500 + 1500; // 1.5s - 4.0s
    setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTap = () => {
    if (gameState === 'waiting') {
      startTrial();
    } else if (gameState === 'ready') {
      alert("Too early! Wait for the color change.");
      setGameState('waiting');
    } else if (gameState === 'go') {
      const time = Date.now() - startTime;
      const newTimes = [...reactionTimes, time];
      setReactionTimes(newTimes);
      setTrialsCount(prev => prev + 1);
      
      if (newTimes.length >= 5) {
        setGameState('done');
      } else {
        setGameState('waiting');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reaction Time</Text>
      <Text style={styles.instructions}>
        Tap the large box as fast as possible when it turns GREEN. (Trial {trialsCount}/5)
      </Text>

      <TouchableOpacity 
        style={[
          styles.targetBox, 
          { backgroundColor: gameState === 'go' ? '#2ECC71' : gameState === 'ready' ? '#E74C3C' : '#3498DB' }
        ]} 
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <Text style={styles.boxText}>
          {gameState === 'waiting' ? 'Tap to Start Trial' : gameState === 'ready' ? 'Wait...' : gameState === 'go' ? 'TAP NOW!' : 'Testing Complete'}
        </Text>
      </TouchableOpacity>

      {gameState === 'done' && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultAvg}>Avg: {(reactionTimes.reduce((a, b) => a + b, 0) / 5).toFixed(0)} ms</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.submitText}>Save & Return</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginTop: 40 },
  instructions: { fontSize: 16, textAlign: 'center', color: '#666', marginVertical: 20 },
  targetBox: { width: '100%', height: 350, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  boxText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  resultsContainer: { alignItems: 'center', marginTop: 30 },
  resultAvg: { fontSize: 24, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 20 },
  submitBtn: { backgroundColor: '#1A1F3C', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
