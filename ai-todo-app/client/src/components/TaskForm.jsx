import React, { useState } from 'react';
import { motion } from 'framer-motion'; // NEW: Import motion

const TaskForm = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Personal');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask(taskText, selectedCategory);
      setTaskText('');
      setSelectedCategory('Personal');
    }
  };

  const categories = ['Personal', 'Work', 'Shopping', 'Study', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="task-form-container">
      <div className="task-form-input-group">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Type your task here..."
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="task-form-actions">
        <motion.button type="submit" whileTap={{ scale: 0.95 }}> {/* Apply whileTap */}
          Add Task (Text)
        </motion.button>
      </div>
    </form>
  );
};

export default TaskForm;