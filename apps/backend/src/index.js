require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { prisma, pool } = require('./prisma');
const {
  formatDatabaseConnectionMessage,
  isDatabaseConnectionError
} = require('./utils/databaseError');
const {
  normalizeMobileRecord,
  resolveMobileProvider
} = require('./utils/mobileProviders');
const app = express();

const asyncHandler = require('./utils/asyncHandler');

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not set.");
  process.exit(1);
}
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage
});
app.use('/uploads', express.static(uploadDir));

// BigInt serialization fix
app.set('json replacer', (key, value) => typeof value === 'bigint' ? value.toString() : value);

// ─── Modules & Middleware ────────────────────────────────────────────────
const authenticate = require('./middleware/auth.middleware');
app.use('/api/auth', require('./modules/auth/auth.routes'));

// ─── Dashboard Stats ───────────────────────────────────────────────────────
app.get('/api/stats', authenticate, asyncHandler(async (req, res) => {
  const [totalItems, totalStock, totalVendors, totalUsers, totalMobile, totalBills, activeAssignments, activeBills, totalTransactions, recentTransactions] = await Promise.all([prisma.item.count(), prisma.stock.aggregate({
    _sum: {
      quantity: true
    }
  }), prisma.vendor.count(), prisma.user.count(), prisma.mobileNumber.count(), prisma.internetBill.count(), prisma.assignment.count({
    where: {
      status: 'ACTIVE'
    }
  }), prisma.internetBill.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      monthlyCost: true
    }
  }), prisma.transaction.count(), prisma.transaction.findMany({
    take: 8,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      item: true,
      user: true,
      toLocation: true,
      fromLocation: true
    }
  })]);
  const monthlyISPCost = activeBills.reduce((s, b) => s + (Number(b.monthlyCost) || 0), 0);
  res.json({
    totalItems,
    totalStock: totalStock._sum.quantity || 0,
    totalVendors,
    totalUsers,
    totalMobile,
    totalBills,
    activeAssignments,
    monthlyISPCost,
    totalTransactions,
    recentTransactions
  });
}));

// ─── Items / Assets ────────────────────────────────────────────────────────
app.use('/api/items', require('./modules/items/items.routes'));

