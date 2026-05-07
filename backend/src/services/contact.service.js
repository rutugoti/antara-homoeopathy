'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/apiResponse');

/**
 * Get all contacts, paginated with search.
 */
const getAllContacts = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search && search.trim() !== '') {
    where.OR = [
      { name:        { contains: search, mode: 'insensitive' } },
      { contact:     { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [contacts, totalCount] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    limit,
  };
};

/**
 * Create a new contact.
 */
const createContact = async (data) => {
  const { name, contact, description, subscribed } = data;

  return prisma.contact.create({
    data: {
      name,
      contact,
      description: description ?? null,
      subscribed:  subscribed !== undefined ? subscribed : false,
    },
  });
};

/**
 * Delete a contact.
 */
const deleteContact = async (id) => {
  const existing = await prisma.contact.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, `Contact with id "${id}" not found.`);
  }

  await prisma.contact.delete({ where: { id } });
  return { message: 'Contact deleted successfully.' };
};

/**
 * Export all contacts as CSV string.
 * Returns raw CSV text to be sent as a file download.
 */
const exportContactsCSV = async () => {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // CSV header
  const header = 'Name,Contact,Description,Subscribed,Created Date';

  const rows = contacts.map((c) => {
    const name        = `"${(c.name || '').replace(/"/g, '""')}"`;
    const contact     = `"${(c.contact || '').replace(/"/g, '""')}"`;
    const description = `"${(c.description || '').replace(/"/g, '""')}"`;
    const subscribed  = c.subscribed ? 'Yes' : 'No';
    const createdDate = c.createdAt.toISOString().split('T')[0];
    return `${name},${contact},${description},${subscribed},${createdDate}`;
  });

  return [header, ...rows].join('\n');
};

module.exports = {
  getAllContacts,
  createContact,
  deleteContact,
  exportContactsCSV,
};
