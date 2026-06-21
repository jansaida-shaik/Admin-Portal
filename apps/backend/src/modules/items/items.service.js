const { prisma } = require('../../prisma');

class ItemsService {
  async getItems(page = 1, limit = 25) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      prisma.item.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          vendor: true,
          stocks: { include: { location: true } },
          _count: { select: { assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.item.count()
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getItemById(id) {
    const item = await prisma.item.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
        vendor: true,
        stocks: { include: { location: true } },
        assignments: {
          include: {
            user: { select: { id: true, name: true } },
            location: { select: { name: true } }
          },
          orderBy: { assignedAt: 'desc' }
        },
        repairs: { orderBy: { repairDate: 'desc' } },
        transactions: {
          include: {
            fromLocation: true,
            toLocation: true,
            user: { select: { name: true } }
          },
          orderBy: { transactionDate: 'desc' },
          take: 5
        }
      }
    });

    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async createItem(data) {
    const { name, description, categoryId, vendorId, attachments } = data;
    return await prisma.item.create({
      data: {
        name,
        description,
        categoryId: BigInt(categoryId),
        vendorId: vendorId ? BigInt(vendorId) : null,
        attachments: attachments || null
      },
      include: { category: true, vendor: true }
    });
  }

  async updateItem(id, data) {
    const { name, description, categoryId, vendorId, attachments } = data;
    return await prisma.item.update({
      where: { id: BigInt(id) },
      data: {
        name,
        description,
        categoryId: BigInt(categoryId),
        vendorId: vendorId ? BigInt(vendorId) : null,
        attachments: attachments || null
      },
      include: { category: true, vendor: true }
    });
  }

  async deleteItem(id) {
    await prisma.item.delete({
      where: { id: BigInt(id) }
    });
  }
}

module.exports = new ItemsService();
