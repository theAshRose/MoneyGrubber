
const express = require('express');
const fileUploadRoutes = require('./routes/csvImportPath');
const app = express();

app.use(express.json());
app.use('/api', fileUploadRoutes);

module.exports = app;
