import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Download, Trash2, Eye } from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  getPatientFollowUps, createPatientFollowUp, getPatientRemedyHistory, createPatientRemedy,
  getPatientInvoices, createPatientInvoice, deletePatientInvoice
} from '../../services/patient.service';
import { getPrescriptionsByPatientId, createPrescription } from '../../services/prescription.service';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

const TABS = ['Profile', 'Case Taking', 'Follow Up', 'Remedy', 'Invoices', 'Prescriptions'];

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
        {activeTab === 'Case Taking' && <CaseTakingTab patientId={id} patient={patient} />}
        {activeTab === 'Follow Up' && <FollowUpTab patientId={id} />}
        {activeTab === 'Remedy' && <RemedyTab patientId={id} />}
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

function CaseTakingTab({ patientId, patient }) {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const { data: caseTaking, isLoading } = useQuery({
    queryKey: ['caseTaking', patientId],
    queryFn: () => getPatientCaseTaking(patientId)
  });

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      historyTakenBy: '',
      chiefComplaint: '',
      complaints: [{ complaint: '', location: '', sensation: '', modality: '', concomitants: '' }],
      pastHistory: '',
      familyHistory: '',
      observation: '',
      birthHistory: '',
      generalExamination: '',
      physicalGeneral: '',
      obsGynec: '',
      lifeSpace: '',
      examination: '',
      investigation: '',
      dx: '',
      advice: '',
      fuWeight: '',
      fuBp: '',
      fuRemedy: '',
      fuPotency: '',
      fuDosage: '',
      fuRepetition: '',
      fuDays: '',
      fuPrescriptionType: '',
      fuNotes: ''
    }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "complaints"
  });

  React.useEffect(() => {
    if (caseTaking) {
      let saved = {};
      try {
        saved = caseTaking.notes ? JSON.parse(caseTaking.notes) : {};
      } catch (e) {
        // Keep defaults if parsing fails
      }

      reset({
        historyTakenBy: caseTaking.historyTakenBy || '',
        chiefComplaint: saved.chiefComplaint || '',
        complaints: saved.complaints?.length > 0
          ? saved.complaints
          : [{ complaint: '', location: '', sensation: '', modality: '', concomitants: '' }],
        pastHistory: saved.pastHistory || '',
        familyHistory: saved.familyHistory || '',
        observation: saved.observation || '',
        birthHistory: saved.birthHistory || '',
        generalExamination: saved.generalExamination || '',
        physicalGeneral: saved.physicalGeneral || '',
        obsGynec: saved.obsGynec || '',
        lifeSpace: saved.lifeSpace || '',
        examination: saved.examination || '',
        investigation: saved.investigation || '',
        dx: saved.dx || '',
        advice: saved.advice || '',
        fuWeight: saved.fuWeight || '',
        fuBp: saved.fuBp || '',
        fuRemedy: saved.fuRemedy || '',
        fuPotency: saved.fuPotency || '',
        fuDosage: saved.fuDosage || '',
        fuRepetition: saved.fuRepetition || '',
        fuDays: saved.fuDays || '',
        fuPrescriptionType: saved.fuPrescriptionType || '',
        fuNotes: saved.fuNotes || ''
      });
    }
  }, [caseTaking, reset]);

  const updateMutation = useMutation({
    mutationFn: updatePatientCaseTaking,
    onSuccess: () => {
      showSuccess('Case taking saved successfully');
      queryClient.invalidateQueries({ queryKey: ['caseTaking', patientId] });
    },
    onError: showError
  });

  const onSubmit = (values) => {
    const payload = {
      historyTakenBy: values.historyTakenBy || '',
      notes: JSON.stringify({
        chiefComplaint: values.chiefComplaint,
        complaints: values.complaints,
        pastHistory: values.pastHistory,
        familyHistory: values.familyHistory,
        observation: values.observation,
        birthHistory: values.birthHistory,
        generalExamination: values.generalExamination,
        physicalGeneral: values.physicalGeneral,
        obsGynec: values.obsGynec,
        lifeSpace: values.lifeSpace,
        examination: values.examination,
        investigation: values.investigation,
        dx: values.dx,
        advice: values.advice,
        fuWeight: values.fuWeight,
        fuBp: values.fuBp,
        fuRemedy: values.fuRemedy,
        fuPotency: values.fuPotency,
        fuDosage: values.fuDosage,
        fuRepetition: values.fuRepetition,
        fuDays: values.fuDays,
        fuPrescriptionType: values.fuPrescriptionType,
        fuNotes: values.fuNotes
      })
    };
    updateMutation.mutate({ patientId, payload });
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  const sectionStyle = "bg-white border border-[#e2e8f0] rounded-lg p-4 mb-4";
  const headingStyle = "text-[14px] font-semibold text-[#1a2d5a] mb-2 pb-1 border-b-2 border-[#e2e8f0]";
  const inputStyle = "w-full border border-[#e2e8f0] rounded-md px-[10px] py-[6px] text-[14px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e]";

  return (
    <div className="space-y-4">
      
      {/* Patient Information Box */}
      <div className={sectionStyle + " bg-slate-50 border-slate-200"}>
        <h4 className={headingStyle}>Patient Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-slate-500 block mb-1">Name:</span><span className="font-medium text-slate-900">{patient?.firstName} {patient?.lastName}</span></div>
          <div><span className="text-slate-500 block mb-1">Age/Gender:</span><span className="font-medium text-slate-900">{patient?.age || '-'} / {patient?.gender || '-'}</span></div>
          <div><span className="text-slate-500 block mb-1">Phone:</span><span className="font-medium text-slate-900">{patient?.phone || '-'}</span></div>
          <div><span className="text-slate-500 block mb-1">Blood Group:</span><span className="font-medium text-slate-900">{patient?.bloodGroup || '-'}</span></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* History Taken By */}
        <div className="mb-4">
          <label className="block text-[14px] font-medium text-slate-700 mb-1">History Taken By</label>
          <textarea
            {...register('historyTakenBy')}
            rows={1}
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
            className={`${inputStyle} resize-none overflow-hidden min-h-[36px]`}
            placeholder="Doctor / staff name"
          />
        </div>

        {/* C/o (Chief Complaint) */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>C/o</h4>
          <Controller
            name="chiefComplaint"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Enter chief complaints here..."
                minHeight="200px"
              />
            )}
          />
        </div>

        {/* SECTION 1: Complaints */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>H/O Presenting Complaints</h4>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex font-bold text-[#64748b] text-[12px] uppercase mb-2">
                <div className="flex-1 px-1">Complaints</div>
                <div className="flex-1 px-1">Location</div>
                <div className="flex-1 px-1">Sensation</div>
                <div className="flex-1 px-1">Modality</div>
                <div className="flex-1 px-1">Concomitants</div>
              </div>
              {fields.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <textarea
                      {...register(`complaints.${index}.complaint`)}
                      rows={1}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="w-full border border-[#e2e8f0] rounded-md px-2 py-1 text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e] resize-none overflow-hidden min-h-[32px]"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`complaints.${index}.location`)}
                      rows={1}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="w-full border border-[#e2e8f0] rounded-md px-2 py-1 text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e] resize-none overflow-hidden min-h-[32px]"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`complaints.${index}.sensation`)}
                      rows={1}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="w-full border border-[#e2e8f0] rounded-md px-2 py-1 text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e] resize-none overflow-hidden min-h-[32px]"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`complaints.${index}.modality`)}
                      rows={1}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="w-full border border-[#e2e8f0] rounded-md px-2 py-1 text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e] resize-none overflow-hidden min-h-[32px]"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      {...register(`complaints.${index}.concomitants`)}
                      rows={1}
                      onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                      className="w-full border border-[#e2e8f0] rounded-md px-2 py-1 text-[13px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e] resize-none overflow-hidden min-h-[32px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => append({ complaint: '', location: '', sensation: '', modality: '', concomitants: '' })}
            className="mt-2 text-[13px] font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded px-3 py-1 hover:bg-slate-50"
          >
            + Add Row
          </button>
        </div>

        {/* SECTION 2: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={sectionStyle + " mb-0"}>
            <h4 className={headingStyle}>Past History</h4>
            <Controller
              name="pastHistory"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter past medical history..."
                  minHeight="200px"
                />
              )}
            />
          </div>
          <div className={sectionStyle + " mb-0"}>
            <h4 className={headingStyle}>Family History</h4>
            <Controller
              name="familyHistory"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter family history..."
                  minHeight="200px"
                />
              )}
            />
          </div>
          <div className={sectionStyle + " mb-0"}>
            <h4 className={headingStyle}>Observation</h4>
            <Controller
              name="observation"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter clinical observations..."
                  minHeight="200px"
                />
              )}
            />
          </div>
        </div>

        {/* SECTION 3: 2 side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className={sectionStyle + " mb-0"}>
            <label className={headingStyle + " block"}>Birth History / Milestone / History of Vaccination</label>
            <textarea
              {...register('birthHistory')}
              rows={1}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
              placeholder="Enter birth history, milestones, vaccination history..."
            />
          </div>
          <div className={sectionStyle + " mb-0"}>
            <label className={headingStyle + " block"}>General Examination</label>
            <textarea
              {...register('generalExamination')}
              rows={1}
              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
              placeholder="Enter general examination findings..."
            />
          </div>
        </div>

        {/* SECTION 4: Physical General */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>Physical General</h4>
          <Controller
            name="physicalGeneral"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Thermal, thirst, appetite, sleep, dreams, perspiration, stool, urine..."
                minHeight="200px"
              />
            )}
          />
        </div>

        {/* SECTION 5: Obs & Gynec */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>Obs & Gynec</h4>
          <Controller
            name="obsGynec"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Menstrual history, obstetric history, gynaecological complaints..."
                minHeight="180px"
              />
            )}
          />
        </div>

        {/* SECTION 6: Life Space */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>Life Space</h4>
          <Controller
            name="lifeSpace"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Occupation, lifestyle, stress, relationships, significant life events..."
                minHeight="180px"
              />
            )}
          />
        </div>

        {/* SECTION 7: Exam, Inv, Dx, Advice */}
        <div className={sectionStyle}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[14px] font-semibold text-[#1a2d5a] mb-1">Examination</label>
              <textarea
                {...register('examination')}
                rows={1}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
                placeholder="Clinical examination findings..."
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#1a2d5a] mb-1">Investigation</label>
              <textarea
                {...register('investigation')}
                rows={1}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
                placeholder="Lab reports, X-ray, MRI, CBC..."
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#1a2d5a] mb-1">Dx (Diagnosis)</label>
              <textarea
                {...register('dx')}
                rows={1}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
                placeholder="Homoeopathic / clinical diagnosis..."
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-[#1a2d5a] mb-1">Advice</label>
              <textarea
                {...register('advice')}
                rows={1}
                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                className={`${inputStyle} resize-none overflow-hidden min-h-[40px]`}
                placeholder="Diet, lifestyle, follow up advice..."
              />
            </div>
          </div>
        </div>

        {/* SECTION 8: Follow Up Fields (Optional within Case Taking) */}
        <div className={sectionStyle}>
          <h4 className={headingStyle}>Follow Up Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Weight</label>
              <input {...register('fuWeight')} className={inputStyle} placeholder="e.g. 58 kg" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">BP</label>
              <input {...register('fuBp')} className={inputStyle} placeholder="e.g. 120/80" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Remedy</label>
              <input {...register('fuRemedy')} className={inputStyle} placeholder="e.g. Natrum Mur" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Potency</label>
              <input {...register('fuPotency')} className={inputStyle} placeholder="e.g. 200C" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Dosage</label>
              <input {...register('fuDosage')} className={inputStyle} placeholder="e.g. 4 drops" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Repetition</label>
              <select {...register('fuRepetition')} className={inputStyle}>
                <option value="">-- Select --</option>
                <option value="OD">OD</option>
                <option value="BD">BD</option>
                <option value="TDS">TDS</option>
                <option value="QID">QID</option>
                <option value="SOS">SOS</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Days</label>
              <input {...register('fuDays')} className={inputStyle} placeholder="e.g. 15 days" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Prescription Type</label>
              <select {...register('fuPrescriptionType')} className={inputStyle}>
                <option value="">-- Select --</option>
                <option value="Liquid">Liquid</option>
                <option value="Globules">Globules</option>
                <option value="Tablet">Tablet</option>
                <option value="Mother Tincture">Mother Tincture</option>
                <option value="Biochemic">Biochemic</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block font-medium text-slate-700 mb-1">Follow Up Notes</label>
              <Controller
                name="fuNotes"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe follow up progress..."
                    minHeight="150px"
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={updateMutation.isPending} className="w-full md:w-auto">
            Save Case Taking
          </Button>
        </div>

      </form>
    </div>
  );
}

