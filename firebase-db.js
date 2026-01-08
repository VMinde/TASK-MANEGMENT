import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';

const TASKS_COLLECTION = 'tasks';

// Pridėti naują užduotį
export async function addTask(title, deadline = null, photoBase64 = null, userId = null) {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      title: title,
      deadline: deadline,
      photo: photoBase64,
      userId: userId,
      completed: false,
      created_at: new Date(),
    });
    console.log('✅ Užduotis pridėta su ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Klaida pridedant užduotį:', error);
    throw error;
  }
}

// Gauti visas užduotis to vartotojo
export async function getTasks(userId = null) {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      orderBy('created_at', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    let tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Jei nuroditas userId - filtruoti client-side
    if (userId) {
      tasks = tasks.filter(task => task.userId === userId);
    }

    console.log(`✅ Gautos ${tasks.length} užduotis`);
    return tasks;
  } catch (error) {
    console.error('❌ Klaida gaunant užduotis:', error);
    throw error;
  }
}

// Atnaujinti užduotį (žymėti kaip atliktą)
export async function updateTask(id, completed) {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    await updateDoc(taskRef, {
      completed: completed,
    });
    console.log('✅ Užduotis atnaujinta:', id);
  } catch (error) {
    console.error('❌ Klaida atnaujinant užduotį:', error);
    throw error;
  }
}

// Šalinti užduotį
export async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, id));
    console.log('✅ Užduotis ištrinta:', id);
  } catch (error) {
    console.error('❌ Klaida trinant užduotį:', error);
    throw error;
  }
}
