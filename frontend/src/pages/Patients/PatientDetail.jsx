import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Download, Trash2, Eye } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { PageWrapper } from '../../components/layout/PageWrapper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PatientForm } from '../../components/shared/PatientForm';
import { useToast } from '../../hooks/useToast';

import { 
  getPatientById, updatePatient,
  getPatientCaseTaking, updatePatientCaseTaking, uploadCaseTakingImages,
  getPatientFollowUps, createPatientFollowUp, getPatientRemedyHistory,
  getPatientInvoices, createPatientInvoice, deletePatientInvoice
} from '../../services/patient.service';
import { getPrescriptionsByPatientId, createPrescription } from '../../services/prescription.service';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

const TABS = ['Profile', 'Case Taking', 'Follow Up', 'Invoices', 'Prescriptions'];

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('Profile');

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatientById(id)
  });

  if (isLoadingPatient) return <div className="p-8 text-center text-slate-500">Loading patient...</div>;
  if (!patient) return <div className="p-8 text-center text-slate-500">Patient not found</div>;

  return (
    <PageWrapper title="Patient Details">
      <div className="mb-4">
        <button onClick={() => navigate('/patients')} className="flex items-center text-sm font-medium text-slate-600 hover:text-[var(--color-primary)] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] overflow-hidden mb-6">
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {patient.profileImage ? (
            <img src={patient.profileImage} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-slate-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
              {patient.firstName[0]}
            </div>
          )}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-[var(--color-text-dark)]">{patient.firstName} {patient.lastName}</h2>
            <p className="text-sm font-medium text-[var(--color-primary)] mt-1">{patient.fileId}</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 justify-center sm:justify-start">
              <span><strong>Phone:</strong> {patient.phone}</span>
              <span><strong>Email:</strong> {patient.email || 'N/A'}</span>
              <span><strong>Blood Group:</strong> {patient.bloodGroup || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex border-t border-[var(--color-border-main)] overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab 
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--color-border-main)] p-6">
        {activeTab === 'Profile' && <ProfileTab patient={patient} />}
        {activeTab === 'Case Taking' && <CaseTakingTab patientId={id} />}
        {activeTab === 'Follow Up' && <FollowUpTab patientId={id} />}
        {activeTab === 'Invoices' && <InvoicesTab patientId={id} />}
        {activeTab === 'Prescriptions' && <PrescriptionsTab patientId={id} />}
      </div>
    </PageWrapper>
  );
}

// ---------------------------------------------------------
// TABS
// ---------------------------------------------------------

