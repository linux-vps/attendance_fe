import React, { useState } from 'react';
import { generateQRCode, checkIn, checkOut } from '../../services/api';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const Timekeeping = () => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrType, setQrType] = useState('checkin');
  const [timekeepingId, setTimekeepingId] = useState('');

  const generateNewQRCode = async () => {
    try {
      const response = await generateQRCode({
        departmentId: localStorage.getItem('departmentId'),
        type: qrType,
        timekeepingId: timekeepingId
      });
      
      setQrCodeData(response.data.data.qrCode);
      toast.success('Tạo mã QR thành công');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Lỗi khi tạo mã QR');
    }
  };

  const handleManualCheckIn = async () => {
    try {
      const checkInData = {
        employeeId: '', // Cần thêm form để chọn nhân viên
        checkInTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
        shiftId: '', // Cần thêm form để chọn ca làm việc
        note: ''
      };
      
      const response = await checkIn(checkInData);
      setTimekeepingId(response.data.data.id); // Lưu ID cho checkout sau này
      toast.success('Check-in thành công');
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Lỗi khi check-in');
    }
  };

  const handleManualCheckOut = async () => {
    if (!timekeepingId) {
      toast.error('Vui lòng check-in trước');
      return;
    }

    try {
      const checkOutData = {
        checkOutTime: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      
      await checkOut(timekeepingId, checkOutData);
      setTimekeepingId(''); // Reset ID sau khi checkout
      toast.success('Check-out thành công');
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Lỗi khi check-out');
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Quản lý chấm công</h5>

        {/* QR Code Generation Section */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Tạo mã QR chấm công</h5>
                <div className="mb-3">
                  <select 
                    className="form-select"
                    value={qrType}
                    onChange={(e) => setQrType(e.target.value)}
                  >
                    <option value="checkin">Check-in</option>
                    <option value="checkout">Check-out</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={generateNewQRCode}
                >
                  Tạo mã QR
                </button>
                {qrCodeData && (
                  <div className="text-center mt-3">
                    <QRCodeSVG value={qrCodeData} size={200} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual Check-in/out Section */}
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Chấm công thủ công</h5>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={handleManualCheckIn}
                    disabled={timekeepingId !== ''}
                  >
                    Check-in thủ công
                  </button>
                  <button 
                    className="btn btn-warning"
                    onClick={handleManualCheckOut}
                    disabled={!timekeepingId}
                  >
                    Check-out thủ công
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Section */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Lịch sử chấm công</h5>
                <p>Tính năng đang được phát triển...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timekeeping;
