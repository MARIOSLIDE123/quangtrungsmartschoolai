import * as XLSX from 'xlsx';
import { Staff, ExcelImportSummary, StaffGender, StaffStatus } from '../types';

/**
 * Chuẩn hóa chuỗi văn bản tiếng Việt, xóa khoảng trắng thừa
 */
export function cleanText(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  // Thay thế nhiều khoảng trắng thành 1
  str = str.replace(/[ \t]+/g, ' ');
  return str;
}

/**
 * Xử lý ngày sinh từ nhiều định dạng Excel:
 * - Chuỗi DD/MM/YYYY hoặc YYYY-MM-DD
 * - Số serial date của Excel (vd: 32882)
 * - Date object
 */
export function parseExcelDate(val: any): string {
  if (val === null || val === undefined || val === '') return '';

  // Trường hợp là Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    const d = val.getDate().toString().padStart(2, '0');
    const m = (val.getMonth() + 1).toString().padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }

  // Trường hợp là số serial date của Excel
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      const d = dateObj.d.toString().padStart(2, '0');
      const m = dateObj.m.toString().padStart(2, '0');
      const y = dateObj.y;
      return `${d}/${m}/${y}`;
    }
  }

  const str = String(val).trim();

  // Định dạng DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${d}/${m}/${y}`;
  }

  // Định dạng YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  return str;
}

/**
 * Chuẩn hóa số điện thoại, đảm bảo không mất số 0 đầu
 */
export function cleanPhoneNumber(val: any): string {
  if (!val) return '';
  let str = String(val).trim().replace(/[\s\.\-\(\)]/g, '');
  if (str.length === 9 && !str.startsWith('0')) {
    str = '0' + str;
  }
  return str;
}

/**
 * Chuẩn hóa mã định danh Bộ GD&ĐT (đảm bảo chuỗi, không mất số 0 đầu)
 */
export function cleanMoetCode(val: any): string {
  if (!val) return '';
  let str = String(val).trim();
  // Nếu là số dưới dạng scientific notation hoặc mất số 0 đầu 10 chữ số
  if (/^\d+$/.test(str) && str.length < 10) {
    str = str.padStart(10, '0');
  }
  return str;
}

/**
 * Bản đồ nhận diện cột dữ liệu linh hoạt (14 trường)
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  stt: ['stt', 'số thứ tự', 'no', 'tt'],
  moetCode: ['mã định danh bộ gd&đt', 'mã định danh', 'mã định danh bô gd&đt', 'mã bộ', 'mã cán bộ'],
  fullName: ['họ tên', 'họ và tên', 'họ và tên giáo viên', 'tên', 'họ tên cán bộ'],
  birthDate: ['ngày sinh', 'ngay sinh', 'năm sinh', 'dob'],
  gender: ['giới tính', 'gioi tinh', 'nam/nữ'],
  status: ['trạng thái', 'tình trạng', 'trạng thái làm việc', 'trạng thái công tác'],
  ethnicity: ['dân tộc', 'dan toc'],
  phone: ['điện thoại', 'dien thoai', 'số điện thoại', 'sđt', 'tel', 'phone'],
  jobPosition: ['vị trí việc làm', 'vi tri viec lam', 'vị trí', 'chức danh'],
  positionGroup: ['nhóm chức vụ', 'nhom chuc vu', 'chức vụ', 'chức vụ kiêm nhiệm'],
  contractType: ['hình thức hợp đồng', 'hinh thuc hop dong', 'loại hợp đồng', 'hợp đồng'],
  qualification: ['t.độ chuyên môn nghiệp vụ', 'trình độ chuyên môn nghiệp vụ', 'trình độ chuyên môn', 'trình độ', 't.độ'],
  teachingSubject: ['môn dạy', 'mon day', 'chuyên môn giảng dạy', 'môn'],
  campusName: ['phân hiệu', 'phan hieu', 'khu trường', 'cơ sở', 'điểm trường'],
};

/**
 * Phân tích và trích xuất dữ liệu từ một WorkSheet của XLSX
 */