// ─── Categories ────────────────────────────────────────────────────────────
app.get('/api/categories', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([prisma.category.findMany({
    skip,
    take: limit,
    orderBy: {
      name: 'asc'
    }
  }), prisma.category.count()]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.post('/api/categories', authenticate, asyncHandler(async (req, res) => {
  const cat = await prisma.category.create({
    data: {
      name: req.body.name
    }
  });
  res.status(201).json(cat);
}));

// ─── Vendors ───────────────────────────────────────────────────────────────
app.get('/api/vendors', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const where = search ? {
    OR: [{
      name: {
        contains: search,
        mode: 'insensitive'
      }
    }, {
      contact: {
        contains: search,
        mode: 'insensitive'
      }
    }]
  } : {};
  const [data, total] = await Promise.all([prisma.vendor.findMany({
    where,
    skip,
    take: limit,
    include: {
      _count: {
        select: {
          items: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  }), prisma.vendor.count({
    where
  })]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.get('/api/vendors/:id', authenticate, asyncHandler(async (req, res) => {
  const vendor = await prisma.vendor.findUnique({
    where: {
      id: BigInt(req.params.id)
    },
    include: {
      items: {
        include: {
          category: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          items: true
        }
      }
    }
  });
  if (!vendor) return res.status(404).json({
    error: 'Vendor not found'
  });
  res.json(vendor);
}));
app.post('/api/vendors', authenticate, asyncHandler(async (req, res) => {
  const {
    name,
    contact
  } = req.body;
  const vendor = await prisma.vendor.create({
    data: {
      name,
      contact
    }
  });
  res.status(201).json(vendor);
}));
app.put('/api/vendors/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    name,
    contact
  } = req.body;
  const vendor = await prisma.vendor.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      name,
      contact
    }
  });
  res.json(vendor);
}));
app.delete('/api/vendors/:id', authenticate, asyncHandler(async (req, res) => {
  await prisma.vendor.delete({
    where: {
      id: BigInt(req.params.id)
    }
  });
  res.json({
    success: true
  });
}));

// ─── Locations ─────────────────────────────────────────────────────────────
app.get('/api/locations', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50; // Expose more locations!
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([prisma.location.findMany({
    skip,
    take: limit,
    orderBy: [{
      city: 'asc'
    }, {
      name: 'asc'
    }]
  }), prisma.location.count()]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.post('/api/locations', authenticate, asyncHandler(async (req, res) => {
  const {
    name,
    city
  } = req.body;
  const loc = await prisma.location.create({
    data: {
      name,
      city
    }
  });
  res.status(201).json(loc);
}));

// ─── Users / Employees ─────────────────────────────────────────────────────
app.get('/api/users', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([prisma.user.findMany({
    skip,
    take: limit,
    include: {
      _count: {
        select: {
          assignments: {
            where: {
              status: 'ACTIVE'
            }
          },
          mobileNumbers: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  }), prisma.user.count()]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.get('/api/users/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(req.params.id)
    },
    include: {
      assignments: {
        where: {
          status: 'ACTIVE'
        },
        include: {
          item: {
            include: {
              category: true
            }
          },
          location: true
        }
      },
      mobileNumbers: true
    }
  });
  if (!user) return res.status(404).json({
    error: 'User not found'
  });
  res.json(user);
}));
app.post('/api/users', authenticate, asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    city,
    branch,
    phone
  } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      role: role || 'STAFF',
      city,
      branch,
      phone
    }
  });
  res.status(201).json(user);
}));
app.put('/api/users/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    name,
    email,
    role,
    city,
    branch,
    phone
  } = req.body;
  const user = await prisma.user.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      name,
      email,
      role,
      city,
      branch,
      phone
    }
  });
  res.json(user);
}));

