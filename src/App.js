import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'antd/dist/reset.css';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';
import ManagerList from './pages/admin/ManagerList';
import DepartmentList from './pages/admin/DepartmentList';
import EmployeeList from './pages/manager/EmployeeList';
import ShiftList from './pages/manager/ShiftList';
import Timekeeping from './pages/manager/Timekeeping';
import Attendance from './pages/manager/Attendance';
import QRDisplay from './pages/manager/QRDisplay';
import TimekeepingRecords from './pages/manager/TimekeepingRecord';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SalaryCalculation from './pages/manager/SalaryCalculation';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="managers" element={<ManagerList />} />
            <Route path="departments" element={<DepartmentList />} />
          </Route>

          {/* Manager Routes */}
          <Route path="/manager" element={
            <PrivateRoute roles={['manager']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<ManagerDashboard />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="shifts" element={<ShiftList />} />
            <Route path="timekeeping" element={<Timekeeping />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="qr-display" element={<QRDisplay />} />
            <Route path="timekeeping-records" element={<TimekeepingRecords />} />
            <Route path="salary" element={<SalaryCalculation />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={
            <PrivateRoute roles={['user']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<EmployeeDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
