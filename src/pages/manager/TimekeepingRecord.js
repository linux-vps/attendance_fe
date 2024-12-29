import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const TimekeepingRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState('N/A'); // State mới để lưu departmentName

  useEffect(() => {
    fetchTimekeepingRecords();
  }, []);

  const fetchTimekeepingRecords = async () => {
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

      // Gọi API để lấy departmentName
      const departmentsResponse = await axios.get('/departments');
      const departmentName = departmentsResponse.data.data.departmentName;
      setDepartmentName(departmentName); // Lưu departmentName vào state
      
      console.log("Danh sách departments:", departmentsResponse.data);

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  
      const response = await axios.get(`/timekeeping/department/${departmentId}`, {
        params: {
          startDate,
          endDate
        }
      });
      
      setRecords(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu chấm công');
      console.error('Error fetching timekeeping records:', error);
    } finally {
      setLoading(false);
    }
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
      selector: row => row.employee?.fullName || 'N/A',
      sortable: true,
    },
    {
      name: 'Tên Phòng ban',
      selector: row => departmentName || row.employee?.department?.departmentName || 'N/A', // Ưu tiên lấy từ departmentName state
      sortable: true,
    },
    {
      name: 'Ngày',
      selector: row => {
        try {
          return new Date(row.date).toLocaleDateString('vi-VN');
        } catch (error) {
          return 'N/A';
        }
      },
      sortable: true,
    },
    {
      name: 'Giờ vào',
      selector: row => row.checkInTime || 'N/A',
      sortable: true,
    },
    {
      name: 'Giờ ra',
      selector: row => row.checkOutTime || '---',
      sortable: true,
    },
    {
      name: 'Trạng thái',
      cell: row => {
        const checkInTime = row.checkInTime;
        const shiftStartTime = row.shift?.startTime;

        if (!checkInTime || !shiftStartTime) {
          return <span className="badge bg-secondary">Không xác định</span>;
        }

        const convertTimeToMinutes = (timeString) => {
          const [hours, minutes] = timeString.split(':').map(Number);
          return hours * 60 + minutes;
        };

        const checkInMinutes = convertTimeToMinutes(checkInTime);
        const shiftStartMinutes = convertTimeToMinutes(shiftStartTime);
        const LATE_THRESHOLD = 5;

        return (
          <div>
            {checkInMinutes > (shiftStartMinutes + LATE_THRESHOLD) && (
              <span className="badge bg-warning me-1">Đi muộn</span>
            )}
            {row.isEarlyLeave && (
              <span className="badge bg-warning">Về sớm</span>
            )}
            {checkInMinutes <= (shiftStartMinutes + LATE_THRESHOLD) && !row.isEarlyLeave && (
              <span className="badge bg-success">Đúng giờ</span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Bảng ghi chấm công</h5>
        
        <DataTable
          columns={columns}
          data={records}
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
              Không có dữ liệu chấm công
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TimekeepingRecords;
