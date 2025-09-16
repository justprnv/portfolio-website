import { useState, useEffect } from 'react';

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`loading-screen ${!isVisible ? 'animate-fade-out' : ''}`}>
      <div className="loading-content">
        <h1 className="text-2xl md:text-4xl text-blue-600 dark:text-blue-400 typewriter">
          hello, world
        </h1>
      </div>
    </div>
  );
};

export default LoadingScreen;