// ─── Stock ─────────────────────────────────────────────────────────────────
app.get('/api/stocks', authenticate, asyncHandler(async (req, res) => {
  const stocks = await prisma.stock.findMany({
    include: {
      item: {
        include: {
          category: true
        }
      },
      location: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
  res.json(stocks);
}));
app.post('/api/stocks', authenticate, asyncHandler(async (req, res) => {
  const {
    itemId,
    locationId,
    fromLocationId,
    toLocationId,
    quantity,
    type,
    sentById,
    receivedById,
    transactionDate,
    vendor,
    attachments
  } = req.body;
  const iId = BigInt(itemId),
    qty = parseInt(quantity);
  const typeVal = type || 'IN';
  const sId = sentById ? BigInt(sentById) : null;
  const rId = receivedById ? BigInt(receivedById) : null;
  const txDate = transactionDate ? new Date(transactionDate) : new Date();
  let finalStock;
  if (typeVal === 'TRANSFER') {
    const srcId = BigInt(fromLocationId);
    const dstId = BigInt(toLocationId);

    // 1. Deduct stock from Source Location
    const srcStock = await prisma.stock.findUnique({
      where: {
        itemId_locationId: {
          itemId: iId,
          locationId: srcId
        }
      }
    });
    if (srcStock) {
      await prisma.stock.update({
        where: {
          id: srcStock.id
        },
        data: {
          quantity: Math.max(0, srcStock.quantity - qty)
        }
      });
    }

    // 2. Add stock to Destination Location
    const dstStock = await prisma.stock.findUnique({
      where: {
        itemId_locationId: {
          itemId: iId,
          locationId: dstId
        }
      }
    });
    if (dstStock) {
      finalStock = await prisma.stock.update({
        where: {
          id: dstStock.id
        },
        data: {
          quantity: dstStock.quantity + qty
        }
      });
    } else {
      finalStock = await prisma.stock.create({
        data: {
          itemId: iId,
          locationId: dstId,
          quantity: qty
        }
      });
    }

    // 3. Register Transfer Event in Ledger
    await prisma.transaction.create({
      data: {
        itemId: iId,
        quantity: qty,
        type: 'TRANSFER',
        fromLocationId: srcId,
        toLocationId: dstId,
        userId: BigInt(req.user.id === 'admin' ? 1 : req.user.id),
        sentById: sId,
        receivedById: rId,
        transactionDate: txDate,
        vendor: vendor || null,
        attachments: attachments || null
      }
    });
  } else {
    // Handle standard entry / extraction
    const targetLocId = BigInt(locationId || (typeVal === 'IN' ? toLocationId : fromLocationId));
    const existing = await prisma.stock.findUnique({
      where: {
        itemId_locationId: {
          itemId: iId,
          locationId: targetLocId
        }
      }
    });
    if (existing) {
      const newQty = typeVal === 'OUT' ? existing.quantity - qty : existing.quantity + qty;
      finalStock = await prisma.stock.update({
        where: {
          id: existing.id
        },
        data: {
          quantity: Math.max(0, newQty)
        }
      });
    } else {
      finalStock = await prisma.stock.create({
        data: {
          itemId: iId,
          locationId: targetLocId,
          quantity: qty
        }
      });
    }

    // Log standard entry/exit to ledger
    await prisma.transaction.create({
      data: {
        itemId: iId,
        quantity: qty,
        type: typeVal,
        fromLocationId: typeVal === 'OUT' ? targetLocId : null,
        toLocationId: typeVal === 'IN' ? targetLocId : null,
        userId: BigInt(req.user.id === 'admin' ? 1 : req.user.id),
        sentById: sId,
        receivedById: rId,
        transactionDate: txDate,
        vendor: vendor || null,
        attachments: attachments || null
      }
    });
  }
  res.status(201).json(finalStock);
}));

// ─── Transactions / Audit Log ──────────────────────────────────────────────
app.get('/api/transactions', authenticate, asyncHandler(async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    include: {
      item: {
        include: {
          category: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      sentBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      receivedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      fromLocation: true,
      toLocation: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 200
  });
  res.json(transactions);
}));

// ─── Assignments ───────────────────────────────────────────────────────────
app.get('/api/assignments', authenticate, asyncHandler(async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      item: {
        include: {
          category: true
        }
      },
      location: true
    },
    orderBy: {
      assignedAt: 'desc'
    }
  });
  res.json(assignments);
}));
app.post('/api/assignments', authenticate, asyncHandler(async (req, res) => {
  const {
    userId,
    itemId,
    locationId,
    quantity
  } = req.body;
  const assignment = await prisma.assignment.create({
    data: {
      userId: BigInt(userId),
      itemId: BigInt(itemId),
      locationId: BigInt(locationId),
      quantity: parseInt(quantity) || 1
    },
    include: {
      user: true,
      item: true,
      location: true
    }
  });
  res.status(201).json(assignment);
}));

