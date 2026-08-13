const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());

app.get('/api/trips', (req, res) => {
  const trips = [];

  fs.createReadStream('./data/transit_usage_report.csv')
    .pipe(csv())
    .on('data', (row) => trips.push(row))
    .on('end', () => res.json(trips));
});

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});