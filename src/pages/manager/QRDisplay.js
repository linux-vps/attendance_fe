import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QRDisplay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { qrCode, type, shiftId } = location.state || {};

  useEffect(() => {
    if (!qrCode) {
      navigate('/manager/attendance');
    }

    // Nếu là check-in thành công, lưu shiftId vào localStorage
    if (type === 'checkin') {
      localStorage.setItem('currentShiftId', shiftId);
    }
    // Nếu là check-out thành công, xóa dữ liệu khỏi localStorage
    else if (type === 'checkout') {
      localStorage.removeItem('currentShiftId');
      localStorage.removeItem('currentTimekeepingId');
    }
  }, [qrCode, navigate, type, shiftId]);

  if (!qrCode) {
    return null;
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">
                Mã QR {type === 'checkin' ? 'Check-in' : 'Check-out'}
              </h5>
              <div className="qr-container my-4">
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  style={{ maxWidth: '100%', height: 'auto' }} 
                />
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/manager/attendance')}
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDisplay;
