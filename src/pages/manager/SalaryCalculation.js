import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import * as XLSX from 'xlsx';

const SalaryCalculation = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleMonthChange = (event) => {
    const [year, month] = event.target.value.split('-');
    setCurrentMonth(new Date(year, month - 1));
    calculateSalaryData(new Date(year, month - 1));
  };

  useEffect(() => {
    calculateSalaryData(currentMonth);
  }, []);

  const calculateSalaryData = async (date) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập lại');
        return;
      }

      const decodedToken = jwtDecode(token);
      const departmentId = decodedToken.departmentId;

      if (!departmentId) {
        toast.error('Không tìm thấy thông tin phòng ban');
        return;
      }

      // Lấy ngày đầu và cuối của tháng được chọn
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];


      // Lấy dữ liệu chấm công
      const response = await axios.get(`/timekeeping/department/${departmentId}`, {
        params: {
          startDate,
          endDate
        }
      });

      // Xử lý và tính toán dữ liệu lương
      const processedData = processTimekeepingData(response.data.data);
      setSalaryData(processedData);

    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu lương');
      console.error('Error calculating salary data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimekeepingData = (records) => {
    // Nhóm dữ liệu theo nhân viên
    const employeeData = records.reduce((acc, record) => {
      const employeeId = record.employee?.id;
      if (!employeeId) return acc;

      if (!acc[employeeId]) {
        acc[employeeId] = {
          id: employeeId,
          fullName: record.employee?.fullName || 'N/A',
          totalWorkDays: 0,
          lateDays: 0
        };
      }

      // Tính số công và số ngày đi muộn
      acc[employeeId].totalWorkDays += 1;
      
      const checkInTime = record.checkInTime;
      const shiftStartTime = record.shift?.startTime;

      if (checkInTime && shiftStartTime) {
        const convertTimeToMinutes = (timeString) => {
          const [hours, minutes] = timeString.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const checkInMinutes = convertTimeToMinutes(checkInTime);
        const shiftStartMinutes = convertTimeToMinutes(shiftStartTime);
        const LATE_THRESHOLD = 5;

        if (checkInMinutes > (shiftStartMinutes + LATE_THRESHOLD)) {
          acc[employeeId].lateDays += 1;
        }
      }

      return acc;
    }, {});

    return Object.values(employeeData);
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id || 'N/A',
      sortable: true,
      width: '180px'
    },
    {
      name: 'Tên nhân viên',
      selector: row => row.fullName,
      sortable: true,
    },
    {
      name: 'Số công',
      selector: row => row.totalWorkDays,
      sortable: true,
    },
    {
      name: 'Số công đi muộn',
      selector: row => row.lateDays,
      sortable: true,
    }
  ];

  const exportToExcel = () => {
    try {
      // Tạo dữ liệu để xuất
      const exportData = salaryData.map(item => ({
        'ID': item.id,
        'Tên nhân viên': item.fullName,
        'Số công': item.totalWorkDays,
        'Số công đi muộn': item.lateDays
      }));

      // Tạo workbook mới
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Tùy chỉnh độ rộng cột
      const columnWidths = [
        { wch: 15 },  // ID
        { wch: 30 },  // Tên nhân viên
        { wch: 15 },  // Số công
        { wch: 20 },  // Số công đi muộn
      ];
      ws['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(
        wb, 
        ws, 
        `Bảng công ${currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}`
      );

      // Tạo tên file với tháng và năm
      const fileName = `Bang_Cong_${currentMonth.getMonth() + 1}_${currentMonth.getFullYear()}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);

      toast.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Lỗi khi xuất file Excel');
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title">
            Bảng công tháng {currentMonth.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
          </h5>
          <div className="d-flex gap-2">
            <input
              type="month"
              className="form-control"
              style={{ width: 'auto' }}
              value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`}
              onChange={handleMonthChange}
            />
            <button 
              className="btn btn-success"
              onClick={exportToExcel}
              disabled={loading || salaryData.length === 0}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>
              Xuất Excel
            </button>
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={salaryData}
          pagination
          progressPending={loading}
          progressComponent={
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          }
          noDataComponent={
            <div className="text-center my-3">
              Không có dữ liệu bảng lương
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SalaryCalculation;