function FollowUpTab({ patientId }) {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['followups', patientId, page],
    queryFn: () => getPatientFollowUps(patientId, { page, limit: 10 })
  });

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
    columnHelper.accessor((row, index) => (page - 1) * 10 + index + 1, { header: '#' }),
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString('en-GB') }),
    columnHelper.accessor('remedy', { header: 'Remedy' }),
    columnHelper.accessor('potency', { header: 'Potency' }),
    columnHelper.accessor('historyTakenBy', { header: 'History By' }),
    columnHelper.accessor('charge', { header: 'Charge', cell: info => info.getValue() ? `₹${info.getValue()}` : '-' }),
    columnHelper.display({
      id: 'action',
      header: 'Action',
      cell: info => (
        <button 
          onClick={() => setViewEntry(info.row.original)}
          className="p-1 rounded hover:bg-slate-100 text-slate-500"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    })
  ];
  const table = useReactTable({ data: data?.followUps || [], columns, getCoreRowModel: getCoreRowModel() });

  const inputStyle = "w-full border border-[#e2e8f0] rounded-md px-[10px] py-[6px] text-[14px] text-[#1e293b] bg-white focus:outline-none focus:border-[#2c4a8e]";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Follow Ups</h3>
        <Button onClick={() => { reset(); setIsFormOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Follow Up
        </Button>
      </div>

      {data?.followUps?.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-white border border-[#e2e8f0] rounded-lg">
          No follow up entries yet. Click Add Follow Up to begin.
        </div>
      ) : (
        <>
          <Table table={table} isLoading={isLoading} />
          {data && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />}
        </>
      )}
      
      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); reset(); }} title="Add Follow Up Entry" maxWidth="max-w-[700px]">
        <form onSubmit={handleSubmit((d) => createMutation.mutate({ patientId, payload: d }))} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">History Taken By</label>
              <input {...register('historyTakenBy')} className={inputStyle} placeholder="Doctor name" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Appointment Charge</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[14px]">₹</span>
                <input type="number" {...register('charge')} className={inputStyle + " pl-7"} placeholder="0" />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Weight</label>
              <input {...register('weight')} className={inputStyle} placeholder="e.g. 58 kg" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">BP</label>
              <input {...register('bp')} className={inputStyle} placeholder="e.g. 120/80" />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Remedy</label>
              <input {...register('remedy')} className={inputStyle} placeholder="e.g. Natrum Muriaticum" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Potency</label>
              <input {...register('potency')} className={inputStyle} placeholder="e.g. 30C, 200C, 1M" />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Dosage</label>
              <input {...register('dosage')} className={inputStyle} placeholder="e.g. 4 drops" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Repetition</label>
              <select {...register('repetition')} className={inputStyle}>
                <option value="">-- Select --</option>
                <option value="OD">OD</option>
                <option value="BD">BD</option>
                <option value="TDS">TDS</option>
                <option value="QID">QID</option>
                <option value="SOS">SOS</option>
                <option value="Weekly">Weekly</option>
                <option value="Fortnightly">Fortnightly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Days</label>
              <input {...register('days')} className={inputStyle} placeholder="e.g. 15 days" />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Prescription Type</label>
              <select {...register('prescriptionType')} className={inputStyle}>
                <option value="">-- Select --</option>
                <option value="Liquid">Liquid</option>
                <option value="Globules">Globules</option>
                <option value="Tablet">Tablet</option>
                <option value="Mother Tincture">Mother Tincture</option>
                <option value="Biochemic">Biochemic</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[14px] font-medium text-slate-700 mb-1">Follow Up Notes</label>
              <Controller
                name="followUp"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Describe patient progress, new complaints, observations..."
                    minHeight="150px"
                  />
                )}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>Save Entry</Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!viewEntry} 
        onClose={() => setViewEntry(null)} 
        title={viewEntry ? `Follow Up — ${new Date(viewEntry.createdAt).toLocaleDateString('en-GB')}` : ''}
        maxWidth="max-w-[700px]"
      >
        {viewEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-[14px]">
              <div>
                <span className="block text-slate-500 font-medium">History Taken By</span>
                <span className="text-slate-900">{viewEntry.historyTakenBy || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Appointment Charge</span>
                <span className="text-slate-900">{viewEntry.charge ? `₹${viewEntry.charge}` : '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Weight</span>
                <span className="text-slate-900">{viewEntry.weight || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">BP</span>
                <span className="text-slate-900">{viewEntry.bp || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Remedy</span>
                <span className="text-slate-900">{viewEntry.remedy || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Potency</span>
                <span className="text-slate-900">{viewEntry.potency || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Dosage</span>
                <span className="text-slate-900">{viewEntry.dosage || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Repetition</span>
                <span className="text-slate-900">{viewEntry.repetition || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Days</span>
                <span className="text-slate-900">{viewEntry.days || '-'}</span>
              </div>
              <div>
                <span className="block text-slate-500 font-medium">Prescription Type</span>
                <span className="text-slate-900">{viewEntry.prescriptionType || '-'}</span>
              </div>
            </div>
            
            <div>
              <span className="block text-slate-500 font-medium text-[14px] mb-1">Follow Up Notes</span>
              <div 
                className="border border-[#e2e8f0] rounded p-3 min-h-[80px] text-sm"
                dangerouslySetInnerHTML={{ __html: viewEntry.followUp || '-' }}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

function RemedyTab({ patientId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['remedy-history', patientId, page],
    queryFn: () => getPatientRemedyHistory(patientId, { page, limit: 10 })
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const createMutation = useMutation({
    mutationFn: createPatientRemedy,
    onSuccess: () => {
      showSuccess('Remedy added');
      setIsFormOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['remedy-history', patientId] });
      // Also invalidate follow-up history if they are linked
      queryClient.invalidateQueries({ queryKey: ['follow-up-history', patientId] });
    },
    onError: showError
  });

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('createdAt', { header: 'Date', cell: info => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('remedy', { header: 'Remedy' }),
    columnHelper.accessor('potency', { header: 'Potency' }),
    columnHelper.accessor('dosage', { header: 'Dosage' }),
    columnHelper.accessor('repetition', { header: 'Repetition' }),
    columnHelper.accessor('days', { header: 'Days' }),
  ];

  const table = useReactTable({ data: data?.remedies || [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">Remedy Management</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm">Add Remedy</Button>
      </div>

      <Table table={table} isLoading={isLoading} />
      {data && <Pagination currentPage={data.currentPage} totalPages={data.totalPages} totalCount={data.totalCount} limit={data.limit} onPageChange={setPage} />}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Remedy">
        <form onSubmit={handleSubmit((d) => createMutation.mutate({ patientId, payload: d }))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Remedy Name" {...register('remedy', { required: true })} placeholder="e.g. Natrum Mur" />
            <Input label="Potency" {...register('potency', { required: true })} placeholder="e.g. 200C" />
            <Input label="Dosage" {...register('dosage')} placeholder="e.g. 4 pills" />
            <Input label="Repetition" {...register('repetition')} placeholder="e.g. TDS" />
            <Input label="Days" {...register('days')} placeholder="e.g. 15 days" />
            <div className="col-span-2">
              <Input label="Notes" {...register('notes')} placeholder="Optional notes about this prescription" />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" isLoading={createMutation.isPending}>Save Remedy</Button>
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
