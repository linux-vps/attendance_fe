import React, { useState, useEffect, useRef } from 'react';
import DataTable from 'react-data-table-component';
import { Modal } from 'bootstrap';
import { getShifts, createShift, updateShift, deleteShift } from '../../services/api';
import { toast } from 'react-toastify';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const addModalRef = useRef(null);
  const editModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    // Initialize Bootstrap modals
    addModalRef.current = new Modal(document.getElementById('addShiftModal'));
    editModalRef.current = new Modal(document.getElementById('editShiftModal'));
    deleteModalRef.current = new Modal(document.getElementById('deleteShiftModal'));

    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const response = await getShifts();
      setShifts(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách ca làm việc');
      console.error('Error fetching shifts:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      await createShift(formData);
      toast.success('Thêm ca làm việc thành công');
      addModalRef.current.hide();
      setFormData({
        shiftName: '',
        startTime: '',
        endTime: '',
        description: ''
      });
      fetchShifts();
    } catch (error) {
      toast.error('Lỗi khi thêm ca làm việc');
      console.error('Error adding shift:', error);
    }
  };

  const handleEdit = async () => {
    try {
      const updatedShiftData = {
        ...formData,
        startTime: formData.startTime.substring(0, 5), // Lấy chỉ giờ:phút
        endTime: formData.endTime.substring(0, 5), // Lấy chỉ giờ:phút
      };
      await updateShift(selectedShift.id, updatedShiftData);
      toast.success('Cập nhật ca làm việc thành công');
      editModalRef.current.hide();
      fetchShifts();
    } catch (error) {
      toast.error('Lỗi khi cập nhật ca làm việc');
      console.error('Error updating shift:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteShift(selectedShift.id);
      toast.success('Xóa ca làm việc thành công');
      deleteModalRef.current.hide();
      fetchShifts();
    } catch (error) {
      toast.error('Lỗi khi xóa ca làm việc');
      console.error('Error deleting shift:', error);
    }
  };

  const columns = [
    {
      name: 'Tên ca',
      selector: row => row.shiftName,
      sortable: true,
    },
    {
      name: 'Giờ bắt đầu',
      selector: row => row.startTime,
      sortable: true,
    },
    {
      name: 'Giờ kết thúc',
      selector: row => row.endTime,
      sortable: true,
    },
    {
      name: 'Mô tả',
      selector: row => row.description,
      sortable: true,
    },
    {
      name: 'Thao tác',
      cell: row => (
        <>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => {
              setSelectedShift(row);
              setFormData({
                shiftName: row.shiftName,
                startTime: row.startTime,
                endTime: row.endTime,
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
              setSelectedShift(row);
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
          <h5 className="card-title">Danh sách ca làm việc</h5>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                shiftName: '',
                startTime: '',
                endTime: '',
                description: ''
              });
              addModalRef.current.show();
            }}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm ca làm việc
          </button>
        </div>

        <DataTable
          columns={columns}
          data={shifts}
          pagination
          progressPending={loading}
          responsive
          highlightOnHover
          striped
        />

        {/* Add Shift Modal */}
        <div className="modal fade" id="addShiftModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm ca làm việc mới</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Tên ca</label>
                    <input
                      type="text"
                      className="form-control"
                      name="shiftName"
                      value={formData.shiftName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giờ bắt đầu</label>
                    <input
                      type="time"
                      className="form-control"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giờ kết thúc</label>
                    <input
                      type="time"
                      className="form-control"
                      name="endTime"
                      value={formData.endTime}
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

        {/* Edit Shift Modal */}
        <div className="modal fade" id="editShiftModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông tin ca làm việc</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Tên ca</label>
                    <input
                      type="text"
                      className="form-control"
                      name="shiftName"
                      value={formData.shiftName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giờ bắt đầu</label>
                    <input
                      type="time"
                      className="form-control"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Giờ kết thúc</label>
                    <input
                      type="time"
                      className="form-control"
                      name="endTime"
                      value={formData.endTime}
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
        <div className="modal fade" id="deleteShiftModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                Bạn có chắc chắn muốn xóa ca làm việc <strong>{selectedShift?.shiftName}</strong>?
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

export default ShiftList;
