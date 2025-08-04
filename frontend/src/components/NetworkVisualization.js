import React from 'react';

function NetworkVisualization({ networkState }) {
  if (!networkState) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Network Topology</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading network visualization...</div>
        </div>
      </div>
    );
  }

  const { nodes, links } = networkState;

  // Node positions for visualization
  const nodePositions = {
    'A': { x: 100, y: 100 },
    'B': { x: 300, y: 100 },
    'C': { x: 500, y: 100 },
    'D': { x: 200, y: 250 },
    'E': { x: 400, y: 250 }
  };

  // Get link color based on utilization
  const getLinkColor = (linkData) => {
    const utilization = (linkData.current_load / linkData.capacity) * 100;
    if (utilization > 80) return 'stroke-red-500';
    if (utilization > 50) return 'stroke-yellow-500';
    return 'stroke-green-500';
  };

  // Get node color based on queue size
  const getNodeColor = (nodeData) => {
    const queueSize = nodeData.queue_size;
    if (queueSize > 10) return 'bg-red-500';
    if (queueSize > 5) return 'bg-yellow-500';
    if (queueSize > 0) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Network Topology</h2>
      <div className="relative">
        <svg width="600" height="350" className="border border-gray-200 rounded-lg bg-gray-50">
          {/* Render Links */}
          {Object.entries(links).map(([linkId, linkData]) => {
            const [nodeA, nodeB] = linkId.split('-');
            const posA = nodePositions[nodeA];
            const posB = nodePositions[nodeB];
            
            if (!posA || !posB) return null;

            return (
              <g key={linkId}>
                <line
                  x1={posA.x}
                  y1={posA.y}
                  x2={posB.x}
                  y2={posB.y}
                  className={`stroke-4 ${getLinkColor(linkData)}`}
                  strokeWidth="3"
                />
                {/* Link Label */}
                <text
                  x={(posA.x + posB.x) / 2}
                  y={(posA.y + posB.y) / 2 - 10}
                  className="text-xs font-medium fill-gray-600"
                  textAnchor="middle"
                >
                  {linkData.current_load}/{linkData.capacity}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {Object.entries(nodes).map(([nodeId, nodeData]) => {
            const pos = nodePositions[nodeId];
            if (!pos) return null;

            return (
              <g key={nodeId}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  className={`${getNodeColor(nodeData)} stroke-white stroke-2 transition-all duration-300`}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  className="text-white font-bold text-lg fill-white"
                  textAnchor="middle"
                >
                  {nodeId}
                </text>
                {/* Queue indicator */}
                {nodeData.queue_size > 0 && (
                  <text
                    x={pos.x}
                    y={pos.y - 35}
                    className="text-xs font-bold fill-red-600"
                    textAnchor="middle"
                  >
                    Q: {nodeData.queue_size}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Node Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span>Normal (Queue ≤ 0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span>Low Queue (1-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span>Medium Queue (6-10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>High Queue (&gt;10)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Link Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-green-500"></div>
                <span>Low Load (≤50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-yellow-500"></div>
                <span>Medium Load (51-80%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-red-500"></div>
                <span>High Load (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkVisualization;
