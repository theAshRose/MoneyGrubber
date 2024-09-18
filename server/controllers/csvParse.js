// /server/controllers/fileController.js
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');
const _ = require('lodash');
const sequelize = require('../config/database');  // Your Sequelize setup

// Helper function to dynamically create tables based on CSV data
const createTable = async (columns) => {
  const modelDefinition = {};
  columns.forEach(col => {
    modelDefinition[col] = {
      type: DataTypes.STRING,
      allowNull: true
    };
  });

  return sequelize.define('DynamicTable', modelDefinition, {
    freezeTableName: true
  });
};

const handleFileUpload = async (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.file.filename);
  const data = [];

  // Parse CSV
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', async () => {
      const columns = Object.keys(data[0]);

      // Dynamically create table based on CSV columns
      const DynamicTable = await createTable(columns);
      await DynamicTable.sync();

      // Process data: Group and sum numeric values
      const groupedData = _(data)
        .groupBy('SomeColumn')  // Change 'SomeColumn' based on your CSV structure
        .map((group, key) => ({
          key,
          sum: _.sumBy(group, 'NumericColumn')  // Change 'NumericColumn' accordingly
        }))
        .value();

      // Insert processed data into the new table
      await DynamicTable.bulkCreate(groupedData);
      
      res.status(200).json({ message: 'File processed successfully' });
    });
};

module.exports = { handleFileUpload };
