import axios from 'axios';

// Get API URL from Vite environment variable.
// This variable should be defined in your .env.development file (in the client directory)
// e.g., VITE_API_BASE_URL=http://localhost:8000/api
// For production, you'd have a .env.production file with your live backend URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Function to add a new task to the backend
export const addTask = async (taskText, category = 'Personal') => {
  try {
    // Make a POST request to the tasks endpoint
    // The full URL will be http://localhost:8000/api/tasks/
    const response = await axios.post(`${API_BASE_URL}/tasks/`, { text: taskText, category: category }, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if you add authentication
      },
    });
    // Django REST Framework typically returns the created object directly upon success
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error adding task:', error.response?.data || error.message);
    // Re-throw a more user-friendly error message or the backend's error data
    throw error.response?.data || new Error('Failed to add task');
  }
};

// Function to fetch tasks from the backend, with optional filtering parameters
export const getTasks = async (params = {}) => {
  try {
    // Make a GET request to the tasks endpoint
    // Parameters (e.g., { status: 'completed' }) will be appended as query strings
    const response = await axios.get(`${API_BASE_URL}/tasks/`, {
      params: params, // Pass filtering parameters to Axios
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if you add authentication
      },
    });
    // DRF typically returns a list of objects
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error fetching tasks:', error.response?.data || error.message);
    // Re-throw a more user-friendly error message or the backend's error data
    throw error.response?.data || new Error('Failed to fetch tasks');
  }
};

// Function to update an existing task (partial update using PATCH)
export const updateTask = async (id, updatedData) => {
  try {
    // Make a PATCH request to a specific task's endpoint (e.g., /api/tasks/123/)
    const response = await axios.patch(`${API_BASE_URL}/tasks/${id}/`, updatedData, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if you add authentication
      },
    });
    // DRF typically returns the updated object
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error updating task:', error.response?.data || error.message);
    // Re-throw a more user-friendly error message or the backend's error data
    throw error.response?.data || new Error('Failed to update task');
  }
};

// Function to delete a task
export const deleteTask = async (id) => {
  try {
    // Make a DELETE request to a specific task's endpoint (e.g., /api/tasks/123/)
    await axios.delete(`${API_BASE_URL}/tasks/${id}/`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if you add authentication
      },
    });
    // No data is typically returned for a successful delete, just a status code (e.g., 204 No Content)
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error deleting task:', error.response?.data || error.message);
    // Re-throw a more user-friendly error message or the backend's error data
    throw error.response?.data || new Error('Failed to delete task');
  }
};