export function parseStaffWorksheet(
  worksheet: XLSX.WorkSheet,
  fileName: string,
  existingStaffList: Staff[] = []
): ExcelImportSummary {
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  let headerRowIndex = -1;
  const colIndexMap: Record<string, number> = {};
  const recognizedColumns: string[] = [];

  // Tìm dòng tiêu đề phù hợp (quét tối đa 20 dòng đầu)
  for (let r = 0; r < Math.min(rawRows.length, 20); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let matchedCount = 0;
    const tempMap: Record<string, number> = {};

    row.forEach((cellVal, cIdx) => {
      const cellText = cleanText(cellVal).toLowerCase();
      if (!cellText) return;

      for (const [canonicalKey, aliases] of Object.entries(COLUMN_ALIASES)) {
        if (aliases.some(alias => cellText.includes(alias) || alias.includes(cellText))) {
          if (tempMap[canonicalKey] === undefined) {
            tempMap[canonicalKey] = cIdx;
            matchedCount++;
          }
          break;
        }
      }
    });

    // Nếu tìm thấy ít nhất 4 cột cốt lõi (họ tên, ngày sinh, giới tính/chức vụ/phân hiệu)
    if (matchedCount >= 4 && tempMap['fullName'] !== undefined) {
      headerRowIndex = r;
      Object.assign(colIndexMap, tempMap);
      row.forEach(c => {
        const text = cleanText(c);
        if (text) recognizedColumns.push(text);
      });
      break;
    }
  }

  // Nếu không nhận diện được tiêu đề, báo lỗi cấu trúc
  if (headerRowIndex === -1) {
    return {
      fileName,
      totalRowsRead: rawRows.length,
      validCount: 0,
      duplicateCount: 0,
      missingInfoCount: 0,
      warningCount: 0,
      recognizedColumns: [],
      records: [],
      warningRecords: [],
      duplicateRecords: [],
    };
  }

  const records: Staff[] = [];
  const warningRecords: { row: number; staff: Staff; reason: string }[] = [];
  const duplicateRecords: { row: number; staff: Staff; reason: string }[] = [];
  let missingInfoCount = 0;

  // Tập hợp mã định danh hiện có để phát hiện trùng
  const seenMoetInBatch = new Set<string>();
  const existingMoetSet = new Set(existingStaffList.map(s => s.moetCode).filter(Boolean));

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const getCol = (key: string) => {
      const idx = colIndexMap[key];
      return idx !== undefined ? row[idx] : '';
    };

    const fullNameRaw = cleanText(getCol('fullName'));
    
    // Bỏ qua dòng trống
    if (!fullNameRaw) continue;

    // Bỏ qua các dòng chữ ký, ghi chú, người lập biểu
    const lowerName = fullNameRaw.toLowerCase();
    if (
      lowerName.includes('người lập biểu') ||
      lowerName.includes('ký và ghi rõ') ||
      lowerName.includes('hiệu trưởng') ||
      lowerName.includes('tổng số') ||
      lowerName.includes('báo cáo') ||
      lowerName.startsWith('năm học') ||
      lowerName.includes('phú xuyên') ||
      lowerName.includes('quang trung') && lowerName.includes('trường tiểu học')
    ) {
      continue;
    }

    const moetCode = cleanMoetCode(getCol('moetCode'));
    const birthDate = parseExcelDate(getCol('birthDate'));
    const genderRaw = cleanText(getCol('gender'));
    const gender: StaffGender = genderRaw.toLowerCase().includes('nam') ? 'Nam' : 'Nữ';
    const statusRaw = cleanText(getCol('status')) || 'Đang làm việc';
    const ethnicity = cleanText(getCol('ethnicity')) || 'Kinh';
    const phone = cleanPhoneNumber(getCol('phone'));
    const jobPosition = cleanText(getCol('jobPosition')) || 'Giáo viên';
    const positionGroup = cleanText(getCol('positionGroup'));
    const contractType = cleanText(getCol('contractType'));
    const qualification = cleanText(getCol('qualification'));
    const teachingSubject = cleanText(getCol('teachingSubject'));
    const rawCampus = cleanText(getCol('campusName'));

    // Kiểm tra cảnh báo phân hiệu chứa nhiều dòng/nhiều phân hiệu
    let isWarning = false;
    let warningNotes = '';

    let normalizedCampus = rawCampus;
    if (rawCampus.includes('\n') || rawCampus.includes('\r') || (rawCampus.includes('Minh Cường') && rawCampus.includes('Quang Trung'))) {
      isWarning = true;
      warningNotes = 'Phân hiệu chứa nhiều cơ sở/xuống dòng, cần xác nhận phân bổ chính thức';
      normalizedCampus = rawCampus.replace(/[\r\n]+/g, ' / ');
    } else if (!rawCampus) {
      isWarning = true;
      warningNotes = 'Chưa ghi nhận phân hiệu';
      normalizedCampus = 'Chưa phân bổ';
    }

    // Kiểm tra thiếu thông tin bắt buộc
    let isMissing = false;
    if (!birthDate || !phone) {
      isMissing = true;
      missingInfoCount++;
    }

    // Mã nhân sự nội bộ duy nhất
    const internalId = moetCode ? `STAFF-${moetCode}` : `STAFF-AUTO-${Date.now()}-${r}`;

    const staff: Staff = {
      id: internalId,
      moetCode,
      fullName: fullNameRaw,
      birthDate,
      gender,
      status: (statusRaw as StaffStatus) || 'Đang làm việc',
      ethnicity,
      phone,
      jobPosition,
      positionGroup,
      contractType,
      qualification,
      teachingSubject,
      campusName: normalizedCampus,
      rawCampus,
      isActive: statusRaw !== 'Đã nghỉ hưu' && statusRaw !== 'Nghỉ việc',
      isWarning,
      warningNotes,
      sourceFile: fileName,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Kiểm tra trùng mã định danh
    if (moetCode) {
      if (seenMoetInBatch.has(moetCode)) {
        duplicateRecords.push({
          row: r + 1,
          staff,
          reason: `Trùng mã định danh Bộ GD&ĐT [${moetCode}] lặp lại trong file này`,
        });
      } else if (existingMoetSet.has(moetCode)) {
        duplicateRecords.push({
          row: r + 1,
          staff,
          reason: `Mã định danh Bộ GD&ĐT [${moetCode}] đã có sẵn trong cơ sở dữ liệu hệ thống`,
        });
      }
      seenMoetInBatch.add(moetCode);
    } else {
      isWarning = true;
      warningNotes = (warningNotes ? warningNotes + '; ' : '') + 'Thiếu mã định danh Bộ GD&ĐT';
      staff.isWarning = true;
      staff.warningNotes = warningNotes;
    }

    if (isWarning) {
      warningRecords.push({
        row: r + 1,
        staff,
        reason: warningNotes,
      });
    }

    records.push(staff);
  }

  return {
    fileName,
    totalRowsRead: records.length,
    validCount: records.length - duplicateRecords.length,
    duplicateCount: duplicateRecords.length,
    missingInfoCount,
    warningCount: warningRecords.length,
    recognizedColumns,
    records,
    warningRecords,
    duplicateRecords,
  };
}

