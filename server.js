require('dotenv').config();

const express = require('express');
const cors = require('cors');
const employeeRoutes = require('./src/routes/employeeRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
