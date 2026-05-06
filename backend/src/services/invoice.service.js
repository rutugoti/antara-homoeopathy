'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Auto-generate the next invoice number: INV-00001, INV-00002, etc.
 */
const generateInvoiceNo = async () => {
  const latest = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { invoiceNo: true },
  });

  if (!latest) return 'INV-00001';

  const parts = latest.invoiceNo.split('-');
  const next  = parseInt(parts[1], 10) + 1;
  return `INV-${String(next).padStart(5, '0')}`;
};

/**
 * Get all invoices for a patient, paginated.
 */
const getInvoices = async (patientId, { page = 1, limit = 10 }) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const skip = (page - 1) * limit;

  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where: { patientId } }),
  ]);

  return {
    invoices,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Create a new invoice for a patient.
 */
const createInvoice = async (patientId, data) => {
  const { diagnosis, prescriptionDate, prescription, amount } = data;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, firstName: true, lastName: true, fileId: true },
  });

  if (!patient) {
    throw new ApiError(404, `Patient with id "${patientId}" not found.`);
  }

  const invoiceNo = await generateInvoiceNo();

  const invoice = await prisma.invoice.create({
    data: {
      patientId,
      invoiceNo,
      diagnosis,
      prescriptionDate: new Date(prescriptionDate),
      prescription,
      amount: amount ? parseFloat(amount) : null,
    },
  });

  return {
    ...invoice,
    patientName: `${patient.firstName} ${patient.lastName}`,
    fileId: patient.fileId,
  };
};

/**
 * Get a single invoice by id.
 */
const getInvoiceById = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      patient: {
        select: {
          id: true,
          fileId: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          address: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new ApiError(404, `Invoice with id "${invoiceId}" not found.`);
  }

  return invoice;
};

/**
 * Delete an invoice by id.
 */
const deleteInvoice = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true },
  });

  if (!invoice) {
    throw new ApiError(404, `Invoice with id "${invoiceId}" not found.`);
  }

  await prisma.invoice.delete({
    where: { id: invoiceId },
  });

  return { message: 'Invoice deleted successfully.' };
};

module.exports = {
  generateInvoiceNo,
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice,
};
