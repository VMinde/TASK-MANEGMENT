import { View, Modal, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { addTask, getTasks, deleteTask, updateTask } from './firebase-db.js';
import CameraModal from './CameraModal.js';
import ImageViewer from './ImageViewer.js';
import LoginScreen from './LoginScreen.js';
import Header from './components/Header.jsx';
import InputForm from './components/InputForm.jsx';
import TaskList from './components/TaskList.jsx';
import { formatDate, isDeadlineExpired } from './utils/dateUtils.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        loadTasks(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks(user.uid);
    }
  }, [user]);

  const setupDatabase = async () => {
    try {
      await loadTasks(user?.uid);
      setIsLoading(false);
    } catch (error) {
      console.error('Firebase klaida:', error);
    }
  };

  const loadTasks = async (userId) => {
    try {
      const data = await getTasks(userId);
      setTasks(data);
    } catch (error) {
      console.error('Klaida įkeliant užduotis:', error);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim()) {
      alert('Prašau įvesti užduoties pavadinimą');
      return;
    }
    
    try {
      console.log('📝 Pridedama užduotis:', { taskTitle, deadline, userId: user?.uid });
      await addTask(taskTitle, deadline || null, photoUri || null, user?.uid);
      setTaskTitle('');
      setDeadline('');
      setPhotoUri(null);
      alert('✅ Užduotis pridėta sėkmingai!');
      await loadTasks(user?.uid);
    } catch (error) {
      console.error('❌ Klaida pridedant užduotį:', error);
      alert('Klaida: ' + error.message);
    }
  };

  const handlePhotoCapture = (base64Data) => {
    setPhotoUri(base64Data);
    setShowCamera(false);
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks(user?.uid);
    } catch (error) {
      console.error('Klaida trinant užduotį:', error);
    }
  };

  const handleToggleTask = async (id, completed) => {
    try {
      await updateTask(id, !completed);
      await loadTasks(user?.uid);
    } catch (error) {
      console.error('Klaida atnaujinant užduotį:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Klaida atsijungiant:', error);
    }
  };




  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Kraunama...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', paddingTop: 20, paddingHorizontal: 20 }}>
      <Header onLogout={handleLogout} />
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center' }}>Užduočių Sąrašas 📋</Text>
      <InputForm
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        deadline={deadline}
        setDeadline={setDeadline}
        onCamera={() => setShowCamera(true)}
        onAddTask={handleAddTask}
      />
      <Modal visible={showCamera} animationType="full">
        <CameraModal
          onPhotoCaptured={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      </Modal>
      <ImageViewer
        visible={selectedImageUri !== null}
        imageUri={selectedImageUri}
        onClose={() => setSelectedImageUri(null)}
      />
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 15, fontWeight: '600' }}>Užduočių: {tasks.length}</Text>
      <TaskList
        tasks={tasks}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
        onImagePress={setSelectedImageUri}
      />
      <StatusBar style="auto" />
    </View>
  );
}


