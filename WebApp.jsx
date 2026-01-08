// Web versija - React
import React, { useState, useEffect } from 'react';
import './web-styles.css';
import { addTask, getTasks, deleteTask, updateTask } from './firebase-db';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

function WebApp() {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [nickname, setNickname] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  // Sekti autentifikacijos būseną
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setupDatabase();
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Įkelti užduotis jei prisijungę
  useEffect(() => {
    if (user) {
      loadTasks();
      // Real-time sync - atsinaujina kas 2 sekundes
      const interval = setInterval(loadTasks, 2000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Prašau įvesti el. paštą ir slaptažodį');
      return;
    }

    if (isSignUp && (!firstName || !nickname)) {
      alert('Prašau įvesti vardą ir nicką');
      return;
    }

    setAuthLoading(true);
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
        
        alert('Sėkmė! Paskyra sukurta!');
        setFirstName('');
        setNickname('');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      } else {
        // Prisijungimas
        await signInWithEmailAndPassword(auth, email, password);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      alert('Klaida: ' + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTasks([]);
    } catch (error) {
      console.error('Klaida išsiregistravus:', error);
    }
  };

  const setupDatabase = async () => {
    try {
      await loadTasks();
      setIsLoading(false);
    } catch (error) {
      console.error('Firebase klaida:', error);
    }
  };

  const loadTasks = async () => {
    try {
      if (user) {
        const data = await getTasks(user.uid);
        setTasks(data);
      }
    } catch (error) {
      console.error('Klaida įkeliant užduotis:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (taskTitle.trim() && user) {
      try {
        await addTask(taskTitle, taskDeadline, null, user.uid);
        setTaskTitle('');
        setTaskDeadline('');
        await loadTasks();
      } catch (error) {
        console.error('Klaida:', error);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Klaida:', error);
    }
  };

  const handleToggleTask = async (id, completed) => {
    try {
      await updateTask(id, !completed);
      await loadTasks();
    } catch (error) {
      console.error('Klaida:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Kraunama Firebase...</div>;
  }

  // Jei neprisijungę - rodyt login formą
  if (!user) {
    return (
      <div className="container login-container">
        <div className="login-box">
          <h1>📋 PROJEKTAS</h1>
          <p className="subtitle">Užduočių valdymo sistema - Web versija</p>
          
          <div className="form">
            <h3>{isSignUp ? 'Registracija' : 'Prisijungimas'}</h3>

            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="Vardas"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Slapyvardis"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input"
                />
              </>
            )}

            <input
              type="email"
              placeholder="El. paštas"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />

            <input
              type="password"
              placeholder="Slaptažodis"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />

            <button onClick={handleAuth} disabled={authLoading} className="add-btn">
              {authLoading ? '⏳ Kraunama...' : isSignUp ? '📝 Užsiregistruoti' : '🔓 Prisijungti'}
            </button>

            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="toggle-btn"
            >
              {isSignUp ? 'Jau turite paskyrą? Prisijunkite' : 'Neturite paskyros? Užsiregistruokite'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📋 Užduočių Sąrašas - Web</h1>
        <div className="user-info">
          <span>👤 {user.email}</span>
          <button onClick={handleLogout} className="logout-btn">🚪 Atsijungti</button>
        </div>
      </div>
      <p className="subtitle">☁️ Firebase Cloud Sync</p>

      <form onSubmit={handleAddTask} className="form">
        <input
          type="text"
          placeholder="Įveskite naują užduotį..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="input"
        />
        <input
          type="date"
          value={taskDeadline}
          onChange={(e) => setTaskDeadline(e.target.value)}
          className="input"
        />
        <button type="submit" className="add-btn">➕ Pridėti</button>
      </form>

      <p className="task-count">Užduočių: {tasks.length}</p>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty">Nėra užduočių. Pridėkite naują! 🎯</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id, task.completed)}
                className="checkbox"
              />
              <div className="task-content">
                <span className="task-text">{task.title}</span>
                {task.deadline && <span className="task-deadline">📅 {task.deadline}</span>}
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteTask(task.id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WebApp;
