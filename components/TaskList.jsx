import { ScrollView, Text } from 'react-native';
import TaskItem from './TaskItem';

export default function TaskList({ tasks, onToggle, onDelete, onImagePress }) {
  if (tasks.length === 0) {
    return <Text style={styles.emptyText}>Nėra užduočių. Pridėkite naują! 🎯</Text>;
  }
  return (
    <ScrollView style={styles.taskList}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onImagePress={onImagePress}
        />
      ))}
    </ScrollView>
  );
}

const styles = {
  taskList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
};
