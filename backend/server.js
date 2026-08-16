const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 3001;

app.use(cors());

const stations = require('./data/stations.json');

function loadTrips() {
  return new Promise((resolve, reject) => {
    const trips = [];

    fs.createReadStream(
      path.join(__dirname, 'data', 'transit_usage_report.csv')
    )
      .pipe(csv())
      .on('data', (row) => {
        const location = row.Location;
        const coords = stations[location] || null;

        trips.push({
          date: row.Date,
          transitAgency: row.TransitAgency,
          location,
          type: row.Type,
          coords
        });
      })
      .on('end', () => resolve(trips))
      .on('error', reject);
  });
}

app.get('/api/trips', async (req, res) => {
  try {
    const trips = await loadTrips();
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to load trips' });
  }
});

app.get('/api/stations', async (req, res) => {
    res.json(stations);
})

app.get('/', (req, res) => {
  res.send('PRESTO Travel API is running');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});