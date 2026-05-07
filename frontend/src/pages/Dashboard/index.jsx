import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { BranchBadge } from '../../components/shared/BranchBadge';
import { getDashboardAppointments, updateDashboardAppointmentStatus, getDashboardHolidays, getDashboardEvents } from '../../services/dashboard.service';
import { useToast } from '../../hooks/useToast';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: appointments, isLoading: isLoadingAppts } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: getDashboardAppointments
  });

  const { data: holidays, isLoading: isLoadingHolidays } = useQuery({
    queryKey: ['dashboard-holidays'],
    queryFn: getDashboardHolidays
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: getDashboardEvents
  });

  const statusMutation = useMutation({
    mutationFn: updateDashboardAppointmentStatus,
    onSuccess: () => {
      showSuccess('Appointment status updated');
      queryClient.invalidateQueries({ queryKey: ['dashboard-appointments'] });
    },
    onError: showError
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  const apptColumnHelper = createColumnHelper();
  const apptColumns = [
    apptColumnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`, {
      header: 'Patient Name',
      id: 'patientName'
    }),
    apptColumnHelper.accessor('patient.fileId', {
      header: 'File ID',
    }),
    apptColumnHelper.accessor('time', {
      header: 'Time',
    }),
    apptColumnHelper.accessor('branch', {
      header: 'Branch',
      cell: info => <BranchBadge branch={info.getValue()} />
    }),
    apptColumnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />
    }),
    apptColumnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => {
        const id = info.row.original.id;
        const status = info.row.original.status;
        return (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleStatusChange(id, 'IN')} 
              disabled={status === 'IN' || status === 'CLOSED' || status === 'CANCELLED'}
              className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-medium hover:bg-teal-200 disabled:opacity-50"
            >
              IN
            </button>
            <button 
              onClick={() => handleStatusChange(id, 'CLOSED')} 
              disabled={status === 'CLOSED' || status === 'CANCELLED'}
              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200 disabled:opacity-50"
            >
              Closed
            </button>
            <button 
              onClick={() => handleStatusChange(id, 'CANCELLED')} 
              disabled={status === 'CANCELLED' || status === 'CLOSED'}
              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        );
      }
    })
  ];

  const apptTable = useReactTable({
    data: appointments || [],
    columns: apptColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const holidayColumnHelper = createColumnHelper();
  const holidayColumns = [
    holidayColumnHelper.accessor('title', { header: 'Title' }),
    holidayColumnHelper.accessor('date', { 
      header: 'Date',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    }),
    holidayColumnHelper.accessor('morningTime', { 
      header: 'Morning Time',
      cell: info => info.getValue() || <span className="text-slate-400">Closed</span>
    }),
    holidayColumnHelper.accessor('afternoonTime', { 
      header: 'Afternoon Time',
      cell: info => info.getValue() || <span className="text-slate-400">Closed</span>
    }),
  ];

  const holidayTable = useReactTable({
    data: holidays || [],
    columns: holidayColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageWrapper title="Dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Section - 70% width */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-main)] flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">Today's Appointments</h2>
              <Link to="/appointments/details">
                <Button variant="secondary" size="sm">View All</Button>
              </Link>
            </div>
            <div className="p-4">
              <Table table={apptTable} isLoading={isLoadingAppts} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-main)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">Holidays</h2>
            </div>
            <div className="p-4">
              <Table table={holidayTable} isLoading={isLoadingHolidays} />
            </div>
          </div>
        </div>

        {/* Right Section - 30% width */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border-main)]">
              <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">Upcoming Events</h2>
            </div>
            <div className="p-4 space-y-4">
              {isLoadingEvents ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded border border-[var(--color-border-main)]"></div>
                  ))}
                </div>
              ) : events?.length > 0 ? (
                events.map(event => (
                  <div key={event.id} className="border border-[var(--color-border-main)] rounded p-4 hover:bg-slate-50 transition-colors">
                    <h3 className="font-semibold text-[var(--color-primary)]">{event.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    <div className="mt-2 text-xs bg-blue-100 text-blue-800 inline-block px-2 py-0.5 rounded">
                      {event.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">No upcoming events</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
