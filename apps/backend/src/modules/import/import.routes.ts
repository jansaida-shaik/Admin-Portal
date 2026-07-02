import { Router } from 'express';
import { bulkImport } from './import.controller';

const router = Router();

// POST /api/import/:module
router.post('/:module', bulkImport);

export default router;
