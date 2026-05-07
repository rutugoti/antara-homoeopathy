import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

import { getClinics, createClinic, updateClinic, deleteClinic } from '../../services/clinic.service';
import { BRANCHES } from '../../constants';

export default function Clinics() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['clinics', page, limit],
    queryFn: () => getClinics({ page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: createClinic,
    onSuccess: () => {
      showSuccess('Clinic created');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: updateClinic,
    onSuccess: () => {
      showSuccess('Clinic updated');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClinic,
    onSuccess: () => {
      showSuccess('Clinic deleted');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
    onError: showError,
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    reset(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    reset({ officeType: '', title: '', address: '', contact: '', location: '' });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (d) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, payload: d });
    } else {
      createMutation.mutate(d);
    }
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('officeId', { header: 'Office ID' }),
    columnHelper.accessor('officeType', { header: 'Office Type' }),
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('contact', { header: 'Contact No' }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(info.row.original)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { setItemToDelete(info.row.original.id); setIsDeleteOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    })
  ];

  const table = useReactTable({ data: data?.clinics || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Clinic Information">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">Clinics</h1>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Clinic</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <Table table={table} isLoading={isLoading} />
        {data && (
          <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Clinic" : "Add Clinic"}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Select label="Office Type *" options={BRANCHES} placeholder="Select Office Type" {...register('officeType', { required: true })} />
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="Contact Number *" {...register('contact', { required: true })} />
          <Input label="Map Link / Location" {...register('location')} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-dark)]">Address *</label>
            <textarea 
              {...register('address', { required: true })}
              className="flex w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-medium)] min-h-[80px]"
            />
          </div>
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteMutation.mutate(itemToDelete)} 
        title="Delete Clinic" message="Are you sure you want to delete this clinic?" isLoading={deleteMutation.isPending} 
      />
    </PageWrapper>
  );
}
