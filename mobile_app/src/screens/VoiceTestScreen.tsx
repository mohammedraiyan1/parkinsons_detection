import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

export default function VoiceTestScreen({ navigation }: any) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      setTimeLeft(5);

      let timer = 5;
      const interval = setInterval(async () => {
        timer -= 1;
        setTimeLeft(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setIsRecording(false);
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          setAudioUri(uri);
        }
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function playSound() {
    if (audioUri) {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      await sound.playAsync();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Test</Text>
      <Text style={styles.instructions}>
        Take a deep breath and sustain the vowel "ahhhh" steadily for 5 seconds.
      </Text>
      
      <View style={styles.waveformPlaceholder}>
        <Text style={styles.timerText}>{timeLeft}s</Text>
      </View>

      {!isRecording && !audioUri && (
        <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
          <Text style={styles.btnText}>Start Recording</Text>
        </TouchableOpacity>
      )}

      {audioUri && (
        <View style={styles.resultContainer}>
          <TouchableOpacity style={styles.playBtn} onPress={playSound}>
            <Text style={styles.btnText}>Play Recording</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Save & Return</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 10 },
  instructions: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 40 },
  waveformPlaceholder: { width: '100%', height: 150, backgroundColor: '#E8EAF6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#F5A623' },
  recordBtn: { backgroundColor: '#E74C3C', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 25 },
  playBtn: { backgroundColor: '#3498DB', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25, marginBottom: 15 },
  submitBtn: { backgroundColor: '#2ECC71', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 25 },
  resultContainer: { alignItems: 'center', width: '100%' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
