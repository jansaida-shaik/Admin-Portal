const express = require('express');
const router = express.Router();
const itemsController = require('./items.controller');
const asyncHandler = require('../../utils/asyncHandler');
const authenticate = require('../../middleware/auth.middleware');

router.get('/', authenticate, asyncHandler(itemsController.getItems.bind(itemsController)));
router.get('/:id', authenticate, asyncHandler(itemsController.getItemById.bind(itemsController)));
router.post('/', authenticate, asyncHandler(itemsController.createItem.bind(itemsController)));
router.put('/:id', authenticate, asyncHandler(itemsController.updateItem.bind(itemsController)));
router.delete('/:id', authenticate, asyncHandler(itemsController.deleteItem.bind(itemsController)));

module.exports = router;
