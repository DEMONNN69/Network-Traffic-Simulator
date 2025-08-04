import React from 'react';

function StatsPanel({ networkState }) {
  if (!networkState) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Statistics</h2>
        <div className="text-center text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  const { nodes, links } = networkState;

  // Calculate summary statistics
  const totalPacketsGenerated = Object.values(nodes).reduce((sum, node) => sum + node.packets_generated, 0);
  const totalPacketsSent = Object.values(nodes).reduce((sum, node) => sum + node.packets_sent, 0);
  const totalQueuedPackets = Object.values(nodes).reduce((sum, node) => sum + node.queue_size, 0);
  const avgLinkUtilization = Object.values(links).reduce((sum, link) => sum + (link.current_load / link.capacity * 100), 0) / Object.keys(links).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Network Statistics</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalPacketsGenerated}</div>
          <div className="text-sm text-blue-700">Total Generated</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{totalPacketsSent}</div>
          <div className="text-sm text-green-700">Total Sent</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{totalQueuedPackets}</div>
          <div className="text-sm text-yellow-700">Total Queued</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{avgLinkUtilization.toFixed(1)}%</div>
          <div className="text-sm text-purple-700">Avg Utilization</div>
        </div>
      </div>

      {/* Node Statistics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Node Statistics</h3>
        <div className="space-y-2">
          {Object.entries(nodes).map(([nodeId, nodeData]) => (
            <div key={nodeId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">Node {nodeId}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  nodeData.queue_size > 10 ? 'bg-red-100 text-red-800' :
                  nodeData.queue_size > 5 ? 'bg-yellow-100 text-yellow-800' :
                  nodeData.queue_size > 0 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {nodeData.queue_size > 10 ? 'High' :
                   nodeData.queue_size > 5 ? 'Medium' :
                   nodeData.queue_size > 0 ? 'Low' : 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Generated</div>
                  <div className="font-medium">{nodeData.packets_generated}</div>
                </div>
                <div>
                  <div className="text-gray-500">Sent</div>
                  <div className="font-medium">{nodeData.packets_sent}</div>
                </div>
                <div>
                  <div className="text-gray-500">Queue</div>
                  <div className="font-medium">{nodeData.queue_size}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Link Statistics</h3>
        <div className="space-y-2">
          {Object.entries(links).map(([linkId, linkData]) => {
            const utilization = (linkData.current_load / linkData.capacity) * 100;
            return (
              <div key={linkId} className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{linkId}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    utilization > 80 ? 'bg-red-100 text-red-800' :
                    utilization > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {utilization.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Load: {linkData.current_load}/{linkData.capacity}
                  </span>
                  <span className="text-gray-500">
                    Capacity: {linkData.capacity} pkt/s
                  </span>
                </div>
                {/* Utilization bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      utilization > 80 ? 'bg-red-500' :
                      utilization > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;