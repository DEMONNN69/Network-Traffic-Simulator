import time
import random
import heapq
from typing import Dict, List, Tuple
from collections import defaultdict, deque
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'network-simulator-secret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class NetworkSimulator:
    def __init__(self):
        # Network topology: 5 nodes (A-E)
        self.nodes = ['A', 'B', 'C', 'D', 'E']
        
        # Actual network links with real capacities (packets per time slot)
        self.links = [
            ('A', 'B', 100),
            ('A', 'C', 80),
            ('B', 'D', 70),
            ('C', 'D', 90),
            ('C', 'E', 100),
            ('D', 'E', 60)
        ]
        
        # Create adjacency list for pathfinding
        self.graph = defaultdict(list)
        self.link_capacity = {}
        for src, dst, capacity in self.links:
            self.graph[src].append(dst)
            self.graph[dst].append(src)
            self.link_capacity[f"{src}-{dst}"] = capacity
            self.link_capacity[f"{dst}-{src}"] = capacity
        
        # Real traffic generation pattern by time slot (packets per time slot)
        self.traffic_schedule = {
            '08:00': {'A': 50, 'B': 30, 'C': 40, 'D': 20, 'E': 60},
            '08:15': {'A': 55, 'B': 35, 'C': 45, 'D': 25, 'E': 65},
            '08:30': {'A': 60, 'B': 40, 'C': 50, 'D': 30, 'E': 70},
            '08:45': {'A': 55, 'B': 35, 'C': 45, 'D': 25, 'E': 65}
        }
        
        self.time_slots = ['08:00', '08:15', '08:30', '08:45']
        
        # Simulation state
        self.reset_simulation()
        
        # Running state
        self.is_running = False
        self.simulation_thread = None
    
    def reset_simulation(self):
        """Reset all simulation data"""
        # Node queues: packets waiting to be sent
        self.node_queues = {node: deque() for node in self.nodes}
        
        # Link current usage
        self.link_usage = {f"{src}-{dst}": 0 for src, dst, _ in self.links}
        for src, dst, _ in self.links:
            self.link_usage[f"{dst}-{src}"] = 0
        
        # Node statistics
        self.node_stats = {
            node: {
                'packets_generated': 0,
                'packets_sent': 0,
                'queue_size': 0
            } for node in self.nodes
        }
        
        # Current time index
        self.current_time_index = 0
        self.current_time = self.time_slots[0]
        
        # Packet ID counter
        self.packet_id = 0
    
    def find_shortest_path(self, source: str, destination: str) -> List[str]:
        """Dijkstra's algorithm to find shortest path"""
        if source == destination:
            return [source]
        
        # Priority queue: (distance, node, path)
        pq = [(0, source, [source])]
        visited = set()
        
        while pq:
            dist, current, path = heapq.heappop(pq)
            
            if current in visited:
                continue
            
            visited.add(current)
            
            if current == destination:
                return path
            
            for neighbor in self.graph[current]:
                if neighbor not in visited:
                    new_path = path + [neighbor]
                    heapq.heappush(pq, (dist + 1, neighbor, new_path))
        
        return []  # No path found
    
    def can_route_packet(self, path: List[str]) -> bool:
        """Check if all links in the path have available capacity"""
        for i in range(len(path) - 1):
            link_key = f"{path[i]}-{path[i+1]}"
            capacity = self.link_capacity.get(link_key, 0)
            current_load = self.link_usage.get(link_key, 0)
            
            if current_load >= capacity:
                return False
        
        return True
    
    def route_packet(self, packet: Dict) -> bool:
        """Try to route a packet. Returns True if successful."""
        path = self.find_shortest_path(packet['source'], packet['destination'])
        
        if not path or len(path) < 2:
            return False
        
        # Check if all links in the path have capacity
        if not self.can_route_packet(path):
            return False
        
        # Reserve capacity on all links in the path
        for i in range(len(path) - 1):
            link_key = f"{path[i]}-{path[i+1]}"
            self.link_usage[link_key] += 1
        
        # Update stats
        self.node_stats[packet['source']]['packets_sent'] += 1
        
        return True
    
    def generate_packets_for_time_slot(self, time_slot: str):
        """Generate packets based on the traffic schedule for the given time slot"""
        if time_slot not in self.traffic_schedule:
            return
        
        traffic_data = self.traffic_schedule[time_slot]
        
        for source_node, packet_count in traffic_data.items():
            # Generate the specified number of packets for this node
            for _ in range(packet_count):
                # Choose random destination (excluding source)
                destination_options = [node for node in self.nodes if node != source_node]
                destination = random.choice(destination_options)
                
                packet = {
                    'id': self.packet_id,
                    'source': source_node,
                    'destination': destination,
                    'timestamp': time_slot
                }
                
                self.packet_id += 1
                self.node_queues[source_node].append(packet)
                self.node_stats[source_node]['packets_generated'] += 1
    
    def process_queued_packets(self):
        """Try to route all queued packets"""
        for node in self.nodes:
            queue = self.node_queues[node]
            packets_to_remove = []
            
            for i, packet in enumerate(queue):
                if self.route_packet(packet):
                    packets_to_remove.append(i)
            
            # Remove successfully routed packets (in reverse order to maintain indices)
            for i in reversed(packets_to_remove):
                queue.remove(queue[i])
            
            # Update queue size stats
            self.node_stats[node]['queue_size'] = len(queue)
    
    def simulate_time_slot(self, time_slot: str = None):
        """Simulate one time slot"""
        if time_slot is None:
            time_slot = self.current_time
        
        # Reset link usage for new time slot
        for link_key in self.link_usage:
            self.link_usage[link_key] = 0
        
        # Generate new packets for this time slot
        self.generate_packets_for_time_slot(time_slot)
        
        # Try to route all queued packets
        self.process_queued_packets()
        
        # Update current time for next simulation
        if time_slot == self.current_time:
            self.current_time_index = (self.current_time_index + 1) % len(self.time_slots)
            self.current_time = self.time_slots[self.current_time_index]
        
        # Emit update via WebSocket
        self.emit_status()
    
    def get_status(self):
        """Get current simulation status"""
        # Calculate link utilization percentages
        link_stats = {}
        for src, dst, capacity in self.links:
            link_key = f"{src}-{dst}"
            usage = self.link_usage.get(link_key, 0)
            utilization = (usage / capacity * 100) if capacity > 0 else 0
            
            link_stats[link_key] = {
                'source': src,
                'destination': dst,
                'capacity': capacity,
                'current_load': usage,
                'utilization': round(utilization, 1)
            }
        
        return {
            'current_time': self.current_time,
            'nodes': self.node_stats,
            'links': link_stats,
            'queues': {node: len(queue) for node, queue in self.node_queues.items()},
            'is_running': self.is_running
        }
    
    def emit_status(self):
        """Emit current status via WebSocket"""
        status = self.get_status()
        socketio.emit('simulation_update', status)
    
    def start_auto_simulation(self):
        """Start automatic simulation (runs every 2 seconds for demo)"""
        if self.is_running:
            return
        
        self.is_running = True
        
        def simulation_loop():
            while self.is_running:
                self.simulate_time_slot()
                time.sleep(2)  # 2 seconds between time slots for demo
        
        self.simulation_thread = threading.Thread(target=simulation_loop)
        self.simulation_thread.daemon = True
        self.simulation_thread.start()
    
    def stop_auto_simulation(self):
        """Stop automatic simulation"""
        self.is_running = False
        if self.simulation_thread:
            self.simulation_thread.join(timeout=1)

