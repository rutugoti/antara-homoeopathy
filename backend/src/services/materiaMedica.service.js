'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all materia medica entries, paginated with search.
 */
const getAllMateriaMedica = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search && search.trim() !== '') {
    where.OR = [
      { code:        { contains: search, mode: 'insensitive' } },
      { productName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [entries, totalCount] = await Promise.all([
    prisma.materiaMedica.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.materiaMedica.count({ where }),
  ]);

  return {
    entries,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Get a single materia medica entry by id.
 */
const getMateriaMedicaById = async (id) => {
  const entry = await prisma.materiaMedica.findUnique({ where: { id } });

  if (!entry) {
    throw new ApiError(404, `Materia Medica entry with id "${id}" not found.`);
  }

  return entry;
};

/**
 * Create a new materia medica entry.
 */
const createMateriaMedica = async (data) => {
  const { code, productName, potency6CH, potency30CH, potency200CH, potency1M } = data;

  const existing = await prisma.materiaMedica.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, `Materia Medica entry with code "${code}" already exists.`);
  }

  return prisma.materiaMedica.create({
    data: {
      code,
      productName,
      potency6CH:   potency6CH   ?? null,
      potency30CH:  potency30CH  ?? null,
      potency200CH: potency200CH ?? null,
      potency1M:    potency1M    ?? null,
    },
  });
};

/**
 * Update an existing materia medica entry.
 */
const updateMateriaMedica = async (id, data) => {
  const { code, productName, potency6CH, potency30CH, potency200CH, potency1M } = data;

  const existing = await prisma.materiaMedica.findUnique({
    where: { id },
    select: { id: true, code: true },
  });

  if (!existing) {
    throw new ApiError(404, `Materia Medica entry with id "${id}" not found.`);
  }

  // If code is changing, check uniqueness
  if (code && code !== existing.code) {
    const codeTaken = await prisma.materiaMedica.findUnique({
      where: { code },
      select: { id: true },
    });
    if (codeTaken) {
      throw new ApiError(409, `Materia Medica entry with code "${code}" already exists.`);
    }
  }

  const updateData = {};
  if (code         !== undefined) updateData.code         = code;
  if (productName  !== undefined) updateData.productName  = productName;
  if (potency6CH   !== undefined) updateData.potency6CH   = potency6CH;
  if (potency30CH  !== undefined) updateData.potency30CH  = potency30CH;
  if (potency200CH !== undefined) updateData.potency200CH = potency200CH;
  if (potency1M    !== undefined) updateData.potency1M    = potency1M;

  return prisma.materiaMedica.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Delete a materia medica entry.
 */
const deleteMateriaMedica = async (id) => {
  const existing = await prisma.materiaMedica.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Materia Medica entry with id "${id}" not found.`);
  }

  await prisma.materiaMedica.delete({ where: { id } });
  return { message: 'Materia Medica entry deleted successfully.' };
};

/**
 * Import materia medica entries from a CSV buffer.
 *
 * Expected CSV columns (header row required):
 *   Code, Product Name, 6 CH / 106F, 30 CH / 130F, 200 CH / 150F, 1M / 160F
 *
 * - Skips rows with missing Code or Product Name.
 * - Skips rows where the Code already exists (no duplicates).
 * - Returns counts of imported, skipped, and failed rows.
 */
const importFromCSV = async (buffer) => {
  const content = buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '');

  if (lines.length < 2) {
    throw new ApiError(400, 'CSV file must have a header row and at least one data row.');
  }

  // Parse header to determine column mapping
  const header = lines[0].split(',').map((h) => h.trim());

  const colMap = {
    code:         header.findIndex((h) => /code/i.test(h)),
    productName:  header.findIndex((h) => /product\s*name/i.test(h)),
    potency6CH:   header.findIndex((h) => /6\s*CH/i.test(h)),
    potency30CH:  header.findIndex((h) => /30\s*CH/i.test(h)),
    potency200CH: header.findIndex((h) => /200\s*CH/i.test(h)),
    potency1M:    header.findIndex((h) => /1M/i.test(h)),
  };

  if (colMap.code === -1 || colMap.productName === -1) {
    throw new ApiError(400, 'CSV must contain "Code" and "Product Name" columns.');
  }

  // Get all existing codes to skip duplicates
  const existingCodes = new Set(
    (await prisma.materiaMedica.findMany({ select: { code: true } }))
      .map((e) => e.code.toUpperCase())
  );

  const dataRows = lines.slice(1);
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  const batchData = [];

  for (let i = 0; i < dataRows.length; i++) {
    const cols = dataRows[i].split(',').map((c) => c.trim());

    const code        = cols[colMap.code]        || '';
    const productName = cols[colMap.productName]  || '';

    if (!code || !productName) {
      skipped++;
      continue;
    }

    if (existingCodes.has(code.toUpperCase())) {
      skipped++;
      continue;
    }

    batchData.push({
      code,
      productName,
      potency6CH:   colMap.potency6CH   !== -1 ? (cols[colMap.potency6CH]   || null) : null,
      potency30CH:  colMap.potency30CH  !== -1 ? (cols[colMap.potency30CH]  || null) : null,
      potency200CH: colMap.potency200CH !== -1 ? (cols[colMap.potency200CH] || null) : null,
      potency1M:    colMap.potency1M    !== -1 ? (cols[colMap.potency1M]    || null) : null,
    });

    existingCodes.add(code.toUpperCase()); // prevent duplicates within the same file
  }

  // Batch insert
  if (batchData.length > 0) {
    try {
      const result = await prisma.materiaMedica.createMany({
        data: batchData,
        skipDuplicates: true,
      });
      imported = result.count;
      failed = batchData.length - result.count;
    } catch (err) {
      errors.push(err.message);
      failed = batchData.length;
    }
  }

  return {
    totalRows: dataRows.length,
    imported,
    skipped,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  };
};

module.exports = {
  getAllMateriaMedica,
  getMateriaMedicaById,
  createMateriaMedica,
  updateMateriaMedica,
  deleteMateriaMedica,
  importFromCSV,
};
