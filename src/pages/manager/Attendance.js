import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQRCode, getShifts } from '../../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const Attendance = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [type, setType] = useState('checkin');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await getShifts();
      setShifts(response.data.data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Lỗi khi lấy danh sách ca làm việc');
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedShift) {
      toast.error('Vui lòng chọn ca làm việc');
      return;
    }

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

    setLoading(true);
    try {
      const data = {
        departmentId: departmentId,
        type: type,
        shiftId: selectedShift
      };

      const response = await generateQRCode(data);
      
      navigate('/manager/qr-display', { 
        state: { 
          qrCode: response.data.data,
          type: type,
          shiftId: selectedShift
        } 
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Lỗi khi tạo mã QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Tạo mã QR điểm danh</h5>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Loại điểm danh</label>
            <select 
              className="form-select" 
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="checkin">Check-in (Bắt đầu ca)</option>
              <option value="checkout">Check-out (Kết thúc ca)</option>
            </select>
          </div>
          
          <div className="col-md-6">
            <label className="form-label">Chọn ca làm việc</label>
            <select 
              className="form-select"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="">-- Chọn ca làm việc --</option>
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.shiftName} ({shift.startTime} - {shift.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center">
          <button 
            className="btn btn-primary"
            onClick={handleGenerateQR}
            disabled={loading || !selectedShift}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang tạo mã QR...
              </>
            ) : (
              'Tạo mã QR'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
