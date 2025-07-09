import React, { useState, useEffect } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../services/taskService';
import VoiceInputButton from '../components/VoiceInputButton';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
// import { AnimatePresence, motion } from 'framer-motion'; // Not needed here directly, but in App.jsx

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState('');
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState('All');
  const [currentDateFilter, setCurrentDateFilter] = useState('All');
  // NEW: State to track tasks being deleted for animation
  const [deletingTasks, setDeletingTasks] = useState(new Set());

  const fetchTasks = async () => {
    setLoadingTasks(true);
    setError('');
    try {
      const params = {};
      if (currentCategoryFilter !== 'All') {
        params.category = currentCategoryFilter;
      }
      if (currentDateFilter !== 'All') {
        params.date_filter = currentDateFilter;
      }

      const fetchedTasks = await getTasks(params);
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks: ' + (err.message || 'Unknown error'));
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentCategoryFilter, currentDateFilter]);

  const handleAddTask = async (taskText, category = 'Personal') => {
    setError('');
    try {
      await addTask(taskText, category);
      fetchTasks(); // Refetch to show new task with animation
    } catch (err) {
      setError('Failed to add task: ' + (err.message || 'Unknown error'));
    }
  };

  const handleTaskUpdate = async (id, updatedData) => {
    setError('');
    try {
      await updateTask(id, updatedData);
      fetchTasks(); // Refetch to update and re-sort
    } catch (err) {
      setError('Failed to update task: ' + (err.message || 'Unknown error'));
      console.error('Error updating task:', err);
    }
  };

  const handleTaskDelete = async (id) => {
    setError('');
    // NEW: Add task to deleting state to trigger animation
    setDeletingTasks(prev => new Set(prev).add(id));

    try {
      // No need for setTimeout here, Framer Motion's AnimatePresence handles exit animation
      await deleteTask(id);
      // Remove from tasks state immediately, AnimatePresence will handle the visual exit
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task: ' + (err.message || 'Unknown error'));
      console.error('Error deleting task:', err);
    } finally {
      // NEW: Remove task from deleting state after a brief delay
      // This ensures the task is removed from the Set after the animation has a chance to start
      setTimeout(() => {
        setDeletingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 500); // Slightly longer than animation duration
    }
  };

  return (
    <div className="home-page">
      <h1>My Smart To-Do List</h1>

      <div className="filter-group">
        {['All', 'Today', 'Future', 'Past'].map(dateFilter => (
          <button
            key={dateFilter}
            onClick={() => setCurrentDateFilter(dateFilter)}
            className={currentDateFilter === dateFilter ? 'active' : ''}
          >
            {dateFilter}
          </button>
        ))}
      </div>

      <div className="filter-group">
        {['All', 'Personal', 'Work', 'Shopping', 'Study', 'Other'].map(category => (
          <button
            key={category}
            onClick={() => setCurrentCategoryFilter(category)}
            className={currentCategoryFilter === category ? 'active' : ''}
          >
            {category}
          </button>
        ))}
      </div>

      <TaskForm onAddTask={handleAddTask} />
      <VoiceInputButton onTaskAdded={handleAddTask} />

      {loadingTasks ? (
        <p className="loading-message">Loading tasks...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="empty-list">No tasks yet! Start by adding one.</p>
      ) : (
        <div className="task-list">
          {/* AnimatePresence is in App.jsx, so TaskItem needs to be a direct child for exit animations */}
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              isDeleting={deletingTasks.has(task.id)}
              layout // NEW: Add layout prop for smooth reordering animations
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;