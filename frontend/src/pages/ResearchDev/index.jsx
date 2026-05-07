import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

import { getResearchDevs, createResearchDev, updateResearchDev, deleteResearchDev } from '../../services/researchDev.service';

export default function ResearchDev() {
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
    queryKey: ['rd', page, limit],
    queryFn: () => getResearchDevs({ page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: createResearchDev,
    onSuccess: () => {
      showSuccess('Article created');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['rd'] });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: updateResearchDev,
    onSuccess: () => {
      showSuccess('Article updated');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['rd'] });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResearchDev,
    onSuccess: () => {
      showSuccess('Article deleted');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['rd'] });
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
    reset({ title: '', descriptionTitle: '', description: '' });
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
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('description', { 
      header: 'Description', 
      cell: info => {
        const text = info.getValue() || '';
        return text.length > 100 ? `${text.substring(0, 100)}...` : text;
      }
    }),
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

  const table = useReactTable({ data: data?.entries || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="R&D">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">Research & Development</h1>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Add Article</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <Table table={table} isLoading={isLoading} />
        {data && (
          <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Article" : "Add Article"}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="Description Title" {...register('descriptionTitle')} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-dark)]">Description *</label>
            <textarea 
              {...register('description', { required: true })}
              className="flex w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-medium)] min-h-[120px]"
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
        title="Delete Article" message="Are you sure you want to delete this article?" isLoading={deleteMutation.isPending} 
      />
    </PageWrapper>
  );
}