function ProfileTab({ patient }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const updateMutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      showSuccess('Patient updated');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['patient', patient.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: showError
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Profile Information</h3>
        <Button onClick={() => setIsEditOpen(true)} size="sm">Edit Profile</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
        <div className="flex flex-col"><span className="text-slate-500 mb-1">First Name</span><span className="font-medium text-slate-900">{patient.firstName}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Last Name</span><span className="font-medium text-slate-900">{patient.lastName}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Mobile</span><span className="font-medium text-slate-900">{patient.phone}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Email</span><span className="font-medium text-slate-900">{patient.email || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Birth Date</span><span className="font-medium text-slate-900">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Age</span><span className="font-medium text-slate-900">{patient.age || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Gender</span><span className="font-medium text-slate-900">{patient.gender || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Blood Group</span><span className="font-medium text-slate-900">{patient.bloodGroup || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Branch</span><span className="font-medium text-slate-900">{patient.branch}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Occupation</span><span className="font-medium text-slate-900">{patient.occupation || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Reference</span><span className="font-medium text-slate-900">{patient.reference || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Marital Status</span><span className="font-medium text-slate-900">{patient.maritalStatus || '-'}</span></div>
        <div className="flex flex-col"><span className="text-slate-500 mb-1">Education</span><span className="font-medium text-slate-900">{patient.education || '-'}</span></div>
        <div className="flex flex-col col-span-1 md:col-span-2"><span className="text-slate-500 mb-1">Address</span><span className="font-medium text-slate-900">{patient.address || '-'}</span></div>
        <div className="flex flex-col col-span-1 md:col-span-2"><span className="text-slate-500 mb-1">Note</span><span className="font-medium text-slate-900">{patient.note || '-'}</span></div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Patient">
        <PatientForm 
          initialData={patient} 
          onSubmit={(formData) => updateMutation.mutate({ id: patient.id, formData })}
          isLoading={updateMutation.isPending}
          onCancel={() => setIsEditOpen(false)}
        />
      </Modal>
    </div>
  );
}

function CaseTakingTab({ patientId }) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const { data: caseTaking, isLoading } = useQuery({
    queryKey: ['caseTaking', patientId],
    queryFn: () => getPatientCaseTaking(patientId)
  });

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { historyTakenBy: '', notes: '' }
  });
  
  React.useEffect(() => {
    if (caseTaking) {
      reset({ 
        historyTakenBy: caseTaking.historyTakenBy || '', 
        notes: caseTaking.notes || '' 
      });
    }
  }, [caseTaking, reset]);

  const updateMutation = useMutation({
    mutationFn: updatePatientCaseTaking,
    onSuccess: () => {
      showSuccess('Case taking details saved');
      queryClient.invalidateQueries({ queryKey: ['caseTaking', patientId] });
    },
    onError: showError
  });

  const onSubmit = (data) => updateMutation.mutate({ patientId, payload: data });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="History Taken By" {...register('historyTakenBy')} />
        
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              label="Notes"
              value={field.value}
              onChange={field.onChange}
              placeholder="Write case taking notes here... (symptoms, history, observations)"
              minHeight="250px"
            />
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" isLoading={updateMutation.isPending}>Save Notes</Button>
        </div>
      </form>
    </div>
  );
}

function FollowUpTab({ patientId }) {
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['followups', patientId, page],
    queryFn: () => getPatientFollowUps(patientId, { page, limit: 10 })
  });

  const { data: remedyHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['remedy-history', patientId, historyPage],
    queryFn: () => getPatientRemedyHistory(patientId, { page: historyPage, limit: 10 })
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset, control } = useForm();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const createMutation = useMutation({
    mutationFn: createPatientFollowUp,
    onSuccess: () => {
      showSuccess('Follow Up added');
      setIsFormOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['followups', patientId] });
      queryClient.invalidateQueries({ queryKey: ['remedy-history', patientId] });
    },
    onError: showError
  });

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('followUp', { header: 'Notes', cell: info => <div dangerouslySetInnerHTML={{ __html: info.getValue() }} className="prose prose-sm max-w-none" /> }),
    columnHelper.accessor('remedy', { header: 'Remedy' }),
    columnHelper.accessor('potency', { header: 'Potency' }),
  ];
  const table = useReactTable({ data: data?.followUps || [], columns, getCoreRowModel: getCoreRowModel() });

  const historyColumnHelper = createColumnHelper();
  const historyColumns = [
    historyColumnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    historyColumnHelper.accessor('remedy', { header: 'Remedy' }),
    historyColumnHelper.accessor('potency', { header: 'Potency' }),
    historyColumnHelper.accessor('dosage', { header: 'Dosage' }),
    historyColumnHelper.accessor('repetition', { header: 'Repetition' }),
    historyColumnHelper.accessor('days', { header: 'Days' }),
  ];
  const historyTable = useReactTable({ data: remedyHistory?.remedies || [], columns: historyColumns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-12">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Follow Ups</h3>
          <Button onClick={() => setIsFormOpen(true)} size="sm">Add Follow Up</Button>
        </div>
        <Table table={table} isLoading={isLoading} />
        {data && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)] mb-4">Remedy History</h3>
        <Table table={historyTable} isLoading={isLoadingHistory} />
        {remedyHistory && <Pagination currentPage={remedyHistory.currentPage} totalPages={remedyHistory.totalPages} totalCount={remedyHistory.totalCount} limit={remedyHistory.limit} onPageChange={setHistoryPage} />}
      </div>
      
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Follow Up">
        <form onSubmit={handleSubmit((d) => createMutation.mutate({ patientId, payload: d }))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Controller
                name="followUp"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    label="Follow Up Notes"
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe patient progress, complaints, observations..."
                    minHeight="180px"
                  />
                )}
              />
            </div>
            <Input label="Weight" {...register('weight')} />
            <Input label="BP" {...register('bp')} />
            <Input label="Remedy" {...register('remedy')} />
            <Input label="Potency" {...register('potency')} />
            <Input label="Dosage" {...register('dosage')} />
            <Input label="Repetition" {...register('repetition')} />
            <Input label="Days" {...register('days')} />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InvoicesTab({ patientId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', patientId, page],
    queryFn: () => getPatientInvoices(patientId, { page, limit: 10 })
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const createMutation = useMutation({
    mutationFn: createPatientInvoice,
    onSuccess: () => {
      showSuccess('Invoice created');
      setIsFormOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['invoices', patientId] });
    },
    onError: showError
  });

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('invoiceNo', { header: 'Invoice No' }),
    columnHelper.accessor('diagnosis', { header: 'Diagnosis' }),
    columnHelper.accessor('amount', { header: 'Amount', cell: info => `₹${info.getValue()}` }),
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  ];
  const table = useReactTable({ data: data?.invoices || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Invoices</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm">Create Invoice</Button>
      </div>
      <Table table={table} isLoading={isLoading} />
      {data && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />}
      
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Create Invoice">
        <form onSubmit={handleSubmit((d) => createMutation.mutate({ patientId, payload: { ...d, amount: parseFloat(d.amount) } }))} className="space-y-4">
          <Input label="Diagnosis" {...register('diagnosis')} required />
          <Input label="Amount (₹)" type="number" step="0.01" {...register('amount')} required />
          <Input label="Prescription Date" type="date" {...register('prescriptionDate')} />
          <div className="col-span-2">
            <label className="text-sm font-medium">Prescription Notes</label>
            <textarea {...register('prescription')} className="w-full border rounded p-2 text-sm mt-1" rows={3}></textarea>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" isLoading={createMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PrescriptionsTab({ patientId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['prescriptions', patientId, page],
    queryFn: () => getPrescriptionsByPatientId({ patientId, params: { page, limit: 10 } })
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const createMutation = useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      showSuccess('Prescription created');
      setIsFormOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: showError
  });

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('title', { header: 'Title' }),
    columnHelper.accessor('list', { header: 'List' }),
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
  ];
  const table = useReactTable({ data: data?.prescriptions || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Prescriptions</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Prescription</Button>
      </div>
      <Table table={table} isLoading={isLoading} />
      {data && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Prescription">
        <form onSubmit={handleSubmit((d) => createMutation.mutate({ patientId, ...d }))} className="space-y-4">
          <Input label="Title *" {...register('title', { required: true })} />
          <Input label="List (Category/Type)" {...register('list')} />
          <div className="space-y-1">
            <label className="text-sm font-medium">Content *</label>
            <textarea {...register('content', { required: true })} className="w-full border rounded border-[var(--color-border-main)] p-2 text-sm mt-1 min-h-[120px]" />
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" isLoading={createMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
