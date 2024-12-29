import React, { useState, useEffect, useRef } from 'react';
import { Button, message, Space, DatePicker, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [workingTime, setWorkingTime] = useState(null);
  const [checkinTime, setCheckinTime] = useState(null);
  const scannerRef = useRef(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [dateRange, setDateRange] = useState([]);

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      key: 'shiftName',
      render: (shift) => shift.shiftName,
    },
    {
      title: 'Giờ ca',
      dataIndex: 'shift',
      key: 'shiftTime',
      render: (shift) => `${shift.startTime} - ${shift.endTime}`,
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkInTime',
      key: 'checkInTime',
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOutTime',
      key: 'checkOutTime',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.isLate && record.isEarlyLeave) return 'Đi muộn & Về sớm';
        if (record.isLate) return 'Đi muộn';
        if (record.isEarlyLeave) return 'Về sớm';
        return 'Đúng giờ';
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (text) => text || '-',
    },
  ];

  const fetchAttendanceData = async (startDate, endDate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/timekeeping/employee/${user.id}`,
        {
          params: {
            startDate: dayjs(startDate).format('YYYY-MM-DD'),
            endDate: dayjs(endDate).format('YYYY-MM-DD'),
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAttendanceData(response.data.data);
      }
    } catch (error) {
      message.error('Không thể tải dữ liệu chấm công');
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
      fetchAttendanceData(dates[0], dates[1]);
    } else {
      setDateRange([]);
      setAttendanceData([]);
    }
  };

  const handleQRScan = async (decodedText, type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const config = {
        method: 'post',
        url: `${process.env.REACT_APP_API_URL}/timekeeping/${type}/qr${decodedText.split('qr')[1]}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const response = await axios(config);
      
      if (response.data.success) {
        if (type === 'checkin') {
          message.success('Điểm danh vào thành công!');
          setCheckinTime(new Date());
        } else {
          message.success('Điểm danh ra thành công!');
          setCheckinTime(null);
          setWorkingTime(null);
        }
        // Dừng quét QR sau khi thành công
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        setIsScanning(false);
      } else {
        message.error(response.data.message || 'Điểm danh thất bại');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi điểm danh');
    }
  };

  const startQRScanner = (type) => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner('reader', {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        });
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => handleQRScan(decodedText, type),
          (error) => {
            if (error) {
              console.error(error);
            }
          }
        );
      } catch (error) {
        console.error('Error starting scanner:', error);
        message.error('Không thể khởi động máy quét QR');
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (checkinTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now - checkinTime;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setWorkingTime(`${hours}:${minutes}:${seconds}`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [checkinTime]);

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Trang Nhân Viên</h1>
      
      {workingTime && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Thời gian làm việc: {workingTime}</h2>
        </div>
      )}

      <Space>
        {!isScanning ? (
          <>
            <Button type="primary" onClick={() => startQRScanner('checkin')}>
              Điểm Danh Vào
            </Button>
            <Button type="primary" danger onClick={() => startQRScanner('checkout')}>
              Điểm Danh Ra
            </Button>
          </>
        ) : (
          <>
            <div id="reader" style={{ width: '100%', maxWidth: '600px' }}></div>
            <Button onClick={stopScanner}>Hủy quét</Button>
          </>
        )}
      </Space>

      <div style={{ marginTop: '40px' }}>
        <h2>Bảng Chấm Công</h2>
        <Space direction="vertical" style={{ width: '100%' }}>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            style={{ marginBottom: '20px' }}
          />
          <Table
            columns={columns}
            dataSource={attendanceData}
            rowKey="id"
            pagination={false}
          />
        </Space>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
