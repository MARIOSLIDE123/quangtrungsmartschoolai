/**
 * ==============================================================================
 * CẤU HÌNH KẾT NỐI GOOGLE SHEETS & GOOGLE APPS SCRIPT
 * Trường Tiểu học Quang Trung - Quang Trung SmartSchool AI
 * ==============================================================================
 * 
 * HƯỚNG DẪN DÀNH CHO QUẢN TRỊ VIÊN:
 * 1. Sau khi Deploy (Triển khai) Web App từ Google Apps Script trên Google Sheet của trường,
 *    hãy dán đường dẫn Web App URL vào biến `webAppUrl` bên dưới.
 * 2. Mọi thao tác: Thêm/Sửa/Xóa nhiệm vụ, tải minh chứng, duyệt hồ sơ, đổi người dùng (đăng nhập),
 *    nhật ký điều hành sẽ được tự động đồng bộ 2 chiều lên Google Sheet và ngược lại.
 */

export const GOOGLE_SHEET_CONFIG = {
  // 1. ĐƯỜNG DẪN WEB APP GOOGLE APPS SCRIPT CỦA NHÀ TRƯỜNG:
  webAppUrl: 'https://script.google.com/macros/s/AKfycbw2FBguyCmQIzSxxJX31mDSyYrQTiQ6WfDp-DkAtptqEqrbelxg3tDw1bk-0TIXa9E9/exec',

  // 2. Tự động đồng bộ lên Google Sheet mỗi khi có thay đổi dữ liệu hoặc hành động
  autoSync: true,

  // 3. Chu kỳ tự động kiểm tra và kéo dữ liệu mới nhất từ Google Sheet về App (tính bằng mili-giây)
  // Mặc định: 15000ms = 15 giây. Đặt 0 nếu chỉ muốn đồng bộ khi mở app hoặc khi bấm nút.
  syncIntervalMs: 15000,
};
