import { View, Modal, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { addTask, getTasks, deleteTask, updateTask, getAllUsers, assignTaskToUser } from './firebase-db.js';
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
  const [filter, setFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [priority, setPriority] = useState('Medium');
  

  const ADMIN_EMAILS = ['admin@admin.com'];

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email) : false);
      setIsLoading(false);
      if (currentUser) {
        loadTasks(currentUser.uid, ADMIN_EMAILS.includes(currentUser.email));
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks(user.uid, isAdmin);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  

  const setupDatabase = async () => {
    try {
      await loadTasks(user?.uid, isAdmin);
      setIsLoading(false);
    } catch (error) {
      console.error('Firebase klaida:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
      if (!selectedAssigneeId && data.length > 0) {
        setSelectedAssigneeId(data[0].uid);
      }
    } catch (error) {
      console.error('Klaida gaunant vartotojus:', error);
    }
  };

  

  const loadTasks = async (userId, adminMode = false) => {
    try {
      const data = await getTasks(adminMode ? null : userId);
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
      const targetUserId = isAdmin ? selectedAssigneeId || user?.uid : user?.uid;
      await addTask(taskTitle, deadline || null, photoUri || null, targetUserId, priority);
      setTaskTitle('');
      setDeadline('');
      setPhotoUri(null);
      setPriority('Medium');
      alert('✅ Užduotis pridėta sėkmingai!');
      await loadTasks(user?.uid, isAdmin);
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
      await loadTasks(user?.uid, isAdmin);
    } catch (error) {
      console.error('Klaida trinant užduotį:', error);
    }
  };

  const handleToggleTask = async (id, completed) => {
    try {
      await updateTask(id, !completed);
      await loadTasks(user?.uid, isAdmin);
    } catch (error) {
      console.error('Klaida atnaujinant užduotį:', error);
    }
  };

  const handleAssignTask = async (id) => {
    if (!isAdmin) return;
    if (!selectedAssigneeId) {
      alert('Pasirinkite kam priskirti (apačioje esantys naudotojų žetonai).');
      return;
    }
    try {
      await assignTaskToUser(id, selectedAssigneeId);
      await loadTasks(user?.uid, isAdmin);
    } catch (error) {
      console.error('Klaida priskiriant užduotį:', error);
      alert('Klaida priskiriant: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Klaida atsijungiant:', error);
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const overdueCount = tasks.filter(
    (task) => !task.completed && task.deadline && isDeadlineExpired(task.deadline)
  ).length;
  const userLookup = users.reduce((acc, u) => {
    acc[u.uid] = u;
    return acc;
  }, {});

  const tasksByUser = tasks.reduce((acc, t) => {
    const key = t.userId || 'nenurodyta';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    if (filter === 'overdue') return !task.completed && task.deadline && isDeadlineExpired(task.deadline);
    return true;
  });




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
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
        <Header onLogout={handleLogout} />
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={true}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 25, textAlign: 'center' }}>Užduočių Sąrašas 📋</Text>
      {isAdmin && (
        <View style={{ backgroundColor: '#e8ecff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#d6dbff' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#2b2f55', marginBottom: 8 }}>Admin zona</Text>
          <Text style={{ fontSize: 13, color: '#4a4f6a', marginBottom: 8 }}>Paskirkite darbuotojui užduotį</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {users.map((u, index) => {
              const isActive = selectedAssigneeId === u.uid;
              return (
                <TouchableOpacity
                  key={u.uid || index}
                  onPress={() => setSelectedAssigneeId(u.uid)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: isActive ? '#4f46e5' : '#cbd5f5',
                    backgroundColor: isActive ? '#ffffff' : '#eef1ff',
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1f2937' }}>{u.nickname || u.firstName || 'Vartotojas'}</Text>
                  <Text style={{ fontSize: 11, color: '#4b5563' }}>{u.email}</Text>
                  <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Užduočių: {tasksByUser[u.uid] || 0}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={{ fontSize: 12, color: '#374151' }}>Priskiriama kam: {selectedAssigneeId ? (userLookup[selectedAssigneeId]?.nickname || userLookup[selectedAssigneeId]?.email) : 'nepasirinkta'}</Text>
        </View>
      )}
      <InputForm
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        deadline={deadline}
        setDeadline={setDeadline}
        priority={priority}
        setPriority={setPriority}
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
      <View style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#eef0f3' }}>
        <Text style={{ fontSize: 14, color: '#333', fontWeight: '700', marginBottom: 6 }}>Greita santrauka</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 13, color: '#555' }}>Viso: {tasks.length}</Text>
          <Text style={{ fontSize: 13, color: '#2e7d32' }}>Baigta: {completedCount}</Text>
          <Text style={{ fontSize: 13, color: overdueCount ? '#c62828' : '#555' }}>Vėluoja: {overdueCount}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {[{ key: 'all', label: 'Visos' }, { key: 'active', label: 'Aktyvios' }, { key: 'completed', label: 'Baigtos' }, { key: 'overdue', label: 'Vėluojančios' }].map((option, index) => {
          const isActive = filter === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => setFilter(option.key)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isActive ? '#667eea' : '#d5d7de',
                backgroundColor: isActive ? '#eef0ff' : '#fff',
                marginRight: index !== 3 ? 8 : 0,
              }}
            >
              <Text style={{ color: isActive ? '#364fc7' : '#555', fontWeight: '600', fontSize: 13 }}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TaskList
        tasks={filteredTasks}
        onToggle={handleToggleTask}
        onDelete={handleDeleteTask}
        onImagePress={setSelectedImageUri}
        isAdmin={isAdmin}
        onAssign={handleAssignTask}
        selectedAssigneeId={selectedAssigneeId}
        userLookup={userLookup}
      />
        <View style={{ height: 20 }} />
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <StatusBar style="auto" />
      </View>
    </View>
  );
}


