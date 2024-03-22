const express = require('express');
const router = express.Router();
const multer = require('multer');
const employeeController = require('../controllers/employeeControllers');

const upload = multer();

router.get('/employees', employeeController.getAllEmployees);
router.post('/add-employee', employeeController.addEmployee);
router.post('/import', upload.single('file'), employeeController.importEmployees);
router.delete('/employee/:id', employeeController.deleteEmployee);
router.put('/employee/:id', employeeController.updateEmployee);

module.exports = router;
