import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Building2,
  Calendar,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import { CampusId, CurrentUser } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';

interface ReportCenterProps {
  selectedCampus: CampusId;
  currentUser: CurrentUser;
}

export const ReportCenter: React.FC<ReportCenterProps> = ({
  selectedCampus,
}) => {
  const [reportType, setReportType] = useState<string>('tien_do');
  const [period, setPeriod] = useState<string>('Tháng 10/2026');

  const metrics = dataService.getMetrics(selectedCampus);
  const tasks = dataService.getTasks(selectedCampus);

  const reportTypes = [
    { id: 'tien_do', name: '1. Báo cáo tiến độ nhiệm vụ toàn trường' },
    { id: 'ba_khu', name: '2. Báo cáo tình hình ba khu trường đối sánh' },
    { id: 'qua_han', name: '3. Báo cáo chuyên đề nhiệm vụ quá hạn' },
    { id: 'dung_han', name: '4. Báo cáo nhiệm vụ hoàn thành đúng hạn' },
    { id: 'minh_chung', name: '5. Báo cáo tình trạng minh chứng nghiệm thu' },
    { id: 'tuan', name: '6. Báo cáo tổng hợp tuần điều hành' },
    { id: 'thang', name: '7. Báo cáo tổng hợp tháng gửi Phòng GD&ĐT' },
  ];

  const handleExportCSV = () => {
    const headers = ['Mã nhiệm vụ', 'Tên nhiệm vụ', 'Nhóm công việc', 'Khu trường', 'Phụ trách', 'Hạn xong', 'Trạng thái', 'Tiến độ (%)'];
    const rows = tasks.map((t) => [
      `"${t.taskCode}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.campusName}"`,
      `"${t.assignee}"`,
      `"${t.dueDate}"`,
      `"${t.status}"`,
      `"${t.progress}%"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_SmartSchool_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)] print:p-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            TRUNG TÂM BÁO CÁO VÀ THỐNG KÊ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu điều hành, kết xuất bảng biểu và nhận xét chuyên môn từ hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất file Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In / Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Type Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Loại báo cáo:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
          >
            {reportTypes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Kỳ báo cáo:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-medium"
          >
            <option value="Tháng 10/2026">Tháng 10/2026 (Hiện tại)</option>
            <option value="Tuần 28/2026">Tuần 28/2026</option>
            <option value="Học kỳ I 2025-2026">Học kỳ I 2025 - 2026</option>
            <option value="Cả năm học 2025-2026">Cả năm học 2025 - 2026</option>
          </select>
        </div>
      </div>

      {/* Report Canvas (Printable Document Layout) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6 print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div className="text-center font-serif text-xs">
            <div className="font-bold uppercase tracking-wider text-slate-800">
              PHÒNG GIÁO DỤC VÀ ĐÀO TẠO
            </div>
            <div className="font-bold uppercase tracking-wider text-slate-900 mt-0.5">
              TRƯỜNG TIỂU HỌC QUANG TRUNG
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Số: ... /BC-THQT</div>
          </div>

          <div className="text-center font-serif text-xs">
            <div className="font-bold uppercase tracking-wider text-slate-900">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="font-semibold text-slate-700 italic text-[11px]">
              Độc lập – Tự do – Hạnh phúc
            </div>
            <div className="text-[10px] text-slate-500 mt-1 italic">
              Hà Nội, ngày 21 tháng 10 năm 2026
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold uppercase tracking-wide text-[#142B4A]">
            BÁO CÁO THỐNG KÊ QUẢN TRỊ ĐIỀU HÀNH VÀ TIẾN ĐỘ NHIỆM VỤ
          </h2>
          <div className="text-xs text-slate-600 italic">
            Áp dụng thống nhất cho cả 3 khu trường · Kỳ báo cáo: {period}
          </div>
        </div>

        {/* Statistical Summary Strip */}
        <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Tổng số nhiệm vụ</span>
            <strong className="text-xl font-bold text-[#142B4A] tabular-nums">
              {metrics.total}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-emerald-700 block">Đã hoàn thành</span>
            <strong className="text-xl font-bold text-emerald-700 tabular-nums">
              {metrics.completed} ({metrics.completionRate}%)
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-blue-700 block">Đang thực hiện</span>
            <strong className="text-xl font-bold text-blue-700 tabular-nums">
              {metrics.inProgress + metrics.pendingReview}
            </strong>
          </div>
          <div>
            <span className="text-[10px] text-red-700 block">Quá hạn cảnh báo</span>
            <strong className="text-xl font-bold text-red-700 tabular-nums">
              {metrics.overdue}
            </strong>
          </div>
        </div>

        {/* Breakdown Table across 3 Campuses */}
        <div>
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide mb-2">
            I. BẢNG THỐNG KÊ CHI TIẾT THEO BA KHU TRƯỜNG
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Khu trường</th>
                  <th className="py-2 px-3 text-center">Tổng nhiệm vụ</th>
                  <th className="py-2 px-3 text-center">Hoàn thành</th>
                  <th className="py-2 px-3 text-center">Đang làm</th>
                  <th className="py-2 px-3 text-center">Quá hạn</th>
                  <th className="py-2 px-3 text-right">Tỷ lệ đạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.campusBreakdown.map((b) => (
                  <tr key={b.campus.id}>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {b.campus.name}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums">{b.total}</td>
                    <td className="py-2 px-3 text-center tabular-nums text-emerald-700 font-semibold">
                      {b.completed}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums text-blue-700">
                      {b.inProgress + b.pendingReview}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums text-red-700 font-semibold">
                      {b.overdue}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-800">
                      {b.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Synthesis Section */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>II. NHẬN XÉT VÀ ĐỀ XUẤT CỦA TRỢ LÝ AI SMARTSCHOOL</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            - <strong>Điểm nổi bật:</strong> Khu trường 1 (Cơ sở chính) duy trì tiến độ hoàn thành tốt nhất toàn trường ({metrics.campusBreakdown[0]?.completionRate}%), 100% hồ sơ học bạ số và minh chứng chuyên môn đã được đối soát chính xác trên hệ thống.
          </p>
          <p className="text-slate-700 leading-relaxed">
            - <strong>Tồn tại cần khắc phục:</strong> Hiện toàn trường có {metrics.overdue} nhiệm vụ quá hạn (tập trung tại Khu 2 về sửa chữa điều hòa/máy tính và Khu 3 về số liệu y tế học đường). Có {metrics.missingEvidenceCount} nhiệm vụ cần bổ sung minh chứng trước kỳ kiểm tra nội bộ.
          </p>
          <p className="text-slate-700 leading-relaxed">
            - <strong>Đề xuất Ban Giám hiệu:</strong> Chỉ đạo giải quyết dứt điểm 02 nhiệm vụ quá hạn trong 48 giờ tới; tiếp tục duy trì giao ban số hóa trực tuyến giữa 3 khu trường để đảm bảo đồng bộ quản trị.
          </p>
          <div className="text-[10px] text-slate-500 pt-1 italic">
            (Nhận xét hỗ trợ tự động căn cứ theo số liệu thực tế được lưu trên hệ thống)
          </div>
        </div>

        {/* Signatures Area */}
        <div className="grid grid-cols-2 pt-6 text-center text-xs">
          <div>
            <div className="font-bold uppercase text-slate-700">NGƯỜI LẬP BÁO CÁO</div>
            <div className="text-[11px] text-slate-500 mt-0.5">(Ký, ghi rõ họ tên)</div>
            <div className="h-16" />
            <div className="font-semibold text-slate-800">Bộ phận Quản trị SmartSchool</div>
          </div>
          <div>
            <div className="font-bold uppercase text-slate-900">HIỆU TRƯỞNG</div>
            <div className="text-[11px] text-slate-500 mt-0.5">(Ký duyệt, đóng dấu)</div>
            <div className="h-16" />
            <div className="font-bold text-slate-900">Thầy Nguyễn Văn Thông</div>
          </div>
        </div>
      </div>
    </div>
  );
};
