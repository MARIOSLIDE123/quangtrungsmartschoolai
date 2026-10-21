import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ListTodo,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';
import { Task, CampusId, CurrentUser } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';
import { NavScreenId } from '../layout/Sidebar';

interface DashboardOverviewProps {
  selectedCampus: CampusId;
  onSelectCampus: (c: CampusId) => void;
  onNavigateScreen: (screen: NavScreenId) => void;
  onSelectTask: (task: Task) => void;
  currentUser: CurrentUser;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  selectedCampus,
  onSelectCampus,
  onNavigateScreen,
  onSelectTask,
}) => {
  const [activeCampusTooltip, setActiveCampusTooltip] = useState<string | null>(null);

  const metrics = dataService.getMetrics(selectedCampus);
  const tasks = dataService.getTasks(selectedCampus);
  const aiSuggestions = dataService.getAiExecutiveSuggestions(selectedCampus);

  // Filter 6 tasks needing immediate attention: overdue first, then urgent, then pending review
  const tasksNeedingAttention = [...tasks]
    .sort((a, b) => {
      const score = (t: Task) => {
        if (t.status === 'Quá hạn') return 100;
        if (t.status === 'Chờ kiểm tra') return 80;
        if (t.priority === 'Cao') return 60;
        return 10;
      };
      return score(b) - score(a);
    })
    .slice(0, 6);

  // SVG Donut calculation
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (metrics.completionRate / 100) * circumference;

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title & Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            TỔNG QUAN ĐIỀU HÀNH
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xin chào Ban Giám hiệu! Dưới đây là tình hình thực hiện nhiệm vụ của toàn trường.{' '}
            <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
              Dữ liệu demo phục vụ trình diễn
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateScreen('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Phân tích AI tức thì</span>
          </button>
        </div>
      </div>

      {/* ROW 1: 5 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Tasks */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng số nhiệm vụ</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#142B4A] tabular-nums">
              {metrics.total}
            </span>
            <span className="text-[11px] text-slate-400">100% chỉ tiêu</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Phân bố trên cả 3 khu trường</div>
        </div>

        {/* Completed */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Đã hoàn thành</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#16A34A] tabular-nums">
              {metrics.completed}
            </span>
            <span className="text-xs font-bold text-emerald-600 tabular-nums">
              {metrics.completionRate}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-700">Đã kiểm tra & phê duyệt</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800">Đang thực hiện</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#2563EB] tabular-nums">
              {metrics.inProgress}
            </span>
            <span className="text-xs font-medium text-blue-600 tabular-nums">
              {metrics.total > 0 ? Math.round((metrics.inProgress / metrics.total) * 100) : 0}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-blue-700">Đúng tiến độ định kỳ</div>
        </div>

        {/* Approaching Deadline (Urgent) */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Sắp đến hạn</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#F59E0B] tabular-nums">
              {metrics.urgent}
            </span>
            <span className="text-[11px] text-amber-600 font-medium">Trong 72 giờ</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-700">Cần chủ động đôn đốc</div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-3.5 rounded-xl border border-red-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-800">Quá hạn</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-[#DC2626] flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#DC2626] tabular-nums">
              {metrics.overdue}
            </span>
            <span className="text-[11px] text-red-600 font-bold">Cần xử lý ngay</span>
          </div>
          <div className="mt-1 text-[11px] text-red-700">Tự động kích hoạt cảnh báo</div>
        </div>
      </div>

      {/* ROW 2: 2 CHARTS (60% Campus Bar Chart, 40% Completion Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Chart: 60% Width (col-span-7) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                Tiến độ nhiệm vụ theo ba khu trường
              </h2>
              <p className="text-[11px] text-slate-500">
                So sánh số lượng Đã hoàn thành, Đang thực hiện và Quá hạn tại từng cơ sở
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#16A34A]" /> Hoàn thành
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]" /> Đang làm
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" /> Quá hạn
              </span>
            </div>
          </div>

          {/* Bespoke Crisp SVG/Bar Data Display */}
          <div className="space-y-4 py-2">
            {metrics.campusBreakdown.map((item) => {
              const maxVal = Math.max(...metrics.campusBreakdown.map((b) => b.total), 15);
              const compPercent = (item.completed / maxVal) * 100;
              const inProgPercent = (item.inProgress / maxVal) * 100;
              const overPercent = (item.overdue / maxVal) * 100;

              return (
                <div key={item.campus.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      {item.campus.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                      Tổng: <strong className="text-slate-800">{item.total}</strong> ({item.completionRate}% hoàn thành)
                    </span>
                  </div>

                  {/* Multi-segmented stacked bar with real numbers */}
                  <div className="h-6 w-full bg-slate-100 rounded-md overflow-hidden flex border border-slate-200">
                    {item.completed > 0 && (
                      <div
                        style={{ width: `${(item.completed / item.total) * 100}%` }}
                        className="bg-[#16A34A] h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90"
                        title={`${item.campus.name} - Hoàn thành: ${item.completed}`}
                      >
                        {item.completed}
                      </div>
                    )}
                    {item.inProgress > 0 && (
                      <div
                        style={{ width: `${(item.inProgress / item.total) * 100}%` }}
                        className="bg-[#2563EB] h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90"
                        title={`${item.campus.name} - Đang thực hiện: ${item.inProgress}`}
                      >
                        {item.inProgress}
                      </div>
                    )}
                    {item.pendingReview > 0 && (
                      <div
                        style={{ width: `${(item.pendingReview / item.total) * 100}%` }}
                        className="bg-purple-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90"
                        title={`${item.campus.name} - Chờ kiểm tra: ${item.pendingReview}`}
                      >
                        {item.pendingReview}
                      </div>
                    )}
                    {item.overdue > 0 && (
                      <div
                        style={{ width: `${(item.overdue / item.total) * 100}%` }}
                        className="bg-[#DC2626] h-full flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-90"
                        title={`${item.campus.name} - Quá hạn: ${item.overdue}`}
                      >
                        {item.overdue}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Dữ liệu liên kết trực tiếp với 28 nhiệm vụ quản lý của 3 cơ sở</span>
            <button
              onClick={() => onNavigateScreen('campuses')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Xem chi tiết đối sánh <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Chart: 40% Width (col-span-5) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                Tỷ lệ hoàn thành toàn trường
              </h2>
              <p className="text-[11px] text-slate-500">Chỉ số hiệu suất thực hiện nhiệm vụ</p>
            </div>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Mục tiêu: 85%
            </span>
          </div>

          {/* Donut Chart Visual */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Centered Stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-[#142B4A] tabular-nums tracking-tight">
                  {metrics.completionRate}%
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase">
                  Hoàn thành
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown statistics below Donut */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="block text-[10px] text-slate-500">Đạt yêu cầu</span>
              <strong className="text-sm font-bold text-[#16A34A] tabular-nums">
                {metrics.completed}
              </strong>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="block text-[10px] text-slate-500">Chưa xong</span>
              <strong className="text-sm font-bold text-[#2563EB] tabular-nums">
                {metrics.inProgress + metrics.pendingReview}
              </strong>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg">
              <span className="block text-[10px] text-slate-500">Chậm trễ</span>
              <strong className="text-sm font-bold text-[#DC2626] tabular-nums">
                {metrics.overdue}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: THREE CAMPUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {CAMPUSES.map((c) => {
          const cTasks = tasks.filter((t) => t.campusId === c.id || t.campusId === 'all');
          const total = cTasks.length;
          const completed = cTasks.filter((t) => t.status === 'Hoàn thành').length;
          const inProgress = cTasks.filter((t) => t.status === 'Đang thực hiện').length;
          const overdue = cTasks.filter((t) => t.status === 'Quá hạn').length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div
              key={c.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <h3 className="font-bold text-xs text-[#142B4A] uppercase tracking-wide">
                      {c.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {rate}% xong
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                  <div className="font-medium text-slate-800">{c.manager}</div>
                  <div className="text-slate-500 text-[10px] truncate">{c.address}</div>
                </div>

                {/* Campus Mini Stats */}
                <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                  <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Được giao</span>
                    <span className="font-bold text-slate-800 tabular-nums">{total}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block">Hoàn thành</span>
                    <span className="font-bold text-emerald-700 tabular-nums">{completed}</span>
                  </div>
                  <div className="bg-red-50/50 p-1.5 rounded-lg border border-red-100">
                    <span className="text-[10px] text-red-700 block">Quá hạn</span>
                    <span className="font-bold text-red-700 tabular-nums">{overdue}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Tiến độ thực hiện</span>
                    <span className="font-semibold text-slate-700">{rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button: Filter tasks to this campus */}
              <button
                onClick={() => {
                  onSelectCampus(c.id);
                  onNavigateScreen('tasks');
                }}
                className="mt-3 w-full py-1.5 px-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <span>Xem danh sách nhiệm vụ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ROW 4: TASKS NEEDING ATTENTION & AI SUGGESTIONS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Highlighted Tasks Table (col-span-8) */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-[#142B4A] uppercase tracking-wide">
                Nhiệm vụ cần ưu tiên chú ý ({tasksNeedingAttention.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Tự động ưu tiên các nhiệm vụ quá hạn, sắp đến hạn hoặc chưa bổ sung minh chứng
              </p>
            </div>
            <button
              onClick={() => onNavigateScreen('tasks')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              Xem tất cả bảng <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <th className="py-2 px-2.5 font-semibold">Tên nhiệm vụ</th>
                  <th className="py-2 px-2 font-semibold">Khu trường</th>
                  <th className="py-2 px-2 font-semibold">Phụ trách</th>
                  <th className="py-2 px-2 font-semibold">Hạn xử lý</th>
                  <th className="py-2 px-2 font-semibold">Trạng thái</th>
                  <th className="py-2 px-2 font-semibold">Minh chứng</th>
                  <th className="py-2 px-2 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasksNeedingAttention.map((t) => {
                  const isOverdue = t.status === 'Quá hạn';
                  const isPending = t.status === 'Chờ kiểm tra';
                  const hasEvidence = t.evidenceIds && t.evidenceIds.length > 0;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => onSelectTask(t)}
                    >
                      <td className="py-2 px-2.5 max-w-[240px]">
                        <div className="font-semibold text-slate-900 truncate" title={t.title}>
                          {t.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-blue-600 font-medium">{t.taskCode}</span>
                          <span>·</span>
                          <span>{t.category}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-slate-600 text-[11px]">
                        {t.campusName.split(' - ')[0]}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                        {t.assignee}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap text-slate-600 text-[11px] tabular-nums">
                        {t.dueDate}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-red-100 text-[#DC2626]'
                              : isPending
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-[#2563EB]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {hasEvidence ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Đã có MC
                          </span>
                        ) : t.evidenceRequired ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                            Chưa có MC
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Không yêu cầu</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded text-[11px] font-medium transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI ĐỀ XUẤT ĐIỀU HÀNH Panel (col-span-4) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-blue-900 to-[#142B4A] text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Đề xuất điều hành
                  </h2>
                  <p className="text-[10px] text-slate-300">
                    Phân tích thời gian thực từ dữ liệu 3 khu trường
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                Gemini 3.8
              </span>
            </div>

            {/* Suggestions list */}
            <div className="mt-3 space-y-2.5">
              {aiSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{sug.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {sug.message}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onNavigateScreen(sug.actionTab as NavScreenId)}
                      className="text-[11px] font-semibold text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>{sug.actionText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dữ liệu căn cứ · BGH giữ quyền quyết định</span>
            <button
              onClick={() => onNavigateScreen('ai-assistant')}
              className="text-white hover:underline font-semibold"
            >
              Mở Trợ lý AI đầy đủ →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
