import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function SpiralTestScreen({ navigation }: any) {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX},${locationY}`);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
      },
      onPanResponderRelease: () => {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath('');
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spiral Drawing</Text>
      <Text style={styles.instructions}>Trace the spiral as accurately as possible.</Text>
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {/* Guide spiral placeholder */}
          <Path
            d="M 150 150 m 0 -10 a 10 10 0 1 1 0 20 a 20 20 0 1 0 0 -40 a 30 30 0 1 1 0 60 a 40 40 0 1 0 0 -80 a 50 50 0 1 1 0 100 a 60 60 0 1 0 0 -120 a 70 70 0 1 1 0 140"
            stroke="#E0E0E0"
            strokeWidth="20"
            fill="none"
          />
          {paths.map((p, i) => (
            <Path key={i} d={p} stroke="#1A1F3C" strokeWidth="5" fill="none" strokeLinecap="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} stroke="#1A1F3C" strokeWidth="5" fill="none" strokeLinecap="round" />
          ) : null}
        </Svg>
      </View>
      
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setPaths([])}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.submitText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginTop: 20 },
  instructions: { fontSize: 16, color: '#666', marginVertical: 10 },
  canvasContainer: { flex: 1, backgroundColor: '#fff', borderRadius: 20, marginVertical: 20, overflow: 'hidden', elevation: 3 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  clearBtn: { backgroundColor: '#E74C3C', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  submitBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  clearText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
