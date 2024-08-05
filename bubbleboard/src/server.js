const express = require('express');
const app = express();
const port = 3001;

app.use(express.json()); // Middleware to parse JSON bodies

// Define a simple POST route
app.post('/update-data', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  res.json({ message: 'Data received successfully', data });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});