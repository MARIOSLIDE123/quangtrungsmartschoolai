/**
 * ==============================================================================
 * KỊCH BẢN GOOGLE APPS SCRIPT CHO QUANG TRUNG SMARTSCHOOL AI
 * Bản quyền: Trường Tiểu học Quang Trung - Hệ thống Quản trị & Điều hành Liên Cơ sở
 * Ban Giám hiệu:
 *   - Thầy Nguyễn Văn Thông - Hiệu trưởng
 *   - Cô Tạ Thị Hằng - Phó Hiệu trưởng
 *   - Cô Đào Thị Hồng Duyên - Phó Hiệu trưởng
 * ==============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (5 BƯỚC):
 * 1. Mở trang tính Google Sheets của bạn (hoặc tạo file mới đặt tên "Quang Trung SmartSchool AI Data").
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết mã cũ trong file Mã.gs (Code.gs) và DÁN TOÀN BỘ NỘI DUNG FILE NÀY VÀO.
 * 4. Nhấn nút "Lưu" (biểu tượng đĩa mềm), sau đó tại danh sách hàm, chọn hàm "setupSheets" và nhấn "Chạy" (Run)
 *    -> Cấp quyền truy cập một lần -> Các trang tính Tasks, Evidences, Events, Plans, ActivityLogs sẽ được tạo tự động với tiêu đề đẹp mắt.
 * 5. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment):
 *    - Loại: Ứng dụng web (Web app)
 *    - Mô tả: SmartSchool AI Web App Sync v1
 *    - Người thực thi: Tôi (Execute as: Me)
 *    - Ai có quyền truy cập: Bất kỳ ai (Who has access: Anyone)  <-- BẮT BUỘC CHỌN ANYONE
 *    - Nhấn "Triển khai" và COPY đường dẫn URL Web App (kết thúc bằng /exec).
 * 6. Mở file `src/config/googleSheetConfig.ts` trong code của bạn, dán URL vừa copy vào `webAppUrl`.
 * ==============================================================================
 */

// Tên các trang tính trong file Google Sheets
var SHEETS = {
  TASKS: 'Tasks',
  EVIDENCES: 'Evidences',
  EVENTS: 'Events',
  PLANS: 'Plans',
  LOGS: 'ActivityLogs',
  CAMPUSES: 'Campuses',
  USERS: 'Users',
  STAFF: 'Staff'
};

