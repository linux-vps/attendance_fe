import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Modal } from 'bootstrap';
import { getDepartments, getManagers, createManager, updateManager, deleteManager } from '../../services/api';
import { toast } from 'react-toastify';

const ManagerList = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    departmentId: '',
    birthDate: ''
  });

  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    // Initialize Bootstrap modals
    addModalRef.current = new Modal(document.getElementById('addManagerModal'));
    editModalRef.current = new Modal(document.getElementById('editManagerModal'));
    deleteModalRef.current = new Modal(document.getElementById('deleteManagerModal'));

    fetchManagers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phòng ban');
      console.error('Error fetching departments:', error);
    }
  };

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const response = await getManagers();
      setManagers(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách quản lý');
      console.error('Error fetching managers:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      const managerData = {
        ...formData,
        role: "manager",
        birthDate: new Date(formData.birthDate).toISOString().split('T')[0]
      };
      await createManager(managerData);
      toast.success('Thêm quản lý thành công');
      addModalRef.current.hide();
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        departmentId: '',
        birthDate: ''
      });
      fetchManagers();
    } catch (error) {
      toast.error('Lỗi khi thêm quản lý');
      console.error('Error adding manager:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedData = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        departmentId: formData.departmentId,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : undefined
      };

      await updateManager(selectedManager.id, updatedData);
      toast.success('Cập nhật quản lý thành công');
      editModalRef.current.hide();
      fetchManagers();
    } catch (error) {
      toast.error('Lỗi khi cập nhật quản lý');
      console.error('Error updating manager:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteManager(selectedManager.id);
      toast.success('Xóa quản lý thành công');
      deleteModalRef.current.hide();
      fetchManagers();
    } catch (error) {
      toast.error('Lỗi khi xóa quản lý');
      console.error('Error deleting manager:', error);
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
      name: 'Phòng ban',
      selector: row => row.department?.departmentName || 'N/A',
      sortable: true,
    },
    {
      name: 'Thao tác',
      cell: row => (
        <>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => {
              console.log('Row data:', row);
              setSelectedManager(row);
              const formData = {
                email: row.email,
                fullName: row.fullName,
                phoneNumber: row.phoneNumber,
                departmentId: row.department?.id || '',
                birthDate: row.birthDate || ''
              };
              console.log('Initial form data:', formData);
              setFormData(formData);
              editModalRef.current.show();
            }}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              setSelectedManager(row);
              deleteModalRef.current.show();
            }}
          >
            <i className="bi bi-trash"></i>
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title">Danh sách quản lý</h5>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                email: '',
                password: '',
                fullName: '',
                phoneNumber: '',
                departmentId: '',
                birthDate: ''
              });
              addModalRef.current.show();
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm quản lý
          </button>
        </div>

        <DataTable
          columns={columns}
          data={managers}
          pagination
          progressPending={loading}
          responsive
          highlightOnHover
          striped
        />

        {/* Add Manager Modal */}
        <div className="modal fade" id="addManagerModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm quản lý mới</h5>
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
                  <div className="mb-3">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phòng ban</label>
                    <select
                      className="form-select"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn phòng ban</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
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

        {/* Edit Manager Modal */}
        <div className="modal fade" id="editManagerModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông tin quản lý</h5>
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
                  <div className="mb-3">
                    <label className="form-label">Phòng ban</label>
                    <select
                      className="form-select"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn phòng ban</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
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
        <div className="modal fade" id="deleteManagerModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                Bạn có chắc chắn muốn xóa quản lý <strong>{selectedManager?.fullName}</strong>?
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

export default ManagerList;