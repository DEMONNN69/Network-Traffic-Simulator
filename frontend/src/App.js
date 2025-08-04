import React, { useState, useEffect } from 'react';
import NetworkVisualization from './components/NetworkVisualization';
import StatsPanel from './components/StatsPanel';
import io from 'socket.io-client';

function App() {
  const [networkState, setNetworkState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentTime, setCurrentTime] = useState('08:00');

  // Socket.IO connection
  useEffect(() => {
    const backendUrl = 'https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev';
    
    const socketConnection = io(backendUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    socketConnection.on('connect', () => {
      console.log('Connected to Flask backend');
      setIsConnected(true);
      fetchStatus();
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from Flask backend');
      setIsConnected(false);
    });

    socketConnection.on('simulation_update', (data) => {
      console.log('Received simulation update:', data);
      setNetworkState(data);
      if (data.current_time) {
        setCurrentTime(data.current_time);
      }
    });

    socketConnection.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/status');
      const data = await response.json();
      setNetworkState(data);
      if (data.current_time) {
        setCurrentTime(data.current_time);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const startSimulation = () => {
    if (socket) {
      socket.emit('start_simulation');
    }
  };

  const stopSimulation = () => {
    if (socket) {
      socket.emit('stop_simulation');
    }
  };

  const simulateStep = async () => {
    try {
      await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: currentTime })
      });
      fetchStatus();
    } catch (error) {
      console.error('Error simulating step:', error);
    }
  };

  const resetSimulation = async () => {
    try {
      await fetch('https://animated-capybara-gjrqgvpvr6q2pv97-5000.app.github.dev/reset', {
        method: 'POST'
      });
      fetchStatus();
    } catch (error) {
      console.error('Error resetting simulation:', error);
    }
  };

  const changeTime = (newTime) => {
    setCurrentTime(newTime);
  };

  if (!networkState) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">
            {isConnected ? 'Loading network data...' : 'Connecting to server...'}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Network Traffic Simulator</h1>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-medium">
                Time: {currentTime}
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center space-x-2 space-y-2 md:space-y-0">
            <button
              onClick={startSimulation}
              disabled={!isConnected || networkState.is_running}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Start Auto Simulation
            </button>
            <button
              onClick={stopSimulation}
              disabled={!isConnected || !networkState.is_running}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Stop Simulation
            </button>
            <button
              onClick={simulateStep}
              disabled={!isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Simulate Step
            </button>
            <button
              onClick={resetSimulation}
              disabled={!isConnected}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
          </div>
          
          {/* Time Selection */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {['08:00', '08:15', '08:30', '08:45'].map(time => (
                <button
                  key={time}
                  onClick={() => changeTime(time)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentTime === time
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetworkVisualization networkState={networkState} />
          <StatsPanel networkState={networkState} />
        </div>
      </div>
    </div>
  );
}

export default App;
