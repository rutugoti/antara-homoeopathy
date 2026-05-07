import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard';
import Patients from '../pages/Patients';
import PatientDetail from '../pages/Patients/PatientDetail';
import Appointments from '../pages/Appointments';
import AppointmentDetails from '../pages/Appointments/AppointmentDetails';
import BookAppointment from '../pages/Appointments/BookAppointment';
import Settings from '../pages/Appointments/Settings';
import Prescriptions from '../pages/Prescriptions';
import MateriaMedica from '../pages/MateriaMedica';
import Events from '../pages/Events';
import ResearchDev from '../pages/ResearchDev';
import Clinics from '../pages/Clinics';
import NotFound from '../pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          
          <Route path="/appointments" element={<Appointments />}>
            <Route index element={<Navigate to="/appointments/details" replace />} />
            <Route path="details" element={<AppointmentDetails />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/materia-medica" element={<MateriaMedica />} />
          <Route path="/events" element={<Events />} />
          <Route path="/research-dev" element={<ResearchDev />} />
          <Route path="/clinics" element={<Clinics />} />

          <Route path="/contact" element={<div className="p-8 text-slate-500">Contact Us (Coming Soon)</div>} />
          <Route path="/subscribers" element={<div className="p-8 text-slate-500">Subscribers (Coming Soon)</div>} />
          <Route path="/gallery" element={<div className="p-8 text-slate-500">Gallery (Coming Soon)</div>} />
          <Route path="/book-management" element={<div className="p-8 text-slate-500">Book Management (Coming Soon)</div>} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
