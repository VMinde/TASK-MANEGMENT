import { View, Text, TouchableOpacity, Image } from 'react-native';
import { formatDate, isDeadlineExpired } from '../utils/dateUtils';

export default function TaskItem({ task, onToggle, onDelete, onImagePress, isAdmin, onAssign, selectedAssigneeId, userLookup }) {
  const assignee = task.userId ? userLookup?.[task.userId] : null;
  const assigneeLabel = assignee ? (assignee.nickname || assignee.firstName || assignee.email) : 'Nepriskirta';
  return (
    <View style={styles.taskItem}>
      <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(task.id, task.completed)}>
        <Text style={styles.checkboxText}>{task.completed ? '✅' : '☐'}</Text>
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <Text style={[styles.taskText, task.completed && styles.completedTask]}>{task.title}</Text>
        <Text style={styles.taskTime}>🕐 Sukurta: {formatDate(task.created_at)}</Text>
        {isAdmin && (
          <View style={styles.assigneeRow}>
            <Text style={styles.assigneeLabel}>👤 {assigneeLabel}</Text>
            <Text style={styles.assigneeHint}>{task.userId ? '' : ' (pasirinkite ir priskirkite)'}</Text>
          </View>
        )}
        {task.deadline && (
          <Text style={[styles.taskDeadline, isDeadlineExpired(task.deadline) && styles.deadlineExpired]}>
            📅 Deadline: {task.deadline}
            {isDeadlineExpired(task.deadline) ? '  PRAĖJO' : ''}
          </Text>
        )}
        {task.photo && (
          <TouchableOpacity onPress={() => onImagePress(task.photo)} style={styles.photoContainer}>
            <Image source={{ uri: task.photo }} style={styles.taskThumbnail} />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoLabel}> Žiūrėti nuotrauką</Text>
            </View>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity style={styles.assignButton} onPress={() => onAssign(task.id)}>
            <Text style={styles.assignButtonText}>📌 Priskirti dabartiniam pasirinkimui {selectedAssigneeId ? '' : '(pasirinkite apačioje)'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(task.id)}>
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    marginRight: 12,
    paddingRight: 5,
  },
  checkboxText: {
    fontSize: 20,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
  },
  completedTask: {
    color: '#ccc',
    textDecorationLine: 'line-through',
  },
  taskTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  taskDeadline: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontWeight: '600',
  },
  deadlineExpired: {
    color: '#f44336',
  },
  taskThumbnail: {
    width: '100%',
    height: 80,
    marginTop: 8,
    borderRadius: 6,
    resizeMode: 'cover',
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 80,
    marginTop: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  assigneeLabel: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '700',
  },
  assigneeHint: {
    fontSize: 11,
    color: '#9ca3af',
  },
  assignButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  assignButtonText: {
    color: '#312e81',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 18,
  },
};
