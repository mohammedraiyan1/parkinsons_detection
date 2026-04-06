import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item}><Text style={styles.itemText}>Personal Information</Text></TouchableOpacity>
        <TouchableOpacity style={styles.item}><Text style={styles.itemText}>Clinician Access</Text></TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.item}><Text style={styles.itemText}>Notifications</Text></TouchableOpacity>
        <TouchableOpacity style={styles.item}><Text style={styles.itemText}>Privacy Policy</Text></TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },
  header: { backgroundColor: '#1A1F3C', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F5A623', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: '#A0AABF', marginTop: 5 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1F3C', marginBottom: 10 },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  itemText: { fontSize: 16, color: '#333' },
  logoutBtn: { marginHorizontal: 20, marginTop: 20, padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E74C3C' },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: 'bold' }
});
