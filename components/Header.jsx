import { View, Text, TouchableOpacity } from 'react-native';

export default function Header({ onLogout }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.projectName}>TASK MANAGER</Text>
        <Text style={styles.projectDesc}>Užduočių valdymo sistema</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>🚪 Atsijungti</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  projectName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  projectDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
};
