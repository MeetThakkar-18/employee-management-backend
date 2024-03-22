const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const XLSX = require('xlsx');

exports.getAllEmployees = async (req, res) => {

  try {
    const employees = await prisma.employee.findMany();
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.create({ data: req.body });
    res.json(employee);
  } catch (error) {
    if (error.code === 'P2002' && error.meta && error.meta.target && error.meta.target.includes('employeeID')) {
      res.status(400).json({ message: 'Employee ID must be unique' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: req.body,
    });
    res.json(updatedEmployee);
  } catch (error) {
    if (error.code === 'P2025' && error.meta && error.meta.cause === 'Record to update not found.') {
      res.status(404).json({ message: 'Employee not found' });
    } else {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
    }
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.employee.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025' && error.meta && error.meta.cause === 'Record to delete does not exist.') {
      res.status(404).json({ message: 'Employee not found' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const columnMapping = {
  'employeeid': 'employeeID',
  'name': 'name',
  'status': 'status',
  'salary': 'salary',
  'location': 'location',
  'joiningdate': 'joiningDate',
  'birthdate': 'birthDate',
};

exports.importEmployees = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    if (!workbook) {
      return res.status(400).json({ message: 'Error parsing Excel file' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row && row.length > 0 && row.some(cell => typeof cell === 'string' && cell.trim() !== '')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ message: 'Unable to detect header row in the Excel file' });
    }

    const headerRow = data[headerRowIndex];
    const normalizedHeaderRow = headerRow.map(column => column.toLowerCase().trim());

    const employees = [];
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (row && row.length > 0 && row.some(cell => cell && typeof cell === 'string' && cell.trim() !== '')) {
        const mappedData = {};
        for (let j = 0; j < row.length; j++) {
          const columnName = normalizedHeaderRow[j];
          const dbColumnName = columnMapping[columnName];
          if (dbColumnName) {
            mappedData[dbColumnName] = row[j];
          }
        }
        employees.push(mappedData);
      }
    }

    const insertedEmployees = await prisma.employee.createMany({
      data: employees,
      skipDuplicates: true,
    });

    res.status(201).json({ message: 'Employee data imported successfully', employees: insertedEmployees });
  } catch (error) {
    console.error('Error importing employees:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};