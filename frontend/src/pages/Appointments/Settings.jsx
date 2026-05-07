import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getAppointmentSettings, updateAppointmentSettings, updateWorkingDays, getHolidays, createHoliday, updateHoliday, deleteHoliday } from '../../services/appointment.service';
import { useToast } from '../../hooks/useToast';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Trash2, Pencil } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8">
      <SlotSettings />
      <DaySettings />
      <HolidaySettings />
    </div>
  );
}

function SlotSettings() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['appointmentSettings'], queryFn: getAppointmentSettings });

  const { register, handleSubmit, reset } = useForm();

  React.useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const updateMutation = useMutation({
    mutationFn: updateAppointmentSettings,
    onSuccess: () => {
      showSuccess('Settings updated');
      queryClient.invalidateQueries({ queryKey: ['appointmentSettings'] });
    },
    onError: showError
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="border border-[var(--color-border-main)] rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--color-text-dark)] border-b pb-2 mb-4">Slot Time Settings</h3>
      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input label="Morning Start" type="time" step="60" {...register('morningStartTime')} />
        <Input label="Morning End" type="time" step="60" {...register('morningEndTime')} />
        <Input label="Afternoon Start" type="time" step="60" {...register('afternoonStartTime')} />
        <Input label="Afternoon End" type="time" step="60" {...register('afternoonEndTime')} />
        <Input label="Old Patient Time (min)" type="number" {...register('oldPatientTime', { valueAsNumber: true })} />
        <Input label="New Patient Time (min)" type="number" {...register('newPatientTime', { valueAsNumber: true })} />
        <Input label="Old Patient Fee (₹)" type="number" {...register('oldPatientFee', { valueAsNumber: true })} />
        <Input label="New Patient Fee (₹)" type="number" {...register('newPatientFee', { valueAsNumber: true })} />
        
        <div className="col-span-full flex justify-end mt-2">
          <Button type="submit" isLoading={updateMutation.isPending}>Save Settings</Button>
        </div>
      </form>
    </div>
  );
}

function DaySettings() {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['appointmentSettings'], queryFn: getAppointmentSettings });

  const [workingDays, setWorkingDays] = React.useState([]);

  React.useEffect(() => {
    if (data && data.workingDays) {
      setWorkingDays(data.workingDays);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateWorkingDays,
    onSuccess: () => {
      showSuccess('Working days updated');
      queryClient.invalidateQueries({ queryKey: ['appointmentSettings'] });
    },
    onError: showError
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="border border-[var(--color-border-main)] rounded-lg p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-[var(--color-text-dark)] border-b pb-2 mb-4">Day Settings</h3>
      <div className="flex flex-wrap gap-4">
        {days.map(day => (
          <label key={day} className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={workingDays.includes(day)}
              onChange={() => toggleDay(day)}
              className="rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
            />
            <span className="text-sm font-medium">{day}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={() => updateMutation.mutate({ workingDays })} isLoading={updateMutation.isPending}>Save Days</Button>
      </div>
    </div>
  );
}

function HolidaySettings() {
  const { data, isLoading } = useQuery({ queryKey: ['holidays'], queryFn: () => getHolidays({ limit: 100 }) });
  
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedHoliday, setSelectedHoliday] = React.useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [holidayToDelete, setHolidayToDelete] = React.useState(null);

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  React.useEffect(() => {
    if (selectedHoliday) {
      reset({
        title: selectedHoliday.title,
        date: new Date(selectedHoliday.date).toISOString().split('T')[0],
        morningTime: selectedHoliday.morningTime || '',
        afternoonTime: selectedHoliday.afternoonTime || ''
      });
    } else {
      reset({ title: '', date: '', morningTime: '', afternoonTime: '' });
    }
  }, [selectedHoliday, reset]);

  const createMutation = useMutation({
    mutationFn: createHoliday,
    onSuccess: () => {
      showSuccess('Holiday added');
      setIsFormOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-holidays'] });
    },
    onError: showError
  });

  const updateMutation = useMutation({
    mutationFn: updateHoliday,
    onSuccess: () => {
      showSuccess('Holiday updated');
      setIsFormOpen(false);
      setSelectedHoliday(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-holidays'] });
    },
    onError: showError
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      showSuccess('Holiday deleted');
      setIsDeleteOpen(false);
      setHolidayToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-holidays'] });
    },
    onError: showError
  });

  const handleEdit = (holiday) => {
    setSelectedHoliday(holiday);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setHolidayToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (d) => {
    if (selectedHoliday) {
      updateMutation.mutate({ id: selectedHoliday.id, payload: d });
    } else {
      createMutation.mutate(d);
    }
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('date', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('morningTime', { header: 'Morning Time', cell: info => info.getValue() || <span className="text-slate-400">Closed</span> }),
    columnHelper.accessor('afternoonTime', { header: 'Afternoon Time', cell: info => info.getValue() || <span className="text-slate-400">Closed</span> }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: (info) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(info.row.original)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(info.row.original.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    })
  ];

  const table = useReactTable({ data: data?.holidays || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="border border-[var(--color-border-main)] rounded-lg p-6 bg-white shadow-sm">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Holiday Management</h3>
        <Button size="sm" onClick={() => { setSelectedHoliday(null); setIsFormOpen(true); }}>Add Holiday</Button>
      </div>
      <Table table={table} isLoading={isLoading} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedHoliday ? "Edit Holiday" : "Add Holiday"}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="Date *" type="date" {...register('date', { required: true })} />
          <div className="text-xs text-slate-500 mb-2">Leave time empty if completely closed</div>
          <Input label="Morning Time" type="time" {...register('morningTime')} />
          <Input label="Afternoon Time" type="time" {...register('afternoonTime')} />
          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {selectedHoliday ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(holidayToDelete)}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday?"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