// ─── Mobile Numbers ────────────────────────────────────────────────────────
app.get('/api/mobile-numbers', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const where = search ? {
    OR: [{
      number: {
        contains: search,
        mode: 'insensitive'
      }
    }, {
      assignedTo: {
        contains: search,
        mode: 'insensitive'
      }
    }, {
      user: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      }
    }, {
      provider: {
        contains: search,
        mode: 'insensitive'
      }
    }]
  } : {};
  const [data, total] = await Promise.all([prisma.mobileNumber.findMany({
    where,
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      number: 'asc'
    }
  }), prisma.mobileNumber.count({
    where
  })]);
  res.json({
    data: normalizeMobileRecord(data),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.get('/api/mobile-numbers/:id', authenticate, asyncHandler(async (req, res) => {
  const mobile = await prisma.mobileNumber.findUnique({
    where: {
      id: BigInt(req.params.id)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      },
      assignments: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      },
      recharges: {
        orderBy: {
          rechargeDate: 'desc'
        }
      }
    }
  });
  if (!mobile) return res.status(404).json({
    error: 'Mobile number not found'
  });
  res.json(normalizeMobileRecord(mobile));
}));
app.post('/api/mobile-numbers', authenticate, asyncHandler(async (req, res) => {
  const {
    number,
    provider,
    planDetails,
    status,
    assignedTo,
    userId,
    isDummy,
    nextRechargeDate
  } = req.body;

  let normalizedProvider;
  try {
    normalizedProvider = resolveMobileProvider(provider, { required: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  let resolvedAssignedTo = assignedTo || null;
  let resolvedUserId = userId ? BigInt(userId) : null;

  if (resolvedUserId) {
    const emp = await prisma.user.findUnique({ where: { id: resolvedUserId }, select: { name: true } });
    if (emp) resolvedAssignedTo = emp.name;
  }

  const mob = await prisma.mobileNumber.create({
    data: {
      number,
      provider: normalizedProvider,
      planDetails,
      status: status || 'AVAILABLE',
      assignedTo: resolvedAssignedTo,
      userId: resolvedUserId,
      isDummy: isDummy === true,
      assignedAt: resolvedAssignedTo ? new Date() : null,
      nextRechargeDate: nextRechargeDate ? new Date(nextRechargeDate) : null
    }
  });
  res.status(201).json(normalizeMobileRecord(mob));
}));
app.put('/api/mobile-numbers/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    number,
    provider,
    planDetails,
    status,
    assignedTo,
    userId,
    nextRechargeDate,
    isDummy
  } = req.body;

  let normalizedProvider;
  try {
    normalizedProvider = resolveMobileProvider(provider, { required: true });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // Resolve assignedTo name from userId if provided
  let resolvedAssignedTo = assignedTo || null;
  let resolvedUserId = userId ? BigInt(userId) : null;

  if (resolvedUserId) {
    const emp = await prisma.user.findUnique({ where: { id: resolvedUserId }, select: { name: true } });
    if (emp) resolvedAssignedTo = emp.name;
  } else {
    resolvedUserId = null;
  }

  const mob = await prisma.mobileNumber.update({
    where: { id: BigInt(req.params.id) },
    data: {
      number,
      provider: normalizedProvider,
      planDetails,
      status,
      assignedTo: resolvedAssignedTo,
      userId: resolvedUserId,
      isDummy: isDummy === true,
      assignedAt: resolvedAssignedTo ? new Date() : null,
      nextRechargeDate: nextRechargeDate ? new Date(nextRechargeDate) : null
    },
    include: { user: { select: { id: true, name: true, city: true, branch: true } } }
  });
  res.json(normalizeMobileRecord(mob));
}));
app.delete('/api/mobile-numbers/:id', authenticate, asyncHandler(async (req, res) => {
  await prisma.mobileNumber.delete({
    where: {
      id: BigInt(req.params.id)
    }
  });
  res.json({
    success: true
  });
}));
app.get('/api/internet-expenses', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const payee = req.query.payee;
  const where = payee && payee !== 'ALL' ? {
    payee: {
      contains: payee,
      mode: 'insensitive'
    }
  } : {};
  const [data, total, aggregates] = await Promise.all([prisma.internetExpense.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      date: 'desc'
    }
  }), prisma.internetExpense.count({
    where
  }), prisma.internetExpense.aggregate({
    where,
    _sum: {
      debit: true,
      credit: true
    }
  })]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    totals: {
      totalDebit: aggregates._sum.debit || 0,
      totalCredit: aggregates._sum.credit || 0
    }
  });
}));