# Global simulator instance
simulator = NetworkSimulator()

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Send initial status
    simulator.emit_status()

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_simulation')
def handle_start_simulation():
    simulator.start_auto_simulation()
    emit('simulation_started', {'message': 'Simulation started'})

@socketio.on('stop_simulation')
def handle_stop_simulation():
    simulator.stop_auto_simulation()
    emit('simulation_stopped', {'message': 'Simulation stopped'})

# REST API endpoints
@app.route('/simulate', methods=['POST'])
def simulate():
    """Run one time slot of simulation"""
    data = request.get_json() or {}
    time_slot = data.get('time', None)
    
    simulator.simulate_time_slot(time_slot)
    
    return jsonify({
        'success': True,
        'message': f'Simulated time slot: {simulator.current_time}',
        'status': simulator.get_status()
    })

@app.route('/status', methods=['GET'])
def status():
    """Get current simulation status"""
    return jsonify(simulator.get_status())

@app.route('/reset', methods=['POST'])
def reset():
    """Reset simulation"""
    simulator.stop_auto_simulation()
    simulator.reset_simulation()
    simulator.emit_status()
    
    return jsonify({
        'success': True,
        'message': 'Simulation reset',
        'status': simulator.get_status()
    })

@app.route('/start', methods=['POST'])
def start_simulation():
    """Start automatic simulation"""
    simulator.start_auto_simulation()
    return jsonify({
        'success': True,
        'message': 'Simulation started'
    })

@app.route('/stop', methods=['POST'])
def stop_simulation():
    """Stop automatic simulation"""
    simulator.stop_auto_simulation()
    return jsonify({
        'success': True,
        'message': 'Simulation stopped'
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Network Traffic Simulator API',
        'endpoints': {
            'GET /status': 'Get current simulation status',
            'POST /simulate': 'Run one time slot (optional: {"time": "08:00"})',
            'POST /reset': 'Reset simulation',
            'POST /start': 'Start automatic simulation',
            'POST /stop': 'Stop automatic simulation'
        }
    })

if __name__ == '__main__':
    print("Starting Network Traffic Simulator...")
    print("Available endpoints:")
    print("  GET  /status - Get current simulation status")
    print("  POST /simulate - Run one time slot")
    print("  POST /reset - Reset simulation")
    print("  POST /start - Start automatic simulation")
    print("  POST /stop - Stop automatic simulation")
    print("\nWebSocket events: connect, start_simulation, stop_simulation")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
