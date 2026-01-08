import { View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function InputForm({ taskTitle, setTaskTitle, deadline, setDeadline, onCamera, onAddTask }) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Įveskite naują užduotį..."
        value={taskTitle}
        onChangeText={setTaskTitle}
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, styles.inputDeadline]}
        placeholder="Deadline: YYYY-MM-DD"
        value={deadline}
        onChangeText={setDeadline}
        placeholderTextColor="#999"
      />
      <TouchableOpacity style={styles.cameraButton} onPress={onCamera}>
        <Text style={styles.buttonText}>📷</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
        <Text style={styles.addButtonText}>➕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDeadline: {
    flex: 0.8,
  },
  cameraButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
  },
  addButtonText: {
    fontSize: 20,
  },
};
