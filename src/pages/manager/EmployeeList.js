import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Modal } from 'bootstrap';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/api';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: ''
  });
  
  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    // Initialize Bootstrap modals
    addModalRef.current = new Modal(document.getElementById('addEmployeeModal'));
    editModalRef.current = new Modal(document.getElementById('editEmployeeModal'));
    deleteModalRef.current = new Modal(document.getElementById('deleteEmployeeModal'));
    
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
      console.error('Error fetching employees:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await createEmployee(formData);
      toast.success('Thêm nhân viên thành công');
      addModalRef.current.hide();
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: ''
      });
      fetchEmployees();
    } catch (error) {
      toast.error('Lỗi khi thêm nhân viên');
      console.error('Error adding employee:', error);
    }
  };

  const handleEdit = async () => {
    try {
      await updateEmployee(selectedEmployee.id, formData);
      toast.success('Cập nhật nhân viên thành công');
      editModalRef.current.hide();
      fetchEmployees();
    } catch (error) {
      toast.error('Lỗi khi cập nhật nhân viên');
      console.error('Error updating employee:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(selectedEmployee.id);
      toast.success('Xóa nhân viên thành công');
      deleteModalRef.current.hide();
      fetchEmployees();
    } catch (error) {
      toast.error('Lỗi khi xóa nhân viên');
      console.error('Error deleting employee:', error);
    }
  };

  const columns = [
    {
      name: 'Họ và tên',
      selector: row => row.fullName,
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Số điện thoại',
      selector: row => row.phoneNumber,
      sortable: true,
    },
    {
      name: 'Thao tác',
      cell: row => (
        <>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => {
              setSelectedEmployee(row);
              setFormData({
                email: row.email,
                fullName: row.fullName,
                phoneNumber: row.phoneNumber
              });
              editModalRef.current.show();
            }}
          >
            <i className="bi bi-pencil"></i>
          </button>
          {/* Chỉ hiển thị nút xóa khi user là admin */}
          {user?.role === 'admin' && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                setSelectedEmployee(row);
                deleteModalRef.current.show();
              }}
            >
              <i className="bi bi-trash"></i>
            </button>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title">Danh sách nhân viên</h5>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                email: '',
                password: '',
                fullName: '',
                phoneNumber: ''
              });
              addModalRef.current.show();
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm nhân viên
          </button>
        </div>

        <DataTable
          columns={columns}
          data={employees}
          pagination
          progressPending={loading}
          responsive
          highlightOnHover
          striped
        />

        {/* Add Employee Modal */}
        <div className="modal fade" id="addEmployeeModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm nhân viên mới</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleAdd}>Thêm</button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Employee Modal */}
        <div className="modal fade" id="editEmployeeModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông tin nhân viên</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleEdit}>Lưu</button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <div className="modal fade" id="deleteEmployeeModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                Bạn có chắc chắn muốn xóa nhân viên <strong>{selectedEmployee?.fullName}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
