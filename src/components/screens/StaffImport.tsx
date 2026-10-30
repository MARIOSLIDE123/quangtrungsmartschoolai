import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Download,
  AlertOctagon,
} from 'lucide-react';
import { Staff, CurrentUser, ExcelImportSummary } from '../../types';
import { dataService } from '../../services/dataService';
import { readExcelFile } from '../../services/excelService';

interface StaffImportProps {
  currentUser: CurrentUser;
  onImportSuccess: () => void;
  onCancel: () => void;
}

export const StaffImport: React.FC<StaffImportProps> = ({
  currentUser,
  onImportSuccess,
  onCancel,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummaries, setImportSummaries] = useState<ExcelImportSummary[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarningOnly, setFilterWarningOnly] = useState(false);
  const [confirmedStaffList, setConfirmedStaffList] = useState<Staff[]>([]);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);

  // Xử lý kéo thả / chọn file
  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    await analyzeFiles(fileArray);
  };

  // Bước 2: Đọc và phân tích file
  const analyzeFiles = async (files: File[]) => {
    setIsProcessing(true);
    const existingList = dataService.getStaffList();
    const summaries: ExcelImportSummary[] = [];
    const allParsedRecords: Staff[] = [];

    for (const file of files) {
      try {
        const summary = await readExcelFile(file, existingList);
        summaries.push(summary);
        allParsedRecords.push(...summary.records);
      } catch (err) {
        console.error('Lỗi đọc file:', file.name, err);
      }
    }

    setImportSummaries(summaries);
    setConfirmedStaffList(allParsedRecords);
    setIsProcessing(false);
    setActiveStep(2);
  };

  // Thử nghiệm tải nhanh file mẫu có sẵn
  const handleLoadSampleFiles = async () => {
    setIsProcessing(true);
    try {
      const resp1 = await fetch('/sample_data/Danh_sach_giao_vien.xlsx');
      const blob1 = await resp1.blob();
      const file1 = new File([blob1], 'Danh_sach_giao_vien.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const resp2 = await fetch('/sample_data/Danh_sach_giao_vien (1).xlsx');
      const blob2 = await resp2.blob();
      const file2 = new File([blob2], 'Danh_sach_giao_vien (1).xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const files = [file1, file2];
      setSelectedFiles(files);
      await analyzeFiles(files);
    } catch (err) {
      console.error('Lỗi nạp file mẫu:', err);
      alert('Không thể nạp file mẫu từ máy chủ. Quý Thầy/Cô vui lòng kéo thả file Excel từ máy.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Tổng hợp các chỉ số phân tích
  const totalRead = importSummaries.reduce((acc, s) => acc + s.totalRowsRead, 0);
  const totalValid = importSummaries.reduce((acc, s) => acc + s.validCount, 0);
  const totalDup = importSummaries.reduce((acc, s) => acc + s.duplicateCount, 0);
  const totalMissing = importSummaries.reduce((acc, s) => acc + s.missingInfoCount, 0);
  const totalWarning = importSummaries.reduce((acc, s) => acc + s.warningCount, 0);

  // Lọc danh sách xem trước
  const filteredPreview = confirmedStaffList.filter((s) => {
    const matchSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.moetCode.includes(searchTerm) ||
      s.teachingSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.campusName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterWarningOnly) {
      return matchSearch && (s.isWarning || !s.moetCode);
    }
    return matchSearch;
  });

  // Bước 4: Xác nhận ghi vào cơ sở dữ liệu chính
  const handleConfirmSave = () => {
    setIsProcessing(true);
    let totalAdded = 0;
    let totalUpdated = 0;

    importSummaries.forEach((summary) => {
      const res = dataService.batchImportStaff(summary.records, currentUser, summary.fileName);
      totalAdded += res.added;
      totalUpdated += res.updated;
    });

    setImportResult({
      added: totalAdded,
      updated: totalUpdated,
      skipped: totalDup,
    });
    setIsProcessing(false);
    setActiveStep(4);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
      {/* Header Modal/Screen */}
      <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-sm tracking-wide">NHẬP DỮ LIỆU HỒ SƠ NHÂN SỰ TỪ EXCEL</h2>
            <p className="text-[11px] text-slate-300">
              Nhận diện tự động 14 cột dữ liệu, chuẩn hóa phân hiệu, phát hiện trùng lặp và bảo toàn mã định danh
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-slate-200 text-xs transition-colors"
        >
          Đóng
        </button>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-center font-medium">
        <div className={`py-2.5 border-r border-slate-200 ${activeStep === 1 ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-b-blue-600' : 'text-slate-600'}`}>
          1. Chọn file Excel
        </div>
        <div className={`py-2.5 border-r border-slate-200 ${activeStep === 2 ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-b-blue-600' : 'text-slate-600'}`}>
          2. Phân tích cấu trúc
        </div>
        <div className={`py-2.5 border-r border-slate-200 ${activeStep === 3 ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-b-blue-600' : 'text-slate-600'}`}>
          3. Xem trước & Cảnh báo
        </div>
        <div className={`py-2.5 ${activeStep === 4 ? 'bg-blue-50 text-blue-700 font-bold border-b-2 border-b-blue-600' : 'text-slate-600'}`}>
          4. Báo cáo kết quả
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ========================================================= */}
        {/* BƯỚC 1: CHỌN FILE */}
        {/* ========================================================= */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3"
              onClick={() => document.getElementById('excel-file-input')?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">
                  Kéo và thả các tệp Excel (.xlsx, .xls, .csv) vào đây
                </p>
                <p className="text-slate-500 text-[11px]">
                  Hệ thống hỗ trợ nạp đồng thời nhiều file (ví dụ: Danh sách Cơ sở 1 và Cơ sở 2)
                </p>
              </div>
              <input
                id="excel-file-input"
                type="file"
                multiple
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Chọn tệp từ máy tính
              </button>
            </div>

            {/* Nạp nhanh dữ liệu cung cấp sẵn */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sử dụng 2 file dữ liệu chính thức của nhà trường</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Tự động nạp: <code>Danh_sach_giao_vien.xlsx</code> (53 CBGV) và <code>Danh_sach_giao_vien (1).xlsx</code> (38 CBGV)
                </p>
              </div>
              <button
                onClick={handleLoadSampleFiles}
                disabled={isProcessing}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>Nạp trực tiếp 2 file</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 2: PHÂN TÍCH DỮ LIỆU */}
        {/* ========================================================= */}
        {activeStep === 2 && (
          <div className="space-y-4">
            {/* Thẻ số liệu phân tích */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                <div className="text-[11px] text-blue-700 font-medium">Tổng dòng đọc được</div>
                <div className="text-xl font-bold text-blue-900">{totalRead}</div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <div className="text-[11px] text-emerald-700 font-medium">Hồ sơ hợp lệ</div>
                <div className="text-xl font-bold text-emerald-900">{totalValid}</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center">
                <div className="text-[11px] text-purple-700 font-medium">Hồ sơ trùng mã</div>
                <div className="text-xl font-bold text-purple-900">{totalDup}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <div className="text-[11px] text-amber-700 font-medium">Thiếu thông tin phụ</div>
                <div className="text-xl font-bold text-amber-900">{totalMissing}</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                <div className="text-[11px] text-red-700 font-medium">Cần BGH xác nhận</div>
                <div className="text-xl font-bold text-red-900">{totalWarning}</div>
              </div>
            </div>

            {/* Chi tiết từng file */}
            <div className="space-y-2">
              <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                Chi tiết kết quả đọc các file:
              </div>
              {importSummaries.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      {s.fileName}
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {s.records.length} hồ sơ trích xuất thành công
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap gap-1.5">
                    <span className="font-medium text-slate-700">Các cột nhận diện chuẩn (14 trường):</span>
                    {s.recognizedColumns.map((col, cIdx) => (
                      <span key={cIdx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                        ✓ {col}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Chuyển tiếp */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg"
              >
                Quay lại chọn file
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Xem trước dữ liệu chi tiết</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 3: XEM TRƯỚC DỮ LIỆU & CẢNH BÁO */}
        {/* ========================================================= */}
        {activeStep === 3 && (
          <div className="space-y-3">
            {/* Thanh công cụ tìm kiếm và lọc */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nhanh giáo viên, môn, phân hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterWarningOnly(!filterWarningOnly)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border ${
                    filterWarningOnly ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chỉ xem cảnh báo ({totalWarning})</span>
                </button>
              </div>
            </div>

            {/* Bảng xem trước preview */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#142B4A] text-white font-semibold sticky top-0 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Mã BGD</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Ngày sinh</th>
                    <th className="py-2.5 px-3">Vị trí việc làm</th>
                    <th className="py-2.5 px-3">Nhóm chức vụ</th>
                    <th className="py-2.5 px-3">Môn dạy</th>
                    <th className="py-2.5 px-3">Phân hiệu</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Cảnh báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreview.map((staff, idx) => (
                    <tr key={idx} className={staff.isWarning ? 'bg-amber-50/50 hover:bg-amber-100/50' : 'hover:bg-slate-50'}>
                      <td className="py-2 px-3 text-slate-500 text-center font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{staff.moetCode || '---'}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{staff.fullName}</td>
                      <td className="py-2 px-3 text-slate-600">{staff.birthDate}</td>
                      <td className="py-2 px-3 text-slate-700">{staff.jobPosition}</td>
                      <td className="py-2 px-3 text-slate-600">{staff.positionGroup || '---'}</td>
                      <td className="py-2 px-3 text-slate-600">{staff.teachingSubject || '---'}</td>
                      <td className="py-2 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {staff.campusName}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          staff.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-800' :
                          staff.status === 'Đã nghỉ hưu' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {staff.isWarning ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            {staff.warningNotes}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Nút hành động Bước 3 */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg"
              >
                Quay lại
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Hủy nhập
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={isProcessing || confirmedStaffList.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Xác nhận nhập dữ liệu vào hệ thống</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* BƯỚC 4: BÁO CÁO KẾT QUẢ */}
        {/* ========================================================= */}
        {activeStep === 4 && importResult && (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                NHẬP HỒ SƠ NHÂN SỰ VÀO CƠ SỞ DỮ LIỆU THÀNH CÔNG!
              </h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Hệ thống đã lưu trữ dữ liệu an toàn vào cơ sở dữ liệu tập trung, sẵn sàng cho công tác giao việc, tra cứu hồ sơ và lập báo cáo.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[11px] text-slate-500">Hồ sơ thêm mới</div>
                <div className="text-xl font-bold text-emerald-700">{importResult.added}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[11px] text-slate-500">Hồ sơ cập nhật</div>
                <div className="text-xl font-bold text-blue-700">{importResult.updated}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-[11px] text-slate-500">Bản ghi đối chiếu trùng</div>
                <div className="text-xl font-bold text-purple-700">{importResult.skipped}</div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onImportSuccess}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors"
              >
                Mở Danh sách giáo viên ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
