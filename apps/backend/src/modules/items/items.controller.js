const itemsService = require('./items.service');

class ItemsController {
  async getItems(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    
    const result = await itemsService.getItems(page, limit);
    res.json(result);
  }

  async getItemById(req, res) {
    try {
      const item = await itemsService.getItemById(req.params.id);
      res.json(item);
    } catch (error) {
      if (error.message === 'Item not found') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }
  }

  async createItem(req, res) {
    const item = await itemsService.createItem(req.body);
    res.status(201).json(item);
  }

  async updateItem(req, res) {
    const item = await itemsService.updateItem(req.params.id, req.body);
    res.json(item);
  }

  async deleteItem(req, res) {
    await itemsService.deleteItem(req.params.id);
    res.json({ success: true });
  }
}

module.exports = new ItemsController();
