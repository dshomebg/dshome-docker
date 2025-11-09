import express from 'express';
import {
  getMeasurementRules,
  getMeasurementRule,
  createMeasurementRule,
  updateMeasurementRule,
  deleteMeasurementRule,
  calculateMeasurement
} from '../controllers/measurement-rules.controller';

const router = express.Router();

// Calculation endpoint
router.post('/calculate', calculateMeasurement);

// CRUD routes
router.get('/', getMeasurementRules);
router.get('/:id', getMeasurementRule);
router.post('/', createMeasurementRule);
router.put('/:id', updateMeasurementRule);
router.delete('/:id', deleteMeasurementRule);

export default router;
