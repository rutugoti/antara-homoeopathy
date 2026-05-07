import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { SearchBar } from '../../components/ui/SearchBar';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PatientForm } from '../../components/shared/PatientForm';

import { getPatients, createPatient, updatePatient, deletePatient } from '../../services/patient.service';
import { useToast } from '../../hooks/useToast';
import { BRANCHES } from '../../constants';

export default function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, limit, search, branchFilter],
    queryFn: () => getPatients({ page, limit, search, branch: branchFilter }),
  });

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      showSuccess('Patient created successfully');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      showSuccess('Patient updated successfully');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      showSuccess('Patient deleted successfully');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: showError,
  });

  const handleAdd = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setPatientToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(patientToDelete);
  };

  const handleFormSubmit = (formData) => {
    if (selectedPatient) {
      updateMutation.mutate({ id: selectedPatient.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleBookAppointment = (fileId) => {
    navigate(`/appointments/book?fileId=${fileId}`);
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      header: 'Name',
      id: 'name',
      cell: info => (
        <div className="flex items-center space-x-3">
          {info.row.original.profileImage ? (
            <img src={info.row.original.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
              {info.row.original.firstName[0]}
            </div>
          )}
          <span className="font-medium text-[var(--color-primary)]">{info.getValue()}</span>
        </div>
      )
    }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor(row => row.phone || row.mobileNo, { id: 'mobileNo', header: 'Mobile No' }),
    columnHelper.accessor('fileId', { header: 'File ID' }),
    columnHelper.accessor('bloodGroup', { header: 'Blood Group' }),
    columnHelper.accessor('createdAt', { 
      header: 'Created Date',
      cell: info => new Date(info.getValue()).toLocaleDateString()
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => {
        const patient = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <button onClick={() => handleEdit(patient)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(patient.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(`/patients/${patient.id}`)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded" title="Details">
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleBookAppointment(patient.fileId)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded" title="Book Appointment">
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }),
  ];

  const table = useReactTable({
    data: data?.patients || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <PageWrapper title="Patient">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">Patients</h1>
        <Button onClick={handleAdd}>Add New Patient</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <div className="p-4 border-b border-[var(--color-border-main)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Select 
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              options={[{value: '', label: 'All Branches'}, ...BRANCHES]}
              className="w-40"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">Show</span>
              <Select 
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                options={[
                  {value: 10, label: '10'},
                  {value: 25, label: '25'},
                  {value: 50, label: '50'}
                ]}
                className="w-20"
              />
              <span className="text-sm text-slate-500">entries</span>
            </div>
          </div>
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

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={selectedPatient ? "Edit Patient" : "Add New Patient"}
      >
        <PatientForm 
          initialData={selectedPatient} 
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </PageWrapper>
  );
}
