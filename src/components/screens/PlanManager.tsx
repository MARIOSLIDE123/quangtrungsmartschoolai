import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  Download,
  X,
  FileCheck2,
} from 'lucide-react';
import { SchoolPlan, CampusId, CurrentUser, PlanType, PlanStatus } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';
import { NavScreenId } from '../layout/Sidebar';

interface PlanManagerProps {
  selectedCampus: CampusId;
  currentUser: CurrentUser;
  onNavigateScreen: (s: NavScreenId) => void;
}

export const PlanManager: React.FC<PlanManagerProps> = ({
  selectedCampus,
  currentUser,
  onNavigateScreen,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SchoolPlan | null>(null);

  // New plan state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PlanType>('Kế hoạch tuần');
  const [period, setPeriod] = useState('Tháng 10 / Năm học 2025 - 2026');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PlanStatus>('Chờ duyệt');

  const plans = dataService.getPlans(selectedCampus);

  const filteredPlans = plans.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const handleCreatePlan = () => {
    if (!title.trim()) return;

    dataService.createPlan(
      {
        planCode: `KH-${Date.now().toString().slice(-4)}`,
        title,
        type,
        period,
        campusIds: [selectedCampus],
        owner: currentUser.name,
        content,
        status,
        relatedTaskIds: [],
        attachmentName: `${title.replace(/\s+/g, '_')}.pdf`,
      },
      currentUser
    );

    setIsNewPlanModalOpen(false);
    setTitle('');
    setContent('');
  };

  const handleApprovePlan = (plan: SchoolPlan) => {
    if (currentUser.role !== 'hieu_truong') {
      alert('Chỉ Hiệu trưởng mới có thẩm quyền ban hành kế hoạch chính thức của nhà trường.');
      return;
    }
    dataService.updatePlan(
      plan.id,
      {
        status: 'Đã ban hành',
        approvedBy: currentUser.name,
      },
      currentUser
    );
    setSelectedPlan(null);
  };

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            QUẢN LÝ KẾ HOẠCH NHÀ TRƯỜNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xây dựng, dự thảo và ban hành kế hoạch tuần, tháng, học kỳ và năm học cho 3 khu trường
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateScreen('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Dự thảo kế hoạch bằng AI</span>
          </button>

          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo kế hoạch mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Lọc theo:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">Loại: Tất cả</option>
            <option value="Kế hoạch tuần">Kế hoạch tuần</option>
            <option value="Kế hoạch tháng">Kế hoạch tháng</option>
            <option value="Kế hoạch học kỳ">Kế hoạch học kỳ</option>
            <option value="Kế hoạch năm học">Kế hoạch năm học</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="Đã ban hành">Đã ban hành</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Dự thảo">Dự thảo</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500">
          Tổng số <strong>{filteredPlans.length}</strong> kế hoạch trong hệ thống
        </div>
      </div>

      {/* Plans List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => {
          const isApproved = plan.status === 'Đã ban hành';
          const isPending = plan.status === 'Chờ duyệt';

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <span className="font-mono text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {plan.planCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPending
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.status}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {plan.type} · {plan.period}
                  </span>
                  <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-blue-700">
                    {plan.title}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {plan.content}
                </p>

                {plan.isAiDraft && (
                  <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block font-semibold">
                    Dự thảo do AI hỗ trợ – Chờ kiểm duyệt
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[150px]">Lập bởi: {plan.owner}</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Chi tiết →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                  {selectedPlan.planCode}
                </span>
                <h3 className="font-bold text-sm mt-1">{selectedPlan.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Loại kế hoạch</span>
                  <div className="font-bold">{selectedPlan.type}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Giai đoạn</span>
                  <div className="font-semibold">{selectedPlan.period}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Trạng thái</span>
                  <div className="font-bold text-blue-700">{selectedPlan.status}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Nội dung kế hoạch chi tiết:</span>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed text-slate-800">
                  {selectedPlan.content}
                </div>
              </div>

              {selectedPlan.isAiDraft && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                  <strong>Lưu ý:</strong> Văn bản này được hỗ trợ dự thảo bởi mô hình AI dựa trên số liệu nhiệm vụ của 3 khu trường. Cần được Ban Giám hiệu ký duyệt trước khi ban hành chính thức.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div>
                {selectedPlan.status === 'Chờ duyệt' && (
                  <button
                    onClick={() => handleApprovePlan(selectedPlan)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hiệu trưởng phê duyệt ban hành</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Plan Modal */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Khởi tạo kế hoạch quản lý mới</span>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên kế hoạch *</label>
                <input
                  type="text"
                  placeholder="VD: Kế hoạch kiểm tra nội bộ học kỳ I..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại kế hoạch</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PlanType)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Kế hoạch tuần">Kế hoạch tuần</option>
                    <option value="Kế hoạch tháng">Kế hoạch tháng</option>
                    <option value="Kế hoạch học kỳ">Kế hoạch học kỳ</option>
                    <option value="Kế hoạch năm học">Kế hoạch năm học</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian áp dụng</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nội dung triển khai</label>
                <textarea
                  rows={4}
                  placeholder="Mục đích, yêu cầu, tiến độ và phân công nhiệm vụ cụ thể cho 3 khu trường..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Lưu kế hoạch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