// ─── Internet Bills ────────────────────────────────────────────────────────
app.get('/api/internet-bills', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([prisma.internetBill.findMany({
    skip,
    take: limit,
    include: {
      location: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  }), prisma.internetBill.count()]);
  res.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
}));
app.post('/api/internet-bills', authenticate, asyncHandler(async (req, res) => {
  const {
    provider,
    planDetails,
    speed,
    monthlyCost,
    dueDate,
    locationId,
    billingCycle,
    attachments
  } = req.body;
  const bill = await prisma.internetBill.create({
    data: {
      provider,
      planDetails,
      speed: speed ? parseInt(speed) : null,
      monthlyCost: parseFloat(monthlyCost),
      dueDate: dueDate ? new Date(dueDate) : null,
      attachments: attachments || null,
      locationId: locationId ? BigInt(locationId) : null,
      billingCycle
    },
    include: {
      location: true
    }
  });
  res.status(201).json(bill);
}));
app.put('/api/internet-bills/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    provider,
    planDetails,
    speed,
    monthlyCost,
    dueDate,
    status,
    locationId,
    billingCycle,
    attachments
  } = req.body;
  const bill = await prisma.internetBill.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      provider,
      planDetails,
      speed: speed ? parseInt(speed) : null,
      monthlyCost: parseFloat(monthlyCost),
      dueDate: dueDate ? new Date(dueDate) : null,
      attachments: attachments || null,
      status,
      locationId: locationId ? BigInt(locationId) : null,
      billingCycle
    },
    include: {
      location: true
    }
  });
  res.json(bill);
}));
app.delete('/api/internet-bills/:id', authenticate, asyncHandler(async (req, res) => {
  await prisma.internetBill.delete({
    where: {
      id: BigInt(req.params.id)
    }
  });
  res.json({
    success: true
  });
}));

// ─── Generic DB Admin (for model-level CRUD) ───────────────────────────────
const MODEL_MAP = {
  users: 'user',
  categories: 'category',
  vendors: 'vendor',
  locations: 'location',
  items: 'item',
  stocks: 'stock',
  transactions: 'transaction',
  assignments: 'assignment',
  'mobile-numbers': 'mobileNumber',
  'internet-bills': 'internetBill'
};
app.get('/api/admin/database/:model', authenticate, asyncHandler(async (req, res) => {
  const model = MODEL_MAP[req.params.model];
  if (!model) return res.status(404).json({
    error: 'Unknown model'
  });
  const data = await prisma[model].findMany({
    take: 500
  });
  res.json(data);
}));

// ─── File Attachments System ───────────────────────────────────────────────
app.post('/api/upload', authenticate, upload.array('files', 10), (req, res) => {
  try {
    const fileUrls = req.files.map(file => `http://localhost:5001/uploads/${file.filename}`);
    res.json({
      success: true,
      urls: fileUrls
    });
  } catch (e) {
    res.status(500).json({
      error: e.message
    });
  }
});

// ─── Active Session Vector (/api/me) ───────────────────────────────────────
app.get('/api/me', authenticate, asyncHandler(async (req, res) => {
  if (req.user.id === 'admin') {
    return res.json({
      id: 'admin',
      name: 'Jan Saida Shaik',
      email: 'jansaida@codegnan.com',
      password: null,
      role: 'ADMIN',
      city: 'Vijayawada',
      branch: 'Main Office',
      phone: '+91 9999999999',
      createdAt: new Date(1779369773479),
      updatedAt: new Date(1779369773479),
      assignments: [],
      mobileNumbers: []
    });
  }
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(req.user.id)
    },
    include: {
      assignments: {
        where: {
          status: 'ACTIVE'
        },
        include: {
          item: true,
          location: true
        }
      },
      mobileNumbers: true
    }
  });
  if (!user) return res.status(401).json({
    error: 'User no longer exists'
  });
  res.json(user);
}));
app.put('/api/me', authenticate, asyncHandler(async (req, res) => {
  if (req.user.id === 'admin') {
    return res.status(403).json({
      error: 'Superadmin configuration is static.'
    });
  }
  const {
    name,
    email,
    password,
    phone,
    city,
    branch
  } = req.body;
  const user = await prisma.user.update({
    where: {
      id: BigInt(req.user.id)
    },
    data: {
      name,
      email,
      password,
      phone,
      city,
      branch
    }
  });
  res.json(user);
}));

