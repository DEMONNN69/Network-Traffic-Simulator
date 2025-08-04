import React from 'react';

const StatsPanel = ({ networkState }) => {
  if (!networkState) return <div>Loading...</div>;

  const { nodes, links, current_time, is_running } = networkState;

  // Calculate total statistics
  const totalGenerated = Object.values(nodes).reduce((sum, node) => sum + (node.generated_packets || 0), 0);
  const totalSent = Object.values(nodes).reduce((sum, node) => sum + (node.sent_packets || 0), 0);
  const totalQueued = Object.values(nodes).reduce((sum, node) => sum + (node.queue_size || 0), 0);
  const totalCapacity = Object.values(links).reduce((sum, link) => sum + (link.capacity || 0), 0);
  const totalLoad = Object.values(links).reduce((sum, link) => sum + (link.current_load || 0), 0);
  const avgUtilization = Object.values(links).reduce((sum, link) => sum + (link.utilization || 0), 0) / Object.keys(links).length;

  return (
    <div className="stats-panel">
      <h3>Network Statistics</h3>
      
      {/* Simulation Status */}
      <div className="stats-section">
        <h4>Simulation Status</h4>
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className={`stat-value ${is_running ? 'running' : 'stopped'}`}>
            {is_running ? 'Running' : 'Stopped'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Current Time:</span>
          <span className="stat-value">{current_time}</span>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="stats-section">
        <h4>Overall Statistics</h4>
        <div className="stat-item">
          <span className="stat-label">Total Packets Generated:</span>
          <span className="stat-value">{totalGenerated}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Packets Sent:</span>
          <span className="stat-value">{totalSent}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Queued:</span>
          <span className="stat-value">{totalQueued}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Network Load:</span>
          <span className="stat-value">{totalLoad}/{totalCapacity}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Utilization:</span>
          <span className="stat-value">{avgUtilization.toFixed(1)}%</span>
        </div>
      </div>

      {/* Node Statistics */}
      <div className="stats-section">
        <h4>Node Statistics</h4>
        <div className="node-stats">
          {Object.entries(nodes).map(([nodeId, node]) => (
            <div key={nodeId} className="node-stat">
              <h5>Node {nodeId}</h5>
              <div className="stat-item">
                <span className="stat-label">Generated:</span>
                <span className="stat-value">{node.generated_packets || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sent:</span>
                <span className="stat-value">{node.sent_packets || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Queue Size:</span>
                <span className={`stat-value ${node.queue_size > 0 ? 'warning' : ''}`}>
                  {node.queue_size || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate:</span>
                <span className="stat-value">
                  {node.generated_packets > 0 
                    ? ((node.sent_packets / node.generated_packets) * 100).toFixed(1) + '%'
                    : '0%'
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link Statistics */}
      <div className="stats-section">
        <h4>Link Statistics</h4>
        <div className="link-stats">
          {Object.entries(links).map(([linkId, link]) => (
            <div key={linkId} className="link-stat">
              <h5>Link {linkId}</h5>
              <div className="stat-item">
                <span className="stat-label">Capacity:</span>
                <span className="stat-value">{link.capacity}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Load:</span>
                <span className="stat-value">{link.current_load}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Utilization:</span>
                <span className={`stat-value ${
                  link.utilization > 80 ? 'critical' : 
                  link.utilization > 60 ? 'warning' : 
                  'normal'
                }`}>
                  {link.utilization.toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Sent:</span>
                <span className="stat-value">{link.total_packets_sent}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
