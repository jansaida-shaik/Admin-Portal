require('dotenv').config();
const { prisma, pool } = require('./src/prisma');
const {
  MOBILE_PROVIDER_OPTIONS,
  normalizeMobileProvider,
  resolveMobileProvider
} = require('./src/utils/mobileProviders');

async function main() {
  console.log('Normalizing mobile providers to portal standard values...');

  const rows = await prisma.mobileNumber.findMany({
    select: {
      id: true,
      number: true,
      provider: true
    },
    orderBy: {
      number: 'asc'
    }
  });

  let updated = 0;
  const unsupported = [];

  for (const row of rows) {
    const normalized = normalizeMobileProvider(row.provider);

    if (!normalized) {
      continue;
    }

    try {
      const canonicalProvider = resolveMobileProvider(normalized, {
        required: true
      });

      if (canonicalProvider !== row.provider) {
        await prisma.mobileNumber.update({
          where: {
            id: row.id
          },
          data: {
            provider: canonicalProvider
          }
        });
        updated += 1;
        console.log(`Updated ${row.number}: ${row.provider || 'null'} -> ${canonicalProvider}`);
      }
    } catch (error) {
      unsupported.push({
        number: row.number,
        provider: row.provider,
        message: error.message
      });
    }
  }

  const counts = await prisma.mobileNumber.groupBy({
    by: ['provider'],
    _count: {
      provider: true
    },
    orderBy: {
      provider: 'asc'
    }
  });

  console.log(`\nUpdated ${updated} mobile provider records.`);
  console.log(`Supported providers: ${MOBILE_PROVIDER_OPTIONS.join(', ')}`);
  console.log('Current provider counts:');
  for (const entry of counts) {
    console.log(`- ${entry.provider || 'null'}: ${entry._count.provider}`);
  }

  if (unsupported.length > 0) {
    console.log('\nUnsupported provider values still present:');
    for (const row of unsupported) {
      console.log(`- ${row.number}: ${row.provider}`);
    }
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
