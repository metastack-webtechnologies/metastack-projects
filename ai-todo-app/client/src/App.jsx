import React from 'react';
import HomePage from './pages/HomePage';
import { motion, AnimatePresence } from 'framer-motion'; // NEW: Import AnimatePresence

function App() {
  return (
    // AnimatePresence allows components to animate out when they are removed from the DOM
    <AnimatePresence>
      <motion.div
        className="App"
        initial={{ opacity: 0, scale: 0.98 }} // Initial state for app container
        animate={{ opacity: 1, scale: 1 }}    // Animate to this state
        transition={{ duration: 0.5, ease: "easeOut" }} // Transition properties
      >
        <HomePage />
      </motion.div>
    </AnimatePresence>
  );
}

export default App;