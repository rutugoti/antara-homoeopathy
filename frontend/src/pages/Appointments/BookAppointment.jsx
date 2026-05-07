import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PatientForm } from '../../components/shared/PatientForm';
import { useToast } from '../../hooks/useToast';

import { lookupPatient, bookOldPatient, bookNewPatient } from '../../services/book.service';
import { getAvailableSlots } from '../../services/appointment.service';
import { BRANCHES, PAYMENT_METHODS } from '../../constants';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const fileIdParam = searchParams.get('fileId') || '';
  
  const [isOldPatient, setIsOldPatient] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-[var(--color-border-main)] pb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="radio" 
            checked={isOldPatient} 
            onChange={() => setIsOldPatient(true)} 
            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
          />
          <span className="text-sm font-medium text-[var(--color-text-dark)]">Old Patient</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="radio" 
            checked={!isOldPatient} 
            onChange={() => setIsOldPatient(false)} 
            className="text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
          />
          <span className="text-sm font-medium text-[var(--color-text-dark)]">New Patient</span>
        </label>
      </div>

      {isOldPatient ? (
        <OldPatientBooking defaultFileId={fileIdParam} />
      ) : (
        <NewPatientBooking />
      )}
    </div>
  );
}

function OldPatientBooking({ defaultFileId }) {
  const [fileIdInput, setFileIdInput] = useState(defaultFileId);
  const [searchedFileId, setSearchedFileId] = useState(defaultFileId);
  const { showSuccess, showError } = useToast();

  const { data: patient, isLoading: isLookingUp, error } = useQuery({
    queryKey: ['lookup-patient', searchedFileId],
    queryFn: () => lookupPatient(searchedFileId),
    enabled: !!searchedFileId,
    retry: false
  });

  const { register, handleSubmit, watch, reset } = useForm();
  
  const selectedDate = watch('date');
  const selectedBranch = watch('branch');

  const { data: slots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ['available-slots', selectedDate, selectedBranch],
    queryFn: () => getAvailableSlots({ date: selectedDate, branch: selectedBranch }),
    enabled: !!selectedDate && !!selectedBranch
  });

  const bookMutation = useMutation({
    mutationFn: bookOldPatient,
    onSuccess: () => {
      showSuccess('Appointment booked successfully!');
      reset();
      setSearchedFileId('');
      setFileIdInput('');
    },
    onError: showError
  });

  const onSubmit = (data) => {
    bookMutation.mutate({ ...data, fileId: searchedFileId, paymentAmount: parseFloat(data.paymentAmount) });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input 
          placeholder="Enter File ID (e.g. AH-00001)" 
          value={fileIdInput} 
          onChange={e => setFileIdInput(e.target.value)} 
          className="max-w-xs"
        />
        <Button onClick={() => setSearchedFileId(fileIdInput)} isLoading={isLookingUp}>Search</Button>
      </div>

      {error && <div className="text-red-500 text-sm">Patient not found</div>}

      {patient && (
        <div className="border border-[var(--color-border-main)] rounded p-4 bg-slate-50">
          <p className="font-semibold text-lg text-[var(--color-primary)]">{patient.firstName} {patient.lastName}</p>
          <p className="text-sm text-slate-600">Mobile: {patient.mobileNo} | Branch: {patient.branch}</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <h3 className="font-semibold text-[var(--color-text-dark)] border-b pb-2">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Date *" type="date" {...register('date', { required: true })} />
              <Select label="Branch *" options={BRANCHES} placeholder="Select Branch" {...register('branch', { required: true })} />
              
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm font-medium text-[var(--color-text-dark)] mb-1 block">Time Slot *</label>
                {isLoadingSlots ? (
                  <div className="text-sm text-slate-500">Loading slots...</div>
                ) : slots?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {slots.map(slot => (
                      <label key={slot} className="cursor-pointer">
                        <input type="radio" value={slot} {...register('time', { required: true })} className="peer sr-only" />
                        <div className="px-3 py-1.5 border border-slate-200 rounded text-sm hover:bg-slate-100 peer-checked:bg-[var(--color-primary)] peer-checked:text-white peer-checked:border-[var(--color-primary)] transition-colors">
                          {slot}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">Please select a date and branch to view slots.</div>
                )}
              </div>

              <Input label="Reason" {...register('reason')} />
              <Input label="Appointment By" {...register('appointmentBy')} />
              <div className="col-span-1 md:col-span-2">
                <Input label="Notes" {...register('notes')} />
              </div>
            </div>

            <h3 className="font-semibold text-[var(--color-text-dark)] border-b pb-2 mt-6">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Amount (₹) *" type="number" step="0.01" {...register('paymentAmount', { required: true })} />
              <Select label="Payment Method *" options={PAYMENT_METHODS} placeholder="Select Method" {...register('paymentMethod', { required: true })} />
              <div className="col-span-1 md:col-span-2">
                <Input label="Payment Notes" {...register('paymentNotes')} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" isLoading={bookMutation.isPending}>Book Appointment</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function NewPatientBooking() {
  const { showSuccess, showError } = useToast();
  const bookMutation = useMutation({
    mutationFn: bookNewPatient,
    onSuccess: () => {
      showSuccess('Patient registered and appointment booked!');
    },
    onError: showError
  });

  const onSubmit = (formData) => {
    formData.append('date', new Date().toISOString().split('T')[0]);
    formData.append('time', '10:00 AM');
    formData.append('branch', 'MAIN');
    formData.append('paymentAmount', '500');
    formData.append('paymentMethod', 'CASH');
    
    bookMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 text-blue-800 p-4 rounded text-sm mb-4 border border-blue-200">
        <strong>Note:</strong> Since new patient registration involves a large form, appointment date/time and payment details will be auto-filled for today as a demonstration of the one-step booking flow.
      </div>
      <PatientForm onSubmit={onSubmit} isLoading={bookMutation.isPending} />
    </div>
  );
}
