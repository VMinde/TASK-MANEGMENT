import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Klaida', 'Prašau įvesti el. paštą ir slaptažodį');
      return;
    }

    if (isSignUp && (!firstName || !nickname)) {
      Alert.alert('Klaida', 'Prašau įvesti vardą ir nicką');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Registracija
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Saugoti profilio duomenis
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          firstName: firstName,
          nickname: nickname,
          email: email,
          created_at: new Date(),
        });
        
        Alert.alert('Sėkmė', 'Paskyra sukurta!');
        setFirstName('');
        setNickname('');
      } else {
        // Prisijungimas
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Klaida', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PROJEKTAS</Text>
        <Text style={styles.subtitle}>Užduočių valdymo sistema</Text>
      </View>

      <ScrollView style={styles.form} scrollEnabled={isSignUp}>
        <Text style={styles.formTitle}>{isSignUp ? 'Registracija' : 'Prisijungimas'}</Text>

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Vardas"
              value={firstName}
              onChangeText={setFirstName}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Slapyvardis"
              value={nickname}
              onChangeText={setNickname}
              editable={!loading}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="El. paštas"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Slaptažodis"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '⏳ Kraunama...' : isSignUp ? '📝 Užsiregistruoti' : '🔓 Prisijungti'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Jau turite paskyrą? Prisijunkite' : 'Neturite paskyros? Užsiregistruokite'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    backgroundColor: '#667eea',
    padding: 30,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
  },
  form: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
});
