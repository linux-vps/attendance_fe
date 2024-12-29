import React, { useEffect } from 'react';
import { Link, Outlet, useLocation} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';


const AdminLayout = () => {
  const location = useLocation();

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown-menu');
      const profileButton = document.querySelector('.nav-profile');
      
      if (dropdown && !profileButton.contains(event.target)) {
        dropdown.classList.remove('show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.dropdown-menu').classList.toggle('show');
  };

  return (
    <>
      <header id="header" className="header fixed-top d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" className="logo d-flex align-items-center">
            <img src="assets/img/logo.png" alt="" />
            <span className="d-none d-lg-block">Quản lý chấm công</span>
          </Link>
          <i className="bi bi-list toggle-sidebar-btn" 
             onClick={() => document.body.classList.toggle('toggle-sidebar')}></i>
        </div>

        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item dropdown pe-3">
              <a className="nav-link nav-profile d-flex align-items-center pe-0" 
                 href="#" 
                 onClick={toggleDropdown}>
                <img src="assets/img/profile-img.jpg" alt="Profile" className="rounded-circle" />
                <div className="profile-info">
                  <span className="d-none d-md-block">
                    {user?.fullName || (isAdmin ? 'Admin' : 'Manager')}
                  </span>
                  <small className="role-label">
                    {isAdmin ? 'Administrator' : isManager ? 'Manager' : 'User'}
                  </small>
                </div>
              </a>

              <ul className="dropdown-menu dropdown-menu-arrow profile">
                <li className="dropdown-header">
                  <h6>{user?.fullName || (isAdmin ? 'Admin' : 'Manager')}</h6>
                  <span>{isAdmin ? 'Administrator' : isManager ? 'Manager' : 'User'}</span>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
               
              </ul>
            </li>
          </ul>
        </nav>
      </header>

      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          <li className="nav-item">
            <Link 
              className={`nav-link ${location.pathname === (isAdmin ? '/admin' : '/manager') ? '' : 'collapsed'}`}
              to={isAdmin ? '/admin' : '/manager'}
            >
              <i className="bi bi-grid"></i>
              <span>Dashboard</span>
            </Link>
          </li>

          {isAdmin && (
            <>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/admin/managers' ? '' : 'collapsed'}`}
                  to="/admin/managers"
                >
                  <i className="bi bi-person"></i>
                  <span>Quản lý Manager</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/admin/departments' ? '' : 'collapsed'}`}
                  to="/admin/departments"
                >
                  <i className="bi bi-building"></i>
                  <span>Quản lý phòng ban</span>
                </Link>
              </li>
            </>
          )}

          {isManager && (
            <>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/manager/employees' ? '' : 'collapsed'}`}
                  to="/manager/employees"
                >
                  <i className="bi bi-people"></i>
                  <span>Quản lý nhân viên</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/manager/shifts' ? '' : 'collapsed'}`}
                  to="/manager/shifts"
                >
                  <i className="bi bi-calendar3"></i>
                  <span>Quản lý ca làm việc</span>
                </Link>
              </li>

              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/manager/attendance' ? '' : 'collapsed'}`}
                  to="/manager/attendance"
                >
                  <i className="bi bi-qr-code"></i>
                  <span>Điểm danh QR</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/manager/timekeeping-records' ? '' : 'collapsed'}`}
                  to="/manager/timekeeping-records"
                >
                  <i className="bi bi-clock-history"></i>
                  <span>Bảng ghi chấm công</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/manager/salary' ? '' : 'collapsed'}`}
                  to="/manager/salary"
                >
                  <i className="bi bi-clock-history"></i>
                  <span>Bảng công</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </aside>

      <main id="main" className="main">
        <Outlet />
      </main>
    </>
  );
};

export default AdminLayout;