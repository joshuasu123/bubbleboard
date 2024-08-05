const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

app.post('/update-data', (req, res) => {
  const data = req.body;
  const filePath = path.join(__dirname, 'data.json');

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error writing file');
    } else {
      res.send('File updated successfully');
    }
  });
});

// Catch-all handler to return the React app's index.html for all other GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.tsx'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
