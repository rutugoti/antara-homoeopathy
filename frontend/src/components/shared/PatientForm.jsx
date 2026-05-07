import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useDropzone } from 'react-dropzone';
import { BRANCHES, GENDERS, MARITAL_STATUSES, BLOOD_GROUPS } from '../../constants';
import { differenceInYears, parseISO } from 'date-fns';

const schema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  occupation: z.string().optional(),
  mobileNo: z.string().min(10, 'Mobile number must be at least 10 digits'),
  birthDate: z.string().min(1, 'Birth date is required'),
  reference: z.string().optional(),
  maritalStatus: z.string().optional(),
  education: z.string().optional(),
  gender: z.string().optional(),
  branch: z.string().min(1, 'Branch is required'),
  bloodGroup: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  note: z.string().optional(),
});

export function PatientForm({ initialData = null, onSubmit, isLoading, onCancel }) {
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(initialData?.profileImage || null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      occupation: initialData?.occupation || '',
      mobileNo: initialData?.mobileNo || initialData?.phone || '',
      birthDate: (initialData?.birthDate || initialData?.dateOfBirth) ? new Date(initialData.birthDate || initialData.dateOfBirth).toISOString().split('T')[0] : '',
      reference: initialData?.reference || '',
      maritalStatus: initialData?.maritalStatus || '',
      education: initialData?.education || '',
      gender: initialData?.gender || '',
      branch: initialData?.branch || '',
      bloodGroup: initialData?.bloodGroup || '',
      address: initialData?.address || '',
      note: initialData?.note || '',
    }
  });

  const birthDate = watch('birthDate');
  const age = birthDate ? differenceInYears(new Date(), parseISO(birthDate)) : '';

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      setProfileImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1
  });

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        let fieldName = key;
        if (key === 'mobileNo') fieldName = 'phone';
        if (key === 'birthDate') fieldName = 'dateOfBirth';
        formData.append(fieldName, data[key]);
      }
    });
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name *" {...register('firstName')} error={errors.firstName?.message} />
        <Input label="Last Name *" {...register('lastName')} error={errors.lastName?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Occupation" {...register('occupation')} error={errors.occupation?.message} />
        {initialData && (
          <Input label="File ID" value={initialData.fileId || ''} readOnly disabled className="bg-slate-100" />
        )}
        <Input label="Mobile Number *" {...register('mobileNo')} error={errors.mobileNo?.message} />
        <Input label="Birth Date *" type="date" {...register('birthDate')} error={errors.birthDate?.message} />
        <Input label="Age" value={age} readOnly disabled className="bg-slate-100" />
        <Input label="Reference" {...register('reference')} error={errors.reference?.message} />
        <Select label="Marital Status" options={MARITAL_STATUSES} {...register('maritalStatus')} error={errors.maritalStatus?.message} />
        <Input label="Education" {...register('education')} error={errors.education?.message} />
        <Select label="Gender" options={GENDERS} {...register('gender')} error={errors.gender?.message} />
        <Select label="Branch *" options={BRANCHES} placeholder="Select Branch" {...register('branch')} error={errors.branch?.message} />
        <Select label="Blood Group" options={BLOOD_GROUPS} placeholder="Select Blood Group" {...register('bloodGroup')} error={errors.bloodGroup?.message} />
        
        <div className="col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-[var(--color-text-dark)] block mb-1">Profile Image</label>
          <div {...getRootProps()} className="border-2 border-dashed border-[var(--color-border-main)] rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
            <input {...getInputProps()} />
            {preview ? (
              <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-full mb-2" />
            ) : (
              <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-slate-400 text-xs text-center px-2">Drag & drop or click</span>
              </div>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-1">
          <label className="text-sm font-medium text-[var(--color-text-dark)]">Address *</label>
          <textarea 
            {...register('address')}
            className="flex w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-medium)] transition-colors min-h-[80px]"
          />
          {errors.address && <span className="text-xs text-[var(--color-error)]">{errors.address.message}</span>}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-1">
          <label className="text-sm font-medium text-[var(--color-text-dark)]">Note</label>
          <textarea 
            {...register('note')}
            className="flex w-full rounded-md border border-[var(--color-border-main)] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary-medium)] transition-colors min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--color-border-main)]">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </form>
  );
}
