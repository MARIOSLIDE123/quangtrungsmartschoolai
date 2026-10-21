import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  Upload,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
  FileCheck2,
} from 'lucide-react';
import { Evidence, EvidenceType, ReviewStatus, CampusId, CurrentUser, Task } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';

interface EvidenceVaultProps {
  selectedCampus: CampusId;
  currentUser: CurrentUser;
  onSelectTaskById?: (taskId: string) => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({
  selectedCampus,
  currentUser,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showMissingEvidenceAudit, setShowMissingEvidenceAudit] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);

  // Upload Form states
  const [title, setTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('Biên bản');
  const [taskId, setTaskId] = useState('');
  const [campusId, setCampusId] = useState<CampusId>('all');
  const [fileName, setFileName] = useState('Bien_ban_nghiem_thu_thuc_te.pdf');
  const [notes, setNotes] = useState('');

  const evidences = dataService.getEvidences(selectedCampus);
  const tasks = dataService.getTasks(selectedCampus);
  const metrics = dataService.getMetrics(selectedCampus);

  const filteredEvidences = evidences.filter((e) => {
    const matchSearch =
      !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.evidenceCode.toLowerCase().includes(search.toLowerCase()) ||
      e.uploadedBy.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'all' || e.reviewStatus === statusFilter;
    const matchType = typeFilter === 'all' || e.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const handleUploadSubmit = () => {
    if (!title.trim()) return;

    const taskObj = tasks.find((t) => t.id === taskId);

    dataService.submitEvidence(
      {
        evidenceCode: '',
        title,
        type: evidenceType,
        taskId: taskId || 'general',
        taskCode: taskObj?.taskCode,
        taskTitle: taskObj?.title,
        campusId,
        uploadedBy: currentUser.name,
        fileName,
        fileUrl: `/storage/mock/${fileName}`,
        fileSize: '2.4 MB',
        reviewStatus: 'Chờ duyệt',
        notes,
      },
      currentUser
    );

    setIsUploadModalOpen(false);
    setTitle('');
    setNotes('');
  };

  const handleReview = (evidenceId: string, newStatus: ReviewStatus) => {
    if (currentUser.role !== 'hieu_truong' && currentUser.role !== 'pho_hieu_truong') {
      alert('Chỉ Ban Giám hiệu mới có quyền đánh giá, phân loại tính hợp lệ của minh chứng.');
      return;
    }
    const note = newStatus === 'Đạt yêu cầu' ? 'Đã kiểm tra đối chiếu hồ sơ gốc, đạt tiêu chuẩn.' : 'Đề nghị bổ sung chữ ký các thành viên tham dự.';
    dataService.reviewEvidence(evidenceId, newStatus, note, currentUser);
    if (previewEvidence && previewEvidence.id === evidenceId) {
      setPreviewEvidence(null);
    }
  };

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            KHO MINH CHỨNG TẬP TRUNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ, kiểm định và đối soát hồ sơ minh chứng phục vụ thanh tra, kiểm định chất lượng 3 khu trường
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Missing Evidence Audit Toggle */}
          <button
            onClick={() => setShowMissingEvidenceAudit(!showMissingEvidenceAudit)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors border ${
              showMissingEvidenceAudit
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Rà soát thiếu MC ({metrics.missingEvidenceCount})</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>+ Tải lên minh chứng</span>
          </button>
        </div>
      </div>

      {/* Missing Evidence Alert Banner */}
      {showMissingEvidenceAudit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>DANH SÁCH {metrics.missingEvidenceCount} NHIỆM VỤ CHƯA NỘP HỒ SƠ MINH CHỨNG NGHIỆM THU</span>
            </div>
            <button
              onClick={() => setShowMissingEvidenceAudit(false)}
              className="text-xs text-amber-700 hover:underline"
            >
              Đóng bảng rà soát
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {metrics.missingEvidenceTasks.map((t) => (
              <div
                key={t.id}
                className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-800">
                    [{t.taskCode}] {t.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Phụ trách: {t.assignee} · {t.campusName} · Hạn: {t.dueDate}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTaskId(t.id);
                    setTitle(`Minh chứng nghiệm thu cho [${t.taskCode}] ${t.title}`);
                    setCampusId(t.campusId);
                    setIsUploadModalOpen(true);
                  }}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold shrink-0 ml-2"
                >
                  Nộp ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã MC, tên tài liệu, người đăng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">Kiểm duyệt: Tất cả</option>
            <option value="Đạt yêu cầu">Đạt yêu cầu</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Cần bổ sung">Cần bổ sung</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">Loại tệp: Tất cả</option>
            <option value="Biên bản">Biên bản</option>
            <option value="Ảnh thực tế">Ảnh thực tế</option>
            <option value="Kế hoạch/Báo cáo">Kế hoạch / Báo cáo</option>
            <option value="Đề kiểm tra/Ma trận">Đề kiểm tra / Ma trận</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500">
          Hiển thị <strong>{filteredEvidences.length}</strong> / {evidences.length} tài liệu minh chứng
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Mã MC</th>
                <th className="py-2.5 px-3 min-w-[220px]">Tên hồ sơ minh chứng</th>
                <th className="py-2.5 px-2.5">Loại tài liệu</th>
                <th className="py-2.5 px-2.5">Nhiệm vụ liên quan</th>
                <th className="py-2.5 px-2.5">Khu trường</th>
                <th className="py-2.5 px-2.5">Người tải lên</th>
                <th className="py-2.5 px-2">Ngày nộp</th>
                <th className="py-2.5 px-2.5 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvidences.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    Chưa có minh chứng nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredEvidences.map((ev) => (
                  <tr
                    key={ev.id}
                    onClick={() => setPreviewEvidence(ev)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 text-[11px] whitespace-nowrap">
                      {ev.evidenceCode}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 line-clamp-1" title={ev.title}>
                        {ev.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {ev.fileName} ({ev.fileSize})
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-600">
                      {ev.type}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700 font-medium">
                      {ev.taskCode || 'Nhiệm vụ chung'}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-600">
                      {ev.campusId === 'all' ? 'Toàn trường' : ev.campusId.replace('campus-', 'Khu ')}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700">
                      {ev.uploadedBy}
                    </td>
                    <td className="py-2.5 px-2 whitespace-nowrap text-slate-500 tabular-nums">
                      {ev.uploadedAt}
                    </td>
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.reviewStatus === 'Đạt yêu cầu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.reviewStatus === 'Cần bổ sung'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ev.reviewStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewEvidence(ev);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-semibold text-slate-700 transition-colors"
                      >
                        Xem tệp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Preview / Inspection Drawer/Modal */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                  {previewEvidence.evidenceCode}
                </span>
                <h3 className="font-bold text-sm mt-1">{previewEvidence.title}</h3>
              </div>
              <button
                onClick={() => setPreviewEvidence(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              {/* Mock Document Visual Frame */}
              <div className="h-44 bg-slate-100 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 space-y-1">
                <FileText className="w-10 h-10 text-blue-600" />
                <div className="font-semibold text-slate-800">{previewEvidence.fileName}</div>
                <div className="text-[11px] text-slate-400">
                  Định dạng PDF/Scan · Dung lượng: {previewEvidence.fileSize}
                </div>
                <div className="text-[10px] text-slate-400">
                  Đường dẫn: {previewEvidence.fileUrl}
                </div>
              </div>

              <div className="space-y-1.5 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <strong>Người nộp:</strong> {previewEvidence.uploadedBy} · {previewEvidence.uploadedAt}
                </div>
                <div>
                  <strong>Nhiệm vụ:</strong> {previewEvidence.taskTitle || previewEvidence.taskCode || 'Nhiệm vụ chung'}
                </div>
                <div>
                  <strong>Ghi chú:</strong> {previewEvidence.notes || 'Không có ghi chú.'}
                </div>
                {previewEvidence.reviewedBy && (
                  <div className="pt-1 text-emerald-700 font-semibold">
                    Đã kiểm tra bởi: {previewEvidence.reviewedBy} (Nhận xét: "{previewEvidence.reviewNote}")
                  </div>
                )}
              </div>

              {/* Ban Giám hiệu Review Actions */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Ban Giám hiệu kiểm định minh chứng</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(previewEvidence.id, 'Đạt yêu cầu')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shadow-xs"
                  >
                    Xác nhận ĐẠT YÊU CẦU
                  </button>
                  <button
                    onClick={() => handleReview(previewEvidence.id, 'Cần bổ sung')}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs shadow-xs"
                  >
                    Yêu cầu BỔ SUNG
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewEvidence(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Simulation Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Tải lên hồ sơ minh chứng mới</span>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên hồ sơ minh chứng *</label>
                <input
                  type="text"
                  placeholder="VD: Biên bản nghiệm thu kiểm thực bếp ăn..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại tài liệu</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Biên bản">Biên bản</option>
                    <option value="Ảnh thực tế">Ảnh thực tế</option>
                    <option value="Kế hoạch/Báo cáo">Kế hoạch / Báo cáo</option>
                    <option value="Đề kiểm tra/Ma trận">Đề kiểm tra / Ma trận</option>
                    <option value="Danh sách/Sổ điểm">Danh sách / Sổ điểm</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khu trường</label>
                  <select
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value as CampusId)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="all">Toàn trường (3 Khu)</option>
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gắn vào nhiệm vụ cụ thể</label>
                <select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">-- Chọn nhiệm vụ liên kết --</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.taskCode}] {t.title} ({t.campusName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên tệp đính kèm</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú tóm tắt nội dung</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú nội dung cốt lõi của tài liệu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-[11px]">
                <strong>Chế độ lưu trữ:</strong> Hồ sơ được số hóa và gắn liên kết vào cơ sở dữ liệu SmartSchool. Khi kết nối Google Drive / Apps Script, tệp sẽ tự động đồng bộ lên thư mục đám mây của trường.
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Lưu vào Kho minh chứng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