/**
 * Hàm khởi tạo bảng tính - Chạy hàm này đầu tiên để tự động tạo và định dạng 8 sheet
 */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet TASKS
  setupSheet(ss, SHEETS.TASKS, [
    'ID', 'Mã nhiệm vụ', 'Tên nhiệm vụ', 'Mô tả', 'Mã cơ sở', 'Tên cơ sở',
    'Người phụ trách', 'Chức danh phụ trách', 'Mức ưu tiên', 'Hạn hoàn thành',
    'Tiến độ (%)', 'Trạng thái', 'Yêu cầu minh chứng', 'Danh sách ID minh chứng',
    'Người tạo', 'Ngày tạo', 'Ngày cập nhật', 'Người duyệt', 'Ngày duyệt', 'Nhận xét duyệt'
  ], '#1E40AF');

  // 2. Sheet EVIDENCES
  setupSheet(ss, SHEETS.EVIDENCES, [
    'ID', 'Mã minh chứng', 'Tiêu đề minh chứng', 'Mã nhiệm vụ', 'Tên nhiệm vụ',
    'Cơ sở', 'Loại tệp', 'Dung lượng', 'Đường dẫn liên kết', 'Người tải lên',
    'Ngày tải lên', 'Trạng thái duyệt', 'Người duyệt', 'Nhận xét thẩm định'
  ], '#047857');

  // 3. Sheet EVENTS
  setupSheet(ss, SHEETS.EVENTS, [
    'ID', 'Tiêu đề sự kiện', 'Loại sự kiện', 'Bắt đầu', 'Kết thúc',
    'Địa điểm', 'Cơ sở áp dụng', 'Người chủ trì', 'Ghi chú'
  ], '#B45309');

  // 4. Sheet PLANS
  setupSheet(ss, SHEETS.PLANS, [
    'ID', 'Mã kế hoạch', 'Tiêu đề kế hoạch', 'Loại kế hoạch', 'Năm học',
    'Học kỳ', 'Trạng thái', 'Cơ sở áp dụng', 'Tiến độ (%)', 'Người lập',
    'Người duyệt', 'Ngày tạo', 'Mục tiêu trọng tâm'
  ], '#4338CA');

  // 5. Sheet LOGS
  setupSheet(ss, SHEETS.LOGS, [
    'Thời gian', 'Loại đối tượng', 'Mã định danh', 'Hành động',
    'Người thực hiện', 'Chức danh', 'Chi tiết thao tác'
  ], '#374151');

  // 6. Sheet CAMPUSES
  setupSheet(ss, SHEETS.CAMPUSES, [
    'Mã cơ sở', 'Tên khu trường', 'Tên ngắn', 'Địa chỉ', 'Người phụ trách',
    'Chức vụ', 'Số điện thoại', 'Số lớp', 'Số học sinh', 'Số giáo viên', 'Màu sắc'
  ], '#0F766E');

  // 7. Sheet USERS
  setupSheet(ss, SHEETS.USERS, [
    'ID tài khoản', 'Họ và tên', 'Vai trò hệ thống', 'Chức danh hiển thị',
    'Phạm vi cơ sở', 'Tên phạm vi', 'Ký hiệu Avatar'
  ], '#4B5563');

  // 8. Sheet STAFF (Hồ sơ nhân sự - 14 trường dữ liệu theo Bộ GD&ĐT)
  setupSheet(ss, SHEETS.STAFF, [
    'Mã nội bộ', 'Mã định danh Bộ GD&ĐT', 'Họ và tên', 'Ngày sinh', 'Giới tính',
    'Trạng thái', 'Dân tộc', 'Điện thoại', 'Vị trí việc làm', 'Nhóm chức vụ',
    'Hình thức hợp đồng', 'Trình độ chuyên môn', 'Môn dạy', 'Phân hiệu', 'Cảnh báo'
  ], '#0284C7');

  // Xóa Sheet mặc định (Sheet1 hoặc Trang tính 1) nếu còn trống
  var defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính 1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  Logger.log('Đã tạo thành công 7 trang tính với định dạng chuẩn mực!');
}

/**
 * Tiện ích tạo và tô màu dòng tiêu đề cho Sheet
 */
function setupSheet(ss, sheetName, headers, headerColor) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Thiết lập tiêu đề ở dòng 1
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setFontWeight('bold');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setBackground(headerColor);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
}

/**
 * Xử lý GET request (Đọc toàn bộ dữ liệu từ Google Sheets về App)
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';

    if (action === 'ping') {
      return jsonResponse({
        status: 'ok',
        appName: 'QUANG TRUNG SMARTSCHOOL AI',
        message: 'Kết nối Google Apps Script thành công!',
        timestamp: new Date().toISOString()
      });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = {
      tasks: readSheetObjects(ss.getSheetByName(SHEETS.TASKS), taskRowToObject),
      evidences: readSheetObjects(ss.getSheetByName(SHEETS.EVIDENCES), evidenceRowToObject),
      events: readSheetObjects(ss.getSheetByName(SHEETS.EVENTS), eventRowToObject),
      plans: readSheetObjects(ss.getSheetByName(SHEETS.PLANS), planRowToObject),
      logs: readSheetObjects(ss.getSheetByName(SHEETS.LOGS), logRowToObject)
    };

    return jsonResponse({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Xử lý POST request (Ghi dữ liệu từ App lên Google Sheets)
 */
