import express from 'express';
const router = express.Router();
import itemsController from './items.controller';
import asyncHandler from '../../utils/asyncHandler';
import authenticate from '../../middleware/auth.middleware';

router.get('/', authenticate, asyncHandler(itemsController.getItems.bind(itemsController)));
router.get('/:id', authenticate, asyncHandler(itemsController.getItemById.bind(itemsController)));
router.post('/', authenticate, asyncHandler(itemsController.createItem.bind(itemsController)));
router.put('/:id', authenticate, asyncHandler(itemsController.updateItem.bind(itemsController)));
router.delete('/:id', authenticate, asyncHandler(itemsController.deleteItem.bind(itemsController)));

export default router;