/**
 * Đọc file Excel từ ArrayBuffer (trình duyệt)
 */
export async function readExcelFile(file: File, existingStaffList: Staff[] = []): Promise<ExcelImportSummary> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  // Tìm Sheet đầu tiên có dữ liệu (bỏ qua sheet trống)
  let targetSheetName = workbook.SheetNames[0];
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (sheet && sheet['!ref']) {
      targetSheetName = name;
      break;
    }
  }

  const targetSheet = workbook.Sheets[targetSheetName];
  if (!targetSheet) {
    return {
      fileName: file.name,
      totalRowsRead: 0,
      validCount: 0,
      duplicateCount: 0,
      missingInfoCount: 0,
      warningCount: 0,
      recognizedColumns: [],
      records: [],
      warningRecords: [],
      duplicateRecords: [],
    };
  }

  return parseStaffWorksheet(targetSheet, file.name, existingStaffList);
}

/**
 * Xuất danh sách nhân sự ra file Excel chuyên nghiệp
 */
export function exportStaffToExcel(staffList: Staff[], fileName = 'Danh_sach_nhan_su_Quang_Trung.xlsx') {
  const headers = [
    'STT',
    'Mã định danh Bộ GD&ĐT',
    'Họ tên',
    'Ngày sinh',
    'Giới tính',
    'Trạng thái',
    'Dân tộc',
    'Điện thoại',
    'Vị trí việc làm',
    'Nhóm chức vụ',
    'Hình thức hợp đồng',
    'Trình độ chuyên môn nghiệp vụ',
    'Môn dạy',
    'Phân hiệu',
  ];

  const rows = staffList.map((s, idx) => [
    idx + 1,
    s.moetCode,
    s.fullName,
    s.birthDate,
    s.gender,
    s.status,
    s.ethnicity,
    s.phone,
    s.jobPosition,
    s.positionGroup,
    s.contractType,
    s.qualification,
    s.teachingSubject,
    s.campusName,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 16 }, // Ma dinh danh
    { wch: 24 }, // Ho ten
    { wch: 12 }, // Ngay sinh
    { wch: 8 },  // Gioi tinh
    { wch: 14 }, // Trang thai
    { wch: 10 }, // Dan toc
    { wch: 14 }, // Dien thoai
    { wch: 16 }, // Vi tri
    { wch: 22 }, // Chuc vu
    { wch: 28 }, // Hop dong
    { wch: 22 }, // Trinh do
    { wch: 14 }, // Mon day
    { wch: 26 }, // Phan hieu
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách nhân sự');
  XLSX.writeFile(workbook, fileName);
}
