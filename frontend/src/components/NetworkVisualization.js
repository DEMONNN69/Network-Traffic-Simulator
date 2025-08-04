import React from 'react';

const NetworkVisualization = ({ networkState }) => {
  if (!networkState) return <div>Loading...</div>;

  const { nodes, links } = networkState;

  // Node positions for visualization
  const nodePositions = {
    A: { x: 100, y: 100 },
    B: { x: 300, y: 100 },
    C: { x: 500, y: 100 },
    D: { x: 200, y: 300 },
    E: { x: 400, y: 300 }
  };

  // Link definitions for visualization
  const linkConnections = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' }
  ];

  const getUtilizationColor = (utilization) => {
    if (utilization < 30) return '#4CAF50'; // Green
    if (utilization < 60) return '#FF9800'; // Orange
    if (utilization < 80) return '#FF5722'; // Red-Orange
    return '#F44336'; // Red
  };

  return (
    <div className="network-visualization">
      <h3>Network Topology</h3>
      <svg width="600" height="400" viewBox="0 0 600 400">
        {/* Render links */}
        {linkConnections.map(({ from, to }) => {
          const linkKey = `${from}-${to}`;
          const link = links[linkKey] || links[`${to}-${from}`];
          if (!link) return null;

          const fromPos = nodePositions[from];
          const toPos = nodePositions[to];
          const utilization = link.utilization || 0;
          
          return (
            <g key={linkKey}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={getUtilizationColor(utilization)}
                strokeWidth={Math.max(2, utilization / 10)}
                opacity={0.8}
              />
              {/* Link label */}
              <text
                x={(fromPos.x + toPos.x) / 2}
                y={(fromPos.y + toPos.y) / 2 - 10}
                fontSize="10"
                fill="#333"
                textAnchor="middle"
              >
                {`${linkKey}: ${link.current_load}/${link.capacity}`}
              </text>
              <text
                x={(fromPos.x + toPos.x) / 2}
                y={(fromPos.y + toPos.y) / 2 + 5}
                fontSize="9"
                fill="#666"
                textAnchor="middle"
              >
                {`${utilization.toFixed(1)}%`}
              </text>
            </g>
          );
        })}

        {/* Render nodes */}
        {Object.entries(nodes).map(([nodeId, node]) => {
          const pos = nodePositions[nodeId];
          const queueSize = node.queue_size || 0;
          const radius = Math.max(20, 15 + queueSize * 2);
          
          return (
            <g key={nodeId}>
              {/* Node circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={queueSize > 0 ? '#FF9800' : '#2196F3'}
                stroke="#fff"
                strokeWidth="2"
              />
              {/* Node label */}
              <text
                x={pos.x}
                y={pos.y}
                fontSize="14"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                fontWeight="bold"
              >
                {nodeId}
              </text>
              {/* Queue size indicator */}
              {queueSize > 0 && (
                <text
                  x={pos.x}
                  y={pos.y + 35}
                  fontSize="10"
                  fill="#333"
                  textAnchor="middle"
                >
                  Queue: {queueSize}
                </text>
              )}
              {/* Node stats */}
              <text
                x={pos.x}
                y={pos.y - 35}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
              >
                Gen: {node.generated_packets || 0}
              </text>
              <text
                x={pos.x}
                y={pos.y - 25}
                fontSize="9"
                fill="#333"
                textAnchor="middle"
              >
                Sent: {node.sent_packets || 0}
              </text>
            </g>
          );
        })}
      </svg>
      
      <div className="legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
          <span>Low Utilization (&lt;30%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
          <span>Medium Utilization (30-60%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#FF5722' }}></div>
          <span>High Utilization (60-80%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
          <span>Critical Utilization (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
