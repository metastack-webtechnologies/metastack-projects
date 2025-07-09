import React from 'react';
import { motion } from 'framer-motion'; // NEW: Import motion

const TaskItem = ({ task, onUpdate, onDelete, isDeleting, layout }) => { // NEW: Receive layout prop
  const handleToggleComplete = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onUpdate(task.id, { status: newStatus });
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  // Define Framer Motion variants for task item
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 }, // Initial state (off-screen, slightly smaller)
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.5 } }, // Spring animation for appearance
    exit: { opacity: 0, height: 0, padding: 0, marginBottom: 0, transition: { duration: 0.3, ease: "easeOut" } }, // Exit animation
  };

  // Define Framer Motion variants for checkbox checkmark
  const checkmarkVariants = {
    unchecked: { scale: 0, opacity: 0 },
    checked: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 30 } },
  };

  return (
    <motion.div
      className={`task-item ${task.status === 'completed' ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit" // This uses the 'exit' variant when component is removed
      layout={layout} // Enable layout animations for smooth reordering
      whileHover={{ scale: 1.01, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)' }} // Subtle lift on hover
      whileTap={{ scale: 0.99 }} // Slight squash on tap
    >
      <div className="task-content-main">
        {/* Checkbox / Completion Indicator */}
        <motion.div
          className={`task-checkbox ${task.status === 'completed' ? 'completed' : ''}`}
          onClick={handleToggleComplete}
          whileTap={{ scale: 0.9 }} // Squash effect on checkbox tap
        >
          {/* Checkmark will be animated by Framer Motion */}
          <motion.span
            variants={checkmarkVariants}
            initial="unchecked"
            animate={task.status === 'completed' ? 'checked' : 'unchecked'}
            style={{ display: 'inline-block' }} // Needed for scale animation
          >
            {task.status === 'completed' ? '✓' : ''}
          </motion.span>
        </motion.div>
        {/* Task Text */}
        <span className={`task-text ${task.status === 'completed' ? 'completed' : ''}`}>
          {task.text}
        </span>
      </div>

      {/* Task Details Row */}
      <div className="task-details-row">
        <span className="priority">Priority: <strong className={task.priority}>{task.priority}</strong></span>
        <span className="due-date">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
        <span className="category">Category: {task.category || 'N/A'}</span>
      </div>

      {/* Action Buttons */}
      <div className="task-actions">
        <motion.button
          onClick={handleToggleComplete}
          className="complete-btn"
          whileTap={{ scale: 0.95 }} // Squash effect on button tap
        >
          {task.status === 'completed' ? 'Unmark' : 'Complete'}
        </motion.button>
        <motion.button
          onClick={handleDelete}
          className="delete-btn"
          whileTap={{ scale: 0.95 }} // Squash effect on button tap
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TaskItem;