import React, { useState, useEffect, useRef } from 'react';
import { getEmployees, getShifts } from '../../services/api';
import axios from '../../utils/axios';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalShifts: 0,
    activeEmployees: 0,
  });
  const lateChartRef = useRef(null);
  const punctualChartRef = useRef(null);
  const [attendanceStats, setAttendanceStats] = useState({
    lateEmployees: [],
    punctualEmployees: []
  });
  const [departmentName, setDepartmentName] = useState('N/A');

  useEffect(() => {
    const loadChartJS = async () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        fetchDepartmentName();
        fetchDashboardData();
        fetchAttendanceStats();
      };
    };

    loadChartJS();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, shiftsRes] = await Promise.all([
        getEmployees(),
        getShifts()
      ]);

      const employees = employeesRes.data.data;
      const shifts = shiftsRes.data.data;

      setStats({
        totalEmployees: employees.length,
        totalShifts: shifts.length,
        activeEmployees: employees.filter(emp => emp.isActive).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token);
      const departmentId = decodedToken.departmentId;

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const response = await axios.get(`/timekeeping/department/${departmentId}`, {
        params: { startDate, endDate }
      });

      // Process attendance data
      const employeeStats = processAttendanceData(response.data.data);
      
      setAttendanceStats(employeeStats);
      
      // Create charts
      createCharts(employeeStats);
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const processAttendanceData = (records) => {
    const employeeLateCounts = {};
    const employeePunctualCounts = {};

    records.forEach(record => {
      const employeeName = record.employee?.fullName || 'N/A';
      const checkInTime = record.checkInTime;
      const shiftStartTime = record.shift?.startTime;

      if (checkInTime && shiftStartTime) {
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const [shiftHours, shiftMinutes] = shiftStartTime.split(':').map(Number);
        const checkInTotal = checkInHours * 60 + checkInMinutes;
        const shiftTotal = shiftHours * 60 + shiftMinutes;

        if (checkInTotal > shiftTotal + 5) {
          employeeLateCounts[employeeName] = (employeeLateCounts[employeeName] || 0) + 1;
        } else {
          employeePunctualCounts[employeeName] = (employeePunctualCounts[employeeName] || 0) + 1;
        }
      }
    });

    return {
      lateEmployees: Object.entries(employeeLateCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      punctualEmployees: Object.entries(employeePunctualCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  };

  const createCharts = (stats) => {
    // Destroy existing charts if they exist
    if (lateChartRef.current) {
      lateChartRef.current.destroy();
    }
    if (punctualChartRef.current) {
      punctualChartRef.current.destroy();
    }

    // Create Late Employees Chart
    const lateCtx = document.getElementById('lateEmployeesChart');
    if (lateCtx && window.Chart) {
      lateChartRef.current = new window.Chart(lateCtx, {
        type: 'bar',
        data: {
          labels: stats.lateEmployees.map(([name]) => name),
          datasets: [{
            label: 'Số lần đi muộn',
            data: stats.lateEmployees.map(([, count]) => count),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    // Create Punctual Employees Chart
    const punctualCtx = document.getElementById('punctualEmployeesChart');
    if (punctualCtx && window.Chart) {
      punctualChartRef.current = new window.Chart(punctualCtx, {
        type: 'bar',
        data: {
          labels: stats.punctualEmployees.map(([name]) => name),
          datasets: [{
            label: 'Số lần đúng giờ',
            data: stats.punctualEmployees.map(([, count]) => count),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  const fetchDepartmentName = async () => {
    try {
      const departmentsResponse = await axios.get('/departments');
      const departmentName = departmentsResponse.data.data.departmentName;
      setDepartmentName(departmentName);
    } catch (error) {
      console.error('Error fetching department name:', error);
    }
  };

  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Dashboard</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/manager">Home</a></li>
            <li className="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      <section className="section dashboard">
        <div className="row">
          <div className="col-lg-12">
            <div className="row">
              {/* Employees Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card sales-card">
                  <div className="card-body">
                    <h5 className="card-title">Nhân viên</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-people"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.totalEmployees}</h6>
                        <span className="text-success small pt-1 fw-bold">
                          {stats.activeEmployees}
                        </span>{" "}
                        <span className="text-muted small pt-2 ps-1">đang hoạt động</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shifts Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card revenue-card">
                  <div className="card-body">
                    <h5 className="card-title">Ca làm việc</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-calendar3"></i>
                      </div>
                      <div className="ps-3">
                        <h6>{stats.totalShifts}</h6>
                        <span className="text-muted small pt-2 ps-1">ca làm việc</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Card */}
              <div className="col-xxl-4 col-md-4">
                <div className="card info-card customers-card">
                  <div className="card-body">
                    <h5 className="card-title">Phòng ban của bạn</h5>
                    <div className="d-flex align-items-center">
                      <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                        <i className="bi bi-building"></i>
                      </div>
                      <div className="ps-3">
                        <h6>Phòng {departmentName}</h6>
                        <span className="text-muted small pt-2 ps-1">Quản lý</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Top nhân viên đi muộn trong tháng</h5>
              <canvas id="lateEmployeesChart"></canvas>
              <div className="mt-3">
                {attendanceStats.lateEmployees.map(([name, count], index) => (
                  <div key={index} className="mb-2">
                    {index + 1}. {name}: {count} lần
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Top nhân viên đi làm đúng giờ trong tháng</h5>
              <canvas id="punctualEmployeesChart"></canvas>
              <div className="mt-3">
                {attendanceStats.punctualEmployees.map(([name, count], index) => (
                  <div key={index} className="mb-2">
                    {index + 1}. {name}: {count} lần
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
