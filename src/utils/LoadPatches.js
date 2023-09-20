import React from 'react';

const LoadPatches = ({ setPatches }) => {
  React.useEffect(() => {
    const loadPatches = async () => {
      try {
        const response = await fetch('/getPatches');
        if (!response.ok) {
          throw new Error('Failed to fetch patches.');
        }
        
        const patches = await response.json();
        setPatches(patches);
      } catch (error) {
        console.error('Error loading patches:', error);
      }
    };

    loadPatches();
  }, [setPatches]); // Dependency array ensures this effect runs once when the component mounts.

  return null; // This component does not render any JSX, it's solely for side-effects.
};

export default LoadPatches;
