import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import { Task, TaskCategory, TaskStatus, CampusId, CurrentUser } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';

interface TaskManagerProps {
  selectedCampus: CampusId;
  onSelectCampus: (c: CampusId) => void;
  onSelectTask: (t: Task) => void;
  onOpenNewTaskModal: () => void;
  currentUser: CurrentUser;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  selectedCampus,
  onSelectCampus,
  onSelectTask,
  onOpenNewTaskModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all'); // 'all' | 'has_evidence' | 'missing_evidence'
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'code'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const allTasks = dataService.getTasks(selectedCampus);

  // Filter tasks based on controls
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      // Search
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.taskCode.toLowerCase().includes(search.toLowerCase()) ||
        t.assignee.toLowerCase().includes(search.toLowerCase()) ||
        t.campusName.toLowerCase().includes(search.toLowerCase());

      // Status
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;

      // Category
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;

      // Evidence
      let matchEvidence = true;
      const hasEv = t.evidenceIds && t.evidenceIds.length > 0;
      if (evidenceFilter === 'has_evidence') {
        matchEvidence = hasEv;
      } else if (evidenceFilter === 'missing_evidence') {
        matchEvidence = t.evidenceRequired && !hasEv;
      }

      return matchSearch && matchStatus && matchCategory && matchEvidence;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        const cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { Cao: 3, 'Trung bình': 2, Thấp: 1 };
        const cmp = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      if (sortBy === 'code') {
        return sortOrder === 'asc' ? a.taskCode.localeCompare(b.taskCode) : b.taskCode.localeCompare(a.taskCode);
      }
      return 0;
    });
  }, [allTasks, search, statusFilter, categoryFilter, evidenceFilter, sortBy, sortOrder]);

  const categories: TaskCategory[] = [
    'Công tác chuyên môn',
    'Kiểm tra nội bộ',
    'Cơ sở vật chất',
    'Hoạt động giáo dục',
    'Công tác hành chính',
    'Phối hợp phụ huynh',
    'Chuyển đổi số',
    'Báo cáo định kỳ',
  ];

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            QUẢN LÝ NHIỆM VỤ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi, điều hành và kiểm soát tiến độ công việc giữa ba khu trường theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Giao nhiệm vụ mới</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên, người..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampus}
            onChange={(e) => onSelectCampus(e.target.value as CampusId)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="all">Khu trường: Tất cả (3 Khu)</option>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="Chưa thực hiện">Chưa thực hiện</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Chờ kiểm tra">Chờ kiểm tra</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Quá hạn">Quá hạn</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="all">Nhóm việc: Tất cả</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Evidence Filter */}
          <select
            value={evidenceFilter}
            onChange={(e) => setEvidenceFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="all">Minh chứng: Tất cả</option>
            <option value="has_evidence">Đã có minh chứng</option>
            <option value="missing_evidence">Thiếu minh chứng (Cần nộp)</option>
          </select>
        </div>

        {/* Filter Summary & Result Count */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <div>
            Hiển thị <strong>{filteredTasks.length}</strong> / {allTasks.length} nhiệm vụ
          </div>
          <div className="flex items-center gap-2">
            <span>Sắp xếp:</span>
            <button
              onClick={() => {
                setSortBy('dueDate');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded border ${
                sortBy === 'dueDate' ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' : 'border-slate-200'
              }`}
            >
              Hạn hoàn thành {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                setSortBy('priority');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className={`px-2 py-0.5 rounded border ${
                sortBy === 'priority' ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' : 'border-slate-200'
              }`}
            >
              Mức ưu tiên {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Task Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Mã nhiệm vụ</th>
                <th className="py-2.5 px-3 min-w-[220px]">Tên nhiệm vụ</th>
                <th className="py-2.5 px-2.5">Nhóm công việc</th>
                <th className="py-2.5 px-2.5">Khu trường</th>
                <th className="py-2.5 px-2.5">Người phụ trách</th>
                <th className="py-2.5 px-2">Ngày giao</th>
                <th className="py-2.5 px-2">Hạn xong</th>
                <th className="py-2.5 px-2 text-center">Ưu tiên</th>
                <th className="py-2.5 px-2.5">Trạng thái</th>
                <th className="py-2.5 px-2.5 text-center">Minh chứng</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhiệm vụ nào khớp với tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => {
                  const isOverdue = t.status === 'Quá hạn';
                  const isCompleted = t.status === 'Hoàn thành';
                  const isPending = t.status === 'Chờ kiểm tra';
                  const hasEvidence = t.evidenceIds && t.evidenceIds.length > 0;

                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 text-[11px] whitespace-nowrap">
                        {t.taskCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-1" title={t.title}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Tiến độ: <strong className="text-slate-700">{t.progress}%</strong></span>
                          <span>·</span>
                          <span>Giao bởi: {t.creator.split(' (')[0]}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-600 text-[11px]">
                        {t.category}
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                        {t.campusName.split(' - ')[0]}
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-[11px]">{t.assignee}</div>
                        <div className="text-[10px] text-slate-400">{t.assigneeRole}</div>
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap text-slate-500 text-[11px] tabular-nums">
                        {t.createdAt}
                      </td>
                      <td className="py-2.5 px-2 whitespace-nowrap tabular-nums">
                        <span
                          className={`font-semibold text-[11px] ${
                            isOverdue
                              ? 'text-red-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {t.dueDate}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.priority === 'Cao'
                              ? 'bg-red-100 text-red-700'
                              : t.priority === 'Trung bình'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-red-100 text-red-800'
                              : isPending
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                        {hasEvidence ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold"
                            title="Đã có hồ sơ minh chứng đính kèm"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã nộp ({t.evidenceIds.length})
                          </span>
                        ) : t.evidenceRequired ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold"
                            title="Bắt buộc có minh chứng nhưng chưa nộp"
                          >
                            <ShieldAlert className="w-3 h-3 text-amber-600" /> Thiếu MC
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Không bắt buộc</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
