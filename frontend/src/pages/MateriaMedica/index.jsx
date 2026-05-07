import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Upload, Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { SearchBar } from '../../components/ui/SearchBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

import { getMateriaMedicas, createMateriaMedica, updateMateriaMedica, deleteMateriaMedica, importMateriaMedicaCsv } from '../../services/materia.service';

export default function MateriaMedica() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['materia', page, limit, search],
    queryFn: () => getMateriaMedicas({ page, limit, search }),
  });

  const createMutation = useMutation({
    mutationFn: createMateriaMedica,
    onSuccess: () => {
      showSuccess('Remedy created');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['materia'] });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: updateMateriaMedica,
    onSuccess: () => {
      showSuccess('Remedy updated');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['materia'] });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMateriaMedica,
    onSuccess: () => {
      showSuccess('Remedy deleted');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['materia'] });
    },
    onError: showError,
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    reset({
      code: item.code,
      productName: item.productName,
      potency6CH: !!item.potency6CH,
      potency30CH: !!item.potency30CH,
      potency200CH: !!item.potency200CH,
      potency1M: !!item.potency1M,
    });
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    reset({ code: '', productName: '', potency6CH: false, potency30CH: false, potency200CH: false, potency1M: false });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (d) => {
    const payload = {
      code: d.code,
      productName: d.productName,
      potency6CH: d.potency6CH ? 'Yes' : null,
      potency30CH: d.potency30CH ? 'Yes' : null,
      potency200CH: d.potency200CH ? 'Yes' : null,
      potency1M: d.potency1M ? 'Yes' : null,
    };
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await importMateriaMedicaCsv(formData);
      showSuccess('CSV imported successfully');
      queryClient.invalidateQueries({ queryKey: ['materia'] });
    } catch (err) {
      showError(err);
    }
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('code', { header: 'Code' }),
    columnHelper.accessor('productName', { header: 'Remedy Name' }),
    columnHelper.accessor('potency6CH', { header: '6 CH', cell: info => info.getValue() ? 'Yes' : '-' }),
    columnHelper.accessor('potency30CH', { header: '30 CH', cell: info => info.getValue() ? 'Yes' : '-' }),
    columnHelper.accessor('potency200CH', { header: '200 CH', cell: info => info.getValue() ? 'Yes' : '-' }),
    columnHelper.accessor('potency1M', { header: '1 M', cell: info => info.getValue() ? 'Yes' : '-' }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(info.row.original)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { setItemToDelete(info.row.original.id); setIsDeleteOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    })
  ];

  const table = useReactTable({ data: data?.entries || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Materia Medica">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">Materia Medica</h1>
        <div className="flex space-x-3">
          <label className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 text-sm bg-transparent hover:bg-slate-100 text-[var(--color-text-dark)] border border-[var(--color-border-main)] cursor-pointer">
            <Upload className="w-4 h-4 mr-2" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Remedy</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <div className="p-4 border-b border-[var(--color-border-main)] flex justify-end">
          <div className="w-full sm:w-64">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
          </div>
        </div>
        <Table table={table} isLoading={isLoading} />
        {data && (
          <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Remedy" : "Add Remedy"}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input label="Code *" {...register('code', { required: true })} />
          <Input label="Remedy Name *" {...register('productName', { required: true })} />
          <div className="flex space-x-6 pt-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('potency6CH')} className="rounded border-slate-300 text-[var(--color-primary)] h-4 w-4" />
              <span className="text-sm">6 CH</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('potency30CH')} className="rounded border-slate-300 text-[var(--color-primary)] h-4 w-4" />
              <span className="text-sm">30 CH</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('potency200CH')} className="rounded border-slate-300 text-[var(--color-primary)] h-4 w-4" />
              <span className="text-sm">200 CH</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('potency1M')} className="rounded border-slate-300 text-[var(--color-primary)] h-4 w-4" />
              <span className="text-sm">1 M</span>
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} 
        onConfirm={() => deleteMutation.mutate(itemToDelete)} 
        title="Delete Remedy" message="Are you sure you want to delete this remedy?" isLoading={deleteMutation.isPending} 
      />
    </PageWrapper>
  );
}
