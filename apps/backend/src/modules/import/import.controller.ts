import { Request, Response } from 'express';
import { prisma } from '../../prisma';

export const bulkImport = async (req: Request, res: Response) => {
  try {
    const { module } = req.params;
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of records.' });
    }

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'No data found to import.' });
    }

    let result;
    
    // Dynamic switch to handle different modules
    switch (String(module).toLowerCase()) {
      case 'users':
        result = await importUsers(data);
        break;
      case 'vendors':
        result = await importVendors(data);
        break;
      case 'locations':
        result = await importLocations(data);
        break;
      case 'items':
        result = await importItems(data);
        break;
      case 'mobiles':
        result = await importMobiles(data);
        break;
      // Add more cases here as needed
      default:
        return res.status(400).json({ success: false, message: `Import for module '${module}' is not supported yet.` });
    }

    return res.json({
      success: true,
      importedCount: result.count || 0,
      skippedCount: data.length - (result.count || 0)
    });

  } catch (error: any) {
    console.error(`Import Error:`, error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error during import.' });
  }
};

// --- Module specific import functions ---

async function importUsers(data: any[]) {
  // Map spreadsheet columns to database fields
  const formattedData = data.map((row: any) => ({
    name: row['Name'] || row.name,
    email: row['Email'] || row.email,
    password: row['Password'] || row.password || 'welcome123', // Default password if not provided
    role: row['Role'] || row.role || 'STAFF',
    phone: row['Phone'] || row.phone,
    department: row['Department'] || row.department || 'GENERAL'
  })).filter(row => row.name && row.email); // Basic validation: must have name and email

  return await prisma.user.createMany({
    data: formattedData,
    skipDuplicates: true
  });
}

async function importVendors(data: any[]) {
  const formattedData = data.map((row: any) => ({
    name: row['Name'] || row.name,
    contact: row['Contact'] || row.contact
  })).filter(row => row.name);

  return await prisma.vendor.createMany({
    data: formattedData,
    skipDuplicates: true
  });
}

async function importLocations(data: any[]) {
  const formattedData = data.map((row: any) => ({
    name: row['Name'] || row.name,
    city: row['City'] || row.city,
    isMaster: row['Is Master'] === true || row['isMaster'] === 'true' || row.isMaster === true
  })).filter(row => row.name);

  return await prisma.location.createMany({
    data: formattedData,
    skipDuplicates: true
  });
}

async function importItems(data: any[]) {
  const formattedData = data.map((row: any) => {
    // For items, categoryId is required. Assuming users provide a raw ID or we map it somehow.
    // To make this fully robust, we would look up Category names, but for bulk imports
    // keeping it simple with Category ID for now, or defaulting.
    return {
      name: row['Name'] || row.name,
      description: row['Description'] || row.description,
      categoryId: parseInt(row['Category ID'] || row.categoryId || '1'), 
      vendorId: row['Vendor ID'] || row.vendorId ? parseInt(row['Vendor ID'] || row.vendorId) : null
    };
  }).filter(row => row.name);

  return await prisma.item.createMany({
    data: formattedData,
    skipDuplicates: true
  });
}

async function importMobiles(data: any[]) {
  const formattedData = data.map((row: any) => ({
    number: String(row['Number'] || row.number),
    provider: row['Provider'] || row.provider,
    planDetails: row['Plan Details'] || row.planDetails,
    status: row['Status'] || row.status || 'AVAILABLE'
  })).filter(row => row.number);

  return await prisma.mobileNumber.createMany({
    data: formattedData,
    skipDuplicates: true
  });
}
