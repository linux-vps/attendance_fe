import React, { useState, useEffect } from 'react';
import { getDepartments, getEmployees } from '../../services/api';

const Dashboard = () => {
  const [departmentsCount, setDepartmentsCount] = useState(0);
  const [managersCount, setManagersCount] = useState(0);
  const [totalEmployeesCount, setTotalEmployeesCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Lấy danh sách phòng ban
      const departmentsResponse = await getDepartments();
      setDepartmentsCount(departmentsResponse.data.data.length);

      // Lấy danh sách manager (API getEmployees với role admin sẽ trả về managers)
      const managersResponse = await getEmployees();
      const managers = managersResponse.data.data;
      setManagersCount(managers.length);

      // Lấy tổng số nhân viên từ tất cả các manager
      let totalEmployees = 0;
      for (const manager of managers) {
        const employeesResponse = await getEmployees(manager.id);
        totalEmployees += employeesResponse.data.data.length;
      }
      
      // Tổng số nhân viên = số nhân viên + số manager - 1 (trừ tài khoản admin)
      setTotalEmployeesCount(totalEmployees + managers.length - 1);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Dashboard</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/admin">Home</a></li>
            <li className="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-12">
            <div className="row">
              {/* Managers Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Quản lý</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-people"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{managersCount}</h6>
                        <span className="text-muted small pt-2 ps-1">Managers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Departments Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Phòng ban</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-building"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{departmentsCount}</h6>
                        <span className="text-muted small pt-2 ps-1">Departments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Employees Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Tổng nhân viên</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-person"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{totalEmployeesCount}</h6>
                        <span className="text-muted small pt-2 ps-1">Employees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
