import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';

import { getEvents, createEvent, updateEvent, togglePublishEvent, deleteEvent } from '../../services/event.service';

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[150px] p-4 border rounded-md text-sm',
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return <EditorContent editor={editor} />;
};

export default function Events() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const description = watch('description');

  const { data, isLoading } = useQuery({
    queryKey: ['events', page, limit],
    queryFn: () => getEvents({ page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      showSuccess('Event created');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: showError,
  });

  const updateMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      showSuccess('Event updated');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      showSuccess('Event deleted');
      setIsDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: showError,
  });

  const toggleMutation = useMutation({
    mutationFn: togglePublishEvent,
    onSuccess: () => {
      showSuccess('Publish status updated');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: showError,
  });

  const handleEdit = (item) => {
    setSelectedItem(item);
    reset({
      ...item,
      date: new Date(item.date).toISOString().split('T')[0]
    });
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    reset({ title: '', date: '', time: '', type: '', description: '' });
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
    columnHelper.accessor('title', { header: 'Event Title' }),
    columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('time', { header: 'Time' }),
    columnHelper.accessor('type', { header: 'Type' }),
    columnHelper.accessor('isPublished', { 
      header: 'Status', 
      cell: info => info.getValue() ? <Badge variant="success">Published</Badge> : <Badge variant="warning">Draft</Badge>
    }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => {
        const item = info.row.original;
        return (
          <div className="flex items-center space-x-2">
            <button onClick={() => toggleMutation.mutate(item.id)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium border border-transparent hover:border-indigo-200 transition-colors">
              {item.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Pencil className="w-4 h-4" /></button>
            <button onClick={() => { setItemToDelete(item.id); setIsDeleteOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        );
      }
    })
  ];

  const table = useReactTable({ data: data?.events || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <PageWrapper title="Event">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-dark)]">Events</h1>
        <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)]">
        <Table table={table} isLoading={isLoading} />
        {data && (
          <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? "Edit Event" : "Create Event"}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input label="Event Title *" {...register('title', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" {...register('date', { required: true })} />
            <Input label="Time *" type="time" {...register('time', { required: true })} />
          </div>
          <Input label="Event Type *" {...register('type', { required: true })} placeholder="e.g. Seminar, Camp" />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-text-dark)]">Description</label>
            <TiptapEditor 
              content={description || ''} 
              onChange={(html) => setValue('description', html)} 
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
        title="Delete Event" message="Are you sure you want to delete this event?" isLoading={deleteMutation.isPending} 
      />
    </PageWrapper>
  );
}
