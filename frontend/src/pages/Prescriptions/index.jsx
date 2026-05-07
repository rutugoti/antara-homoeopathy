import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBar } from '../../components/ui/SearchBar';
import { getPrescriptions } from '../../services/prescription.service';

export default function Prescriptions() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', page, limit, search],
    queryFn: () => getPrescriptions({ page, limit, search }),
  });

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`, {
      header: 'Patient Name',
      id: 'patientName'
    }),
    columnHelper.accessor('patient.fileId', { header: 'File ID' }),
    columnHelper.accessor('title', { header: 'Prescription Title' }),
    columnHelper.accessor('list', { header: 'Details' }),
    columnHelper.accessor('createdAt', { 
      header: 'Date',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    }),
  ];

  const table = useReactTable({
    data: data?.prescriptions || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageWrapper title="Prescription">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">All Prescriptions</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <div className="p-4 border-b border-[var(--color-border-main)] flex justify-end">
          <div className="w-full sm:w-64">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          </div>
        </div>
        <Table table={table} isLoading={isLoading} />
        {data && (
          <Pagination 
            currentPage={data.currentPage}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            limit={data.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </PageWrapper>
  );
}