function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    var action = body.action || (e && e.parameter && e.parameter.action);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Ghi nhật ký hành động / đăng nhập
    if (action === 'logActivity' && body.log) {
      appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã ghi nhật ký hoạt động' });
    }

    // 2. Đồng bộ danh sách nhiệm vụ (Tasks)
    if (action === 'syncTasks' && Array.isArray(body.tasks)) {
      writeTasksToSheet(ss, body.tasks);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã cập nhật danh sách nhiệm vụ' });
    }

    // 3. Đồng bộ danh sách minh chứng (Evidences)
    if (action === 'syncEvidences' && Array.isArray(body.evidences)) {
      writeEvidencesToSheet(ss, body.evidences);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã cập nhật kho minh chứng' });
    }

    // 4. Đồng bộ lịch sự kiện (Events)
    if (action === 'syncEvents' && Array.isArray(body.events)) {
      writeEventsToSheet(ss, body.events);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã cập nhật lịch công tác' });
    }

    // 5. Đồng bộ kế hoạch (Plans)
    if (action === 'syncPlans' && Array.isArray(body.plans)) {
      writePlansToSheet(ss, body.plans);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã cập nhật kế hoạch' });
    }

    // 6. Đồng bộ toàn bộ dữ liệu (Full Sync)
    if (action === 'syncAll' && body.data) {
      if (body.data.tasks) writeTasksToSheet(ss, body.data.tasks);
      if (body.data.evidences) writeEvidencesToSheet(ss, body.data.evidences);
      if (body.data.events) writeEventsToSheet(ss, body.data.events);
      if (body.data.plans) writePlansToSheet(ss, body.data.plans);
      if (body.data.logs) writeLogsToSheet(ss, body.data.logs);
      if (body.data.staff) writeStaffToSheet(ss, body.data.staff);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã đồng bộ toàn bộ dữ liệu vào Google Sheets' });
    }

    // 7. Đồng bộ danh sách hồ sơ nhân sự (Staff)
    if (action === 'syncStaff' && Array.isArray(body.staff)) {
      writeStaffToSheet(ss, body.staff);
      if (body.log) appendActivityLog(ss, body.log);
      return jsonResponse({ success: true, message: 'Đã cập nhật danh sách nhân sự' });
    }

    // 8. Yêu cầu kéo toàn bộ dữ liệu về
    if (action === 'pullAll' || action === 'getAll') {
      var fullData = {
        tasks: readSheetObjects(ss.getSheetByName(SHEETS.TASKS), taskRowToObject),
        evidences: readSheetObjects(ss.getSheetByName(SHEETS.EVIDENCES), evidenceRowToObject),
        events: readSheetObjects(ss.getSheetByName(SHEETS.EVENTS), eventRowToObject),
        plans: readSheetObjects(ss.getSheetByName(SHEETS.PLANS), planRowToObject),
        logs: readSheetObjects(ss.getSheetByName(SHEETS.LOGS), logRowToObject),
        staff: readSheetObjects(ss.getSheetByName(SHEETS.STAFF), staffRowToObject)
      };
      return jsonResponse({ success: true, data: fullData });
    }

    return jsonResponse({ success: false, error: 'Hành động không hợp lệ: ' + action });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Ghi 1 dòng nhật ký vào Sheet ActivityLogs
 */
function appendActivityLog(ss, log) {
  var sheet = ss.getSheetByName(SHEETS.LOGS);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.LOGS);
  }
  
  var time = log.timestamp || Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
  sheet.appendRow([
    time,
    log.entityType || 'Hệ thống',
    log.entityId || '',
    log.action || 'Thao tác',
    log.actor || 'Ban Giám hiệu',
    log.actorRole || '',
    log.details || ''
  ]);
}

/**
 * Ghi đè danh sách Tasks vào Sheet Tasks
 */
