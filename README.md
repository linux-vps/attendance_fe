# Hệ thống Quản lý Chấm Công

Hệ thống quản lý chấm công được xây dựng bằng ReactJS, sử dụng template NiceAdmin.

## Tính năng

- Đăng nhập với JWT Authentication
- Quản lý tài khoản Manager
- Quản lý phòng ban (Department)
- Dashboard thống kê
- Giao diện responsive
- Hỗ trợ tiếng Việt

## Yêu cầu hệ thống

- Node.js version 14.0.0 trở lên
- NPM version 6.0.0 trở lên

## Cài đặt

1. Clone repository:
\`\`\`bash
git clone [repository-url]
\`\`\`

2. Cài đặt dependencies:
\`\`\`bash
npm install
\`\`\`

3. Tạo file .env và cấu hình các biến môi trường:
\`\`\`
REACT_APP_API_URL=http://localhost:3000
REACT_APP_NAME=Attendance Management System
\`\`\`

4. Chạy ứng dụng ở môi trường development:
\`\`\`bash
npm start
\`\`\`

## Cấu trúc thư mục

- \`src/\`: Thư mục chứa source code
  - \`components/\`: Các component có thể tái sử dụng
  - \`contexts/\`: Context API cho state management
  - \`pages/\`: Các trang của ứng dụng
  - \`utils/\`: Các utility function
  - \`layouts/\`: Layout components

## Sử dụng

1. Đăng nhập với tài khoản admin:
   - Email: admin@example.com
   - Password: Admin123!

2. Truy cập các chức năng:
   - Dashboard: Xem thống kê tổng quan
   - Quản lý Manager: CRUD operations cho tài khoản manager
   - Quản lý Department: CRUD operations cho phòng ban

## API Documentation

API documentation có thể được tìm thấy trong file Postman Collection đi kèm.

## Công nghệ sử dụng

- ReactJS
- React Router DOM
- Axios
- Bootstrap 5
- React Data Table Component
- JWT Authentication
