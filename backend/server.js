const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let nodes = ['A', 'B', 'C'];
let links = {
  'A-B': { load: 0 },
  'B-C': { load: 0 },
  'A-C': { load: 0 }
};

function simulatePacketFlow() {
  for (let link in links) {
    links[link].load = Math.floor(Math.random() * 100);
  }
}

app.get('/api/topology', (req, res) => {
  simulatePacketFlow();
  res.json({ nodes, links });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));