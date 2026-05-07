import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Table } from '../../components/ui/Table';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { BranchBadge } from '../../components/shared/BranchBadge';

import { getAppointments, updateAppointmentStatus, cancelAppointment } from '../../services/appointment.service';
import { useToast } from '../../hooks/useToast';
import { BRANCHES } from '../../constants';

export default function AppointmentDetails() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [branchFilter, setBranchFilter] = useState('');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', dateFilter, branchFilter],
    queryFn: () => getAppointments({ date: dateFilter, branch: branchFilter }),
  });

  const statusMutation = useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      showSuccess('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: showError,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      showSuccess('Appointment cancelled');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: showError,
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`, {
      header: 'Patient Name',
      id: 'patientName'
    }),
    columnHelper.accessor('patient.fileId', { header: 'File ID' }),
    columnHelper.accessor('time', { header: 'Time' }),
    columnHelper.accessor('branch', {
      header: 'Branch',
      cell: info => <BranchBadge branch={info.getValue()} />
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => {
        const { id, status } = info.row.original;
        return (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleStatusChange(id, 'IN')} 
              disabled={status === 'IN' || status === 'CLOSED' || status === 'CANCELLED'}
              className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-medium hover:bg-teal-200 disabled:opacity-50 transition-colors"
            >
              IN
            </button>
            <button 
              onClick={() => handleStatusChange(id, 'CLOSED')} 
              disabled={status === 'CLOSED' || status === 'CANCELLED'}
              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              Closed
            </button>
            <button 
              onClick={() => cancelMutation.mutate(id)} 
              disabled={status === 'CANCELLED' || status === 'CLOSED'}
              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        );
      }
    })
  ];

  const table = useReactTable({
    data: appointments || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <Input 
          type="date" 
          label="Date" 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)} 
          className="w-full sm:w-48"
        />
        <Select 
          label="Branch"
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          options={[{value: '', label: 'All Branches'}, ...BRANCHES]}
          className="w-full sm:w-48"
        />
      </div>

      <Table table={table} isLoading={isLoading} />
    </div>
  );
}
