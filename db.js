import * as SQLite from 'expo-sqlite';

let db;

export async function openDatabase() {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('app.db');
  return db;
}

export async function initializeDatabase() {
  const database = await openDatabase();
  
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function addTask(title) {
  const database = await openDatabase();
  const result = await database.runAsync(
    'INSERT INTO tasks (title, completed) VALUES (?, ?)',
    [title, 0]
  );
  return result;
}

export async function getTasks() {
  const database = await openDatabase();
  const result = await database.getAllAsync('SELECT * FROM tasks ORDER BY created_at DESC');
  console.log('📊 Duomenys iš duomenų bazės:', result);
  return result;
}

export async function updateTask(id, completed) {
  const database = await openDatabase();
  await database.runAsync(
    'UPDATE tasks SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, id]
  );
}

export async function deleteTask(id) {
  const database = await openDatabase();
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function clearAllTasks() {
  const database = await openDatabase();
  await database.runAsync('DELETE FROM tasks');
}
