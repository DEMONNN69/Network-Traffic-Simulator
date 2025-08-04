import React, { useState, useEffect, useCallback } from 'react';
import NetworkVisualization from './components/NetworkVisualization';
import StatsPanel from './components/StatsPanel';
import './App.css';

function App() {
  const [networkState, setNetworkState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState('08:00');

  // Fetch initial state
  useEffect(() => {
    fetchNetworkState();
    const interval = setInterval(fetchNetworkState, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNetworkState = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/status');
      if (response.ok) {
        const data = await response.json();
        setNetworkState(data);
        setIsRunning(data.is_running || false);
        setCurrentTime(data.current_time || '08:00');
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching network state:', error);
      setIsConnected(false);
    }
  };
      
  const startSimulation = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchNetworkState();
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchNetworkState();
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const simulateStep = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: currentTime })
      });
      if (response.ok) {
        fetchNetworkState();
      }
    } catch (error) {
      console.error('Error simulating step:', error);
    }
  };

  const resetSimulation = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        fetchNetworkState();
      }
    } catch (error) {
      console.error('Error resetting simulation:', error);
    }
  };

  if (!networkState) {
    return (
      <div className="app">
        <div className="header">
          <h1>Network Traffic Simulator</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'status-running' : 'status-stopped'}`}></span>
            {isConnected ? 'Connected to Server' : 'Connecting to Server...'}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Loading network data...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Network Traffic Simulator</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'status-running' : 'status-stopped'}`}></span>
          {isConnected ? 'Connected to Server' : 'Connection Lost'}
        </div>
        <div className="time-display">
          Current Time: <strong>{currentTime}</strong>
        </div>
      </div>

      <div className="simulation-controls">
        <button 
          className="btn btn-primary" 
          onClick={startSimulation}
          disabled={!isConnected || isRunning}
        >
          Start Auto Simulation
        </button>
        <button 
          className="btn btn-danger" 
          onClick={stopSimulation}
          disabled={!isConnected || !isRunning}
        >
          Stop Simulation
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={simulateStep}
          disabled={!isConnected || isRunning}
        >
          Simulate One Step
        </button>
        <button 
          className="btn btn-warning" 
          onClick={resetSimulation}
          disabled={!isConnected}
        >
          Reset
        </button>
        <button 
          className="btn btn-info" 
          onClick={fetchNetworkState}
          disabled={!isConnected}
        >
          Refresh
        </button>
      </div>

      <div className="dashboard">
        <NetworkVisualization networkState={networkState} />
        <StatsPanel networkState={networkState} />
      </div>
    </div>
  );
}

export default App;
