import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function HandwritingTestScreen({ navigation }: any) {
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
      <Text style={styles.title}>Handwriting Test</Text>
      <Text style={styles.instructions}>Write the sentences: "The quick brown fox jumps over the lazy dog."</Text>
      
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {/* Guide lines */}
          {[100, 200, 300, 400].map(y => (
             <Path key={y} d={`M 0 ${y} L 500 ${y}`} stroke="#E8EAF6" strokeWidth="2" />
          ))}

          {paths.map((p, i) => (
            <Path key={i} d={p} stroke="#1A1F3C" strokeWidth="4" fill="none" strokeLinecap="round" />
          ))}
          {currentPath ? (
            <Path d={currentPath} stroke="#1A1F3C" strokeWidth="4" fill="none" strokeLinecap="round" />
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