// ─── Service Request Support System ───────────────────────────────────────
app.get('/api/service-requests', authenticate, asyncHandler(async (req, res) => {
  const where = req.user.role !== 'ADMIN' ? {
    userId: BigInt(req.user.id)
  } : {};
  const reqs = await prisma.serviceRequest.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      item: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  res.json(reqs);
}));
app.post('/api/service-requests', authenticate, asyncHandler(async (req, res) => {
  const {
    title,
    description,
    itemId
  } = req.body;
  const reqObj = await prisma.serviceRequest.create({
    data: {
      title,
      description,
      userId: BigInt(req.user.id === 'admin' ? 1 : req.user.id),
      itemId: itemId ? BigInt(itemId) : null
    },
    include: {
      user: true
    }
  });
  res.status(201).json(reqObj);
}));
app.put('/api/service-requests/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    status
  } = req.body;
  const reqObj = await prisma.serviceRequest.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      status
    }
  });
  res.json(reqObj);
}));

// ─── Onboarding Checklists ───────────────────────────────────────────────
app.get('/api/onboarding', authenticate, asyncHandler(async (req, res) => {
  const obs = await prisma.onboardingChecklist.findMany({
    orderBy: {
      updatedAt: 'desc'
    }
  });
  res.json(obs);
}));
app.post('/api/onboarding', authenticate, asyncHandler(async (req, res) => {
  const {
    employeeName,
    role,
    laptop,
    mouse,
    keyboard,
    headset,
    simCard,
    notes
  } = req.body;
  const ob = await prisma.onboardingChecklist.create({
    data: {
      employeeName,
      role,
      status: 'PENDING',
      laptop: !!laptop,
      mouse: !!mouse,
      keyboard: !!keyboard,
      headset: !!headset,
      simCard: !!simCard,
      notes
    }
  });
  res.status(201).json(ob);
}));
app.put('/api/onboarding/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    employeeName,
    role,
    status,
    laptop,
    mouse,
    keyboard,
    headset,
    simCard,
    notes
  } = req.body;
  const ob = await prisma.onboardingChecklist.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      employeeName,
      role,
      status,
      laptop: laptop !== undefined ? !!laptop : undefined,
      mouse: mouse !== undefined ? !!mouse : undefined,
      keyboard: keyboard !== undefined ? !!keyboard : undefined,
      headset: headset !== undefined ? !!headset : undefined,
      simCard: simCard !== undefined ? !!simCard : undefined,
      notes
    }
  });
  res.json(ob);
}));

// ─── Placement Orders ────────────────────────────────────────────────────
app.get('/api/placements', authenticate, asyncHandler(async (req, res) => {
  const orders = await prisma.placementOrder.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
  res.json(orders);
}));
app.post('/api/placements', authenticate, asyncHandler(async (req, res) => {
  const {
    title,
    branchName,
    quantity
  } = req.body;
  const order = await prisma.placementOrder.create({
    data: {
      title,
      branchName,
      quantity: parseInt(quantity) || 1
    }
  });
  res.status(201).json(order);
}));
app.put('/api/placements/:id', authenticate, asyncHandler(async (req, res) => {
  const {
    status
  } = req.body;
  const order = await prisma.placementOrder.update({
    where: {
      id: BigInt(req.params.id)
    },
    data: {
      status
    }
  });
  res.json(order);
}));
let server;
async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

  try {
    await prisma.$connect();
    server = app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      console.error(formatDatabaseConnectionMessage());
      console.error('Start PostgreSQL and verify apps/backend/.env before restarting the backend.');
    } else {
      console.error('Failed to start backend:', err);
    }
    process.exit(1);
  }
}
startServer();

// Graceful shutdown — drain pool on restart so nodemon doesn't leave zombie connections
async function gracefulShutdown(signal) {
  console.log(`[${signal}] Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      try {
        await prisma.$disconnect();
        await pool.end();
        console.log('Pool and Prisma disconnected cleanly.');
      } catch (e) {
        console.error('Shutdown error:', e.message);
      }
      process.exit(0);
    });
  } else {
    try {
      await prisma.$disconnect();
      await pool.end();
      console.log('Pool and Prisma disconnected cleanly.');
    } catch (e) {
      console.error('Shutdown error:', e.message);
    }
    process.exit(0);
  }
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = app;