function writeTasksToSheet(ss, tasks) {
  var sheet = ss.getSheetByName(SHEETS.TASKS);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.TASKS);
  }

  // Xóa các hàng cũ (trừ hàng tiêu đề)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (tasks.length === 0) return;

  var rows = tasks.map(function(t) {
    return [
      t.id || '',
      t.taskCode || '',
      t.title || '',
      t.description || '',
      t.campusId || '',
      t.campusName || '',
      t.assignee || '',
      t.assigneeRole || '',
      t.priority || 'Bình thường',
      t.dueDate || '',
      t.progress || 0,
      t.status || 'Đang thực hiện',
      t.evidenceRequired ? 'Có' : 'Không',
      (t.evidenceIds && Array.isArray(t.evidenceIds)) ? t.evidenceIds.join(', ') : '',
      t.creator || '',
      t.createdAt || '',
      t.updatedAt || '',
      t.approvedBy || '',
      t.approvedAt || '',
      t.reviewComment || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Ghi đè danh sách Evidences vào Sheet Evidences
 */
function writeEvidencesToSheet(ss, evidences) {
  var sheet = ss.getSheetByName(SHEETS.EVIDENCES);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.EVIDENCES);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (evidences.length === 0) return;

  var rows = evidences.map(function(e) {
    return [
      e.id || '',
      e.evidenceCode || '',
      e.title || '',
      e.taskId || '',
      e.taskTitle || '',
      e.campusName || '',
      e.fileType || '',
      e.fileSize || '',
      e.fileUrl || '',
      e.uploadedBy || '',
      e.uploadedAt || '',
      e.reviewStatus || 'Chờ kiểm tra',
      e.reviewedBy || '',
      e.reviewNote || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Ghi đè danh sách Events vào Sheet Events
 */
function writeEventsToSheet(ss, events) {
  var sheet = ss.getSheetByName(SHEETS.EVENTS);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.EVENTS);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (events.length === 0) return;

  var rows = events.map(function(ev) {
    return [
      ev.id || '',
      ev.title || '',
      ev.type || 'Họp giao ban',
      ev.startAt || '',
      ev.endAt || '',
      ev.location || '',
      ev.campusId || 'all',
      ev.organizer || '',
      ev.description || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Ghi đè danh sách Plans vào Sheet Plans
 */
function writePlansToSheet(ss, plans) {
  var sheet = ss.getSheetByName(SHEETS.PLANS);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.PLANS);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (plans.length === 0) return;

  var rows = plans.map(function(p) {
    return [
      p.id || '',
      p.planCode || '',
      p.title || '',
      p.type || 'Năm học',
      p.academicYear || '2025-2026',
      p.term || 'Học kỳ 1',
      p.status || 'Đang thực hiện',
      (p.campusIds && Array.isArray(p.campusIds)) ? p.campusIds.join(', ') : 'all',
      p.progress || 0,
      p.owner || '',
      p.approvedBy || '',
      p.createdAt || '',
      p.description || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Ghi đè danh sách Staff vào Sheet Staff
 */
function writeStaffToSheet(ss, staffList) {
  var sheet = ss.getSheetByName(SHEETS.STAFF);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.STAFF);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (staffList.length === 0) return;

  var rows = staffList.map(function(s) {
    return [
      s.id || '',
      s.moetCode || '',
      s.fullName || '',
      s.birthDate || '',
      s.gender || 'Nữ',
      s.status || 'Đang làm việc',
      s.ethnicity || 'Kinh',
      s.phone || '',
      s.jobPosition || 'Giáo viên',
      s.positionGroup || '',
      s.contractType || '',
      s.qualification || '',
      s.teachingSubject || '',
      s.campusName || '',
      s.warningNotes || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function staffRowToObject(row) {
  if (!row[0] && !row[2]) return null;
  return {
    id: String(row[0] || 'STAFF-' + row[1]),
    moetCode: String(row[1] || ''),
    fullName: String(row[2] || ''),
    birthDate: formatDateCell(row[3]),
    gender: row[4] || 'Nữ',
    status: row[5] || 'Đang làm việc',
    ethnicity: row[6] || 'Kinh',
    phone: String(row[7] || ''),
    jobPosition: row[8] || 'Giáo viên',
    positionGroup: row[9] || '',
    contractType: row[10] || '',
    qualification: row[11] || '',
    teachingSubject: row[12] || '',
    campusName: row[13] || '',
    isActive: row[5] !== 'Đã nghỉ hưu' && row[5] !== 'Nghỉ việc',
    isWarning: Boolean(row[14]),
    warningNotes: String(row[14] || '')
  };
}

/**
 * Ghi đè ActivityLogs (tối đa 50 dòng mới nhất)
 */
function writeLogsToSheet(ss, logs) {
  var sheet = ss.getSheetByName(SHEETS.LOGS);
  if (!sheet) {
    setupSheets();
    sheet = ss.getSheetByName(SHEETS.LOGS);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  if (logs.length === 0) return;

  var rows = logs.slice(0, 50).map(function(l) {
    return [
      l.timestamp || '',
      l.entityType || '',
      l.entityId || '',
      l.action || '',
      l.actor || '',
      l.actorRole || '',
      l.details || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/**
 * Đọc toàn bộ dữ liệu từ Sheet ra mảng Object
 */
function readSheetObjects(sheet, mapperFn) {
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  return values.map(mapperFn).filter(function(item) {
    return item && item.id;
  });
}

function taskRowToObject(row) {
  if (!row[0]) return null;
  var evIds = row[13] ? String(row[13]).split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
  return {
    id: String(row[0]),
    taskCode: String(row[1] || ''),
    title: String(row[2] || ''),
    description: String(row[3] || ''),
    campusId: String(row[4] || 'campus-1'),
    campusName: String(row[5] || ''),
    assignee: String(row[6] || ''),
    assigneeRole: String(row[7] || ''),
    priority: row[8] || 'Bình thường',
    dueDate: row[9] ? formatDateCell(row[9]) : '',
    progress: Number(row[10]) || 0,
    status: row[11] || 'Đang thực hiện',
    evidenceRequired: row[12] === 'Có' || row[12] === true,
    evidenceIds: evIds,
    creator: String(row[14] || ''),
    createdAt: row[15] ? formatDateCell(row[15]) : '',
    updatedAt: row[16] ? formatDateCell(row[16]) : '',
    approvedBy: row[17] ? String(row[17]) : undefined,
    approvedAt: row[18] ? formatDateCell(row[18]) : undefined,
    reviewComment: row[19] ? String(row[19]) : undefined
  };
}

function evidenceRowToObject(row) {
  if (!row[0]) return null;
  return {
    id: String(row[0]),
    evidenceCode: String(row[1] || ''),
    title: String(row[2] || ''),
    taskId: String(row[3] || ''),
    taskTitle: String(row[4] || ''),
    campusName: String(row[5] || ''),
    fileType: String(row[6] || 'PDF'),
    fileSize: String(row[7] || '1.0 MB'),
    fileUrl: String(row[8] || '#'),
    uploadedBy: String(row[9] || ''),
    uploadedAt: row[10] ? formatDateCell(row[10]) : '',
    reviewStatus: row[11] || 'Chờ kiểm tra',
    reviewedBy: row[12] ? String(row[12]) : undefined,
    reviewNote: row[13] ? String(row[13]) : undefined
  };
}

function eventRowToObject(row) {
  if (!row[0]) return null;
  return {
    id: String(row[0]),
    title: String(row[1] || ''),
    type: row[2] || 'Họp giao ban',
    startAt: row[3] ? formatDateCell(row[3]) : '',
    endAt: row[4] ? formatDateCell(row[4]) : undefined,
    location: String(row[5] || ''),
    campusId: String(row[6] || 'all'),
    organizer: String(row[7] || ''),
    description: String(row[8] || '')
  };
}

function planRowToObject(row) {
  if (!row[0]) return null;
  var campusIds = row[7] ? String(row[7]).split(',').map(function(s) { return s.trim(); }).filter(Boolean) : ['all'];
  return {
    id: String(row[0]),
    planCode: String(row[1] || ''),
    title: String(row[2] || ''),
    type: row[3] || 'Năm học',
    academicYear: String(row[4] || '2025-2026'),
    term: String(row[5] || 'Học kỳ 1'),
    status: row[6] || 'Đang thực hiện',
    campusIds: campusIds,
    progress: Number(row[8]) || 0,
    owner: String(row[9] || ''),
    approvedBy: row[10] ? String(row[10]) : undefined,
    createdAt: row[11] ? formatDateCell(row[11]) : '',
    description: String(row[12] || '')
  };
}

function logRowToObject(row) {
  if (!row[0] && !row[1]) return null;
  return {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    timestamp: row[0] ? formatDateCell(row[0]) : '',
    entityType: row[1] || '',
    entityId: row[2] ? String(row[2]) : undefined,
    action: row[3] || '',
    actor: row[4] || '',
    actorRole: row[5] || '',
    details: row[6] || ''
  };
}

function formatDateCell(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
  }
  return String(val);
}

/**
 * Trả về phản hồi JSON chuẩn có hỗ trợ CORS
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
