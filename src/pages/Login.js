import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Toast } from '../components/Toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Đang đăng nhập với:', formData);
      const result = await login(formData.email, formData.password);
      console.log('Kết quả đăng nhập:', result);

      if (result.success) {
        console.log('Đăng nhập thành công với role:', result.role);
        // Chuyển hướng dựa vào role
        if (result.role === 'admin') {
          navigate('/admin');
        } else if (result.role === 'manager') {
          navigate('/manager');
        } else if (result.role === 'user') {
          navigate('/employee');
        } else {
          console.error('Role không hợp lệ:', result.role);
          Toast.error('Role không hợp lệ');
        }
      } else {
        // Đợi một chút để đảm bảo Bootstrap đã được load
        setTimeout(() => {
          Toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }, 100);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Đợi một chút để đảm bảo Bootstrap đã được load
      setTimeout(() => {
        Toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="container">
        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
                <div className="d-flex justify-content-center py-4">
                  <a href="/" className="logo d-flex align-items-center w-auto">
                    <img src="assets/img/logo.png" alt="" />
                    <span className="d-none d-lg-block">Quản lý chấm công</span>
                  </a>
                </div>

                <div className="card mb-3">
                  <div className="card-body">
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">Đăng nhập</h5>
                      <p className="text-center small">Nhập email và mật khẩu để đăng nhập</p>
                    </div>

                    <form className="row g-3" onSubmit={handleSubmit}>
                      <div className="col-12">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div className="input-group">
                          <span className="input-group-text" id="inputGroupPrepend">@</span>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          id="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <button 
                          className="btn btn-primary w-100" 
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Đang đăng nhập...
                            </>
                          ) : (
                            'Đăng nhập'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
