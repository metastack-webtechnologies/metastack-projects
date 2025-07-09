import axios from 'axios';

// Get API URL from Vite environment variable
// Ensure this matches your backend's URL, e.g., http://192.168.0.102:5000/api
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

export const addTask = async (taskText, category = 'Personal') => { // NEW: Add category parameter with default
  try {
    const response = await axios.post(`${API_URL}/tasks/`, { text: taskText, category: category }, { // Send category
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}` // Uncomment if you add authentication
      },
    });
    return response.data; // Django REST Framework returns the created object directly
  } catch (error) {
    console.error('Error adding task:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add task');
  }
};

// getTasks now accepts params for filtering
export const getTasks = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/tasks/`, {
      params: params, // Pass parameters to Axios
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return response.data; // DRF returns a list of objects
  } catch (error) {
    console.error('Error fetching tasks:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch tasks');
  }
};

export const updateTask = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${API_URL}/tasks/${id}/`, updatedData, { // Use PATCH for partial updates
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return response.data; // DRF returns the updated object
  } catch (error) {
    console.error('Error updating task:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update task');
  }
};

export const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}/tasks/${id}/`, {
      headers: {
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    // No data returned for delete, just status
  } catch (error) {
    console.error('Error deleting task:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete task');
  }
};