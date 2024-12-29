import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Modal } from 'bootstrap';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/api';
import { toast } from 'react-toastify';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    departmentName: '',
    description: ''
  });
  
  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    // Initialize Bootstrap modals
    addModalRef.current = new Modal(document.getElementById('addDepartmentModal'));
    editModalRef.current = new Modal(document.getElementById('editDepartmentModal'));
    deleteModalRef.current = new Modal(document.getElementById('deleteDepartmentModal'));
    
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await getDepartments();
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách phòng ban');
      console.error('Error fetching departments:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await createDepartment(formData);
      toast.success('Thêm phòng ban thành công');
      addModalRef.current.hide();
      setFormData({ departmentName: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error('Lỗi khi thêm phòng ban');
      console.error('Error adding department:', error);
    }
  };

  const handleEdit = async () => {
    try {
      await updateDepartment(selectedDepartment.id, formData);
      toast.success('Cập nhật phòng ban thành công');
      editModalRef.current.hide();
      fetchDepartments();
    } catch (error) {
      toast.error('Lỗi khi cập nhật phòng ban');
      console.error('Error updating department:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDepartment(selectedDepartment.id);
      toast.success('Xóa phòng ban thành công');
      deleteModalRef.current.hide();
      fetchDepartments();
    } catch (error) {
      toast.error('Lỗi khi xóa phòng ban');
      console.error('Error deleting department:', error);
    }
  };

  const columns = [
    {
      name: 'Tên phòng ban',
      selector: row => row.departmentName,
      sortable: true,
    },
    {
      name: 'Mô tả',
      selector: row => row.description,
      sortable: true,
    },
    {
      name: 'Trạng Thái',
      selector: row => row.isActive ? 'Đang Hoạt Động' : '-----',
      sortable: true,
    },
    {
      name: 'Thao tác',
      cell: row => (
        <>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => {
              setSelectedDepartment(row);
              setFormData({
                departmentName: row.departmentName,
                description: row.description
              });
              editModalRef.current.show();
            }}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => {
              setSelectedDepartment(row);
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
          <h5 className="card-title">Danh sách phòng ban</h5>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({ departmentName: '', description: '' });
              addModalRef.current.show();
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm phòng ban
          </button>
        </div>

        <DataTable
          columns={columns}
          data={departments}
          pagination
          progressPending={loading}
          responsive
          highlightOnHover
          striped
        />

        {/* Add Department Modal */}
        <div className="modal fade" id="addDepartmentModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm phòng ban mới</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Tên phòng ban</label>
                    <input
                      type="text"
                      className="form-control"
                      name="departmentName"
                      value={formData.departmentName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
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

        {/* Edit Department Modal */}
        <div className="modal fade" id="editDepartmentModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông tin phòng ban</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Tên phòng ban</label>
                    <input
                      type="text"
                      className="form-control"
                      name="departmentName"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mô tả</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
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
        <div className="modal fade" id="deleteDepartmentModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                Bạn có chắc chắn muốn xóa phòng ban <strong>{selectedDepartment?.name}</strong>?
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

export default DepartmentList;
