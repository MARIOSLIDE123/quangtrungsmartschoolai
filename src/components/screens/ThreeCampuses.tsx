import React, { useState } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Campus, CampusId, CurrentUser, Task } from '../../types';
import { CAMPUSES } from '../../data/initialData';
import { dataService } from '../../services/dataService';
import { NavScreenId } from '../layout/Sidebar';

interface ThreeCampusesProps {
  selectedCampus: CampusId;
  onSelectCampus: (c: CampusId) => void;
  onNavigateScreen: (s: NavScreenId) => void;
  onSelectTask: (t: Task) => void;
}

export const ThreeCampuses: React.FC<ThreeCampusesProps> = ({
  selectedCampus,
  onSelectCampus,
  onNavigateScreen,
  onSelectTask,
}) => {
  const campuses = dataService.getCampuses();
  const staffList = dataService.getStaffList();

  const [activeCampusTab, setActiveCampusTab] = useState<CampusId>(campuses[0]?.id || 'campus-1');

  const tasks = dataService.getTasks();
  const evidences = dataService.getEvidences();
  const events = dataService.getEvents();

  const selectedCampusObj = campuses.find((c) => c.id === activeCampusTab) || campuses[0] || CAMPUSES[0];

  const campusStaff = staffList.filter((s) => s.campusName.includes(selectedCampusObj.name) || s.campusName.includes(selectedCampusObj.shortName));

  const campusTasks = tasks.filter(
    (t) => t.campusId === activeCampusTab || t.campusId === 'all'
  );
  const campusEvidences = evidences.filter(
    (e) => e.campusId === activeCampusTab || e.campusId === 'all'
  );
  const campusEvents = events.filter(
    (ev) => ev.campusId === activeCampusTab || ev.campusId === 'all'
  );

  const completedCount = campusTasks.filter((t) => t.status === 'Hoàn thành').length;
  const inProgressCount = campusTasks.filter((t) => t.status === 'Đang thực hiện').length;
  const overdueCount = campusTasks.filter((t) => t.status === 'Quá hạn').length;
  const rate = campusTasks.length > 0 ? Math.round((completedCount / campusTasks.length) * 100) : 0;

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            QUẢN LÝ BA KHU TRƯỜNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảo đảm đồng bộ quản trị giữa Cơ sở chính, Điểm trường phía Tây và Điểm trường phía Nam
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSelectCampus(activeCampusTab);
              onNavigateScreen('tasks');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Lọc bảng việc theo {selectedCampusObj.shortName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Campus Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {campuses.map((c) => {
          const isSelected = activeCampusTab === c.id;
          const cStaff = staffList.filter((s) => s.campusName.includes(c.name) || s.campusName.includes(c.shortName));
          const cTasks = tasks.filter((t) => t.campusId === c.id || t.campusId === 'all');
          const cComp = cTasks.filter((t) => t.status === 'Hoàn thành').length;
          const cOver = cTasks.filter((t) => t.status === 'Quá hạn').length;
          const cRate = cTasks.length > 0 ? Math.round((cComp / cTasks.length) * 100) : 0;

          return (
            <button
              key={c.id}
              onClick={() => setActiveCampusTab(c.id)}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <h3 className="font-bold text-xs text-[#142B4A] uppercase tracking-wide">
                    {c.shortName}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {cStaff.length > 0 ? `${cStaff.length} CBGV` : `${c.teachersCount} GV`}
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {cRate}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 mt-2">
                <span className="font-medium text-slate-800">{c.manager}</span>
                <span className="text-slate-400"> · {c.managerTitle}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nhiệm vụ</span>
                  <span className="font-bold text-slate-800 tabular-nums">{cTasks.length}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block">Xong</span>
                  <span className="font-bold text-emerald-700 tabular-nums">{cComp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-red-600 block">Quá hạn</span>
                  <span className="font-bold text-red-700 tabular-nums">{cOver}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Campus Deep Dive Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
        {/* Campus Overview Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {selectedCampusObj.code}
              </span>
              <h2 className="text-base font-bold text-[#142B4A]">
                {selectedCampusObj.name}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {selectedCampusObj.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedCampusObj.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCampusObj.phone}
              </span>
            </div>
          </div>

          {/* Key School Stats */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block">Quy mô lớp</span>
              <strong className="text-base font-bold text-slate-900 tabular-nums">
                {selectedCampusObj.classesCount} lớp
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Tổng học sinh</span>
              <strong className="text-base font-bold text-blue-700 tabular-nums">
                {selectedCampusObj.studentsCount} HS
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Cán bộ GV thực tế</span>
              <strong className="text-base font-bold text-slate-900 tabular-nums">
                {campusStaff.length > 0 ? `${campusStaff.length} CBGV` : `${selectedCampusObj.teachersCount} CBGV`}
              </strong>
            </div>
          </div>
        </div>

        {/* 2-Column Campus Details: Tasks vs (Events & Evidence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Campus Task List (col-span-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Nhiệm vụ đang triển khai tại {selectedCampusObj.shortName} ({campusTasks.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {rate}% hoàn thành
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {campusTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 text-xs group-hover:text-blue-700">
                      [{t.taskCode}] {t.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Phụ trách: <strong>{t.assignee}</strong></span>
                      <span>·</span>
                      <span>Hạn: {t.dueDate}</span>
                      <span>·</span>
                      <span>Tiến độ: {t.progress}%</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      t.status === 'Hoàn thành'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'Quá hạn'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Events and Evidence for this Campus (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Campus Events */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Lịch hoạt động & sự kiện sắp tới ({campusEvents.length})
              </h3>
              <div className="space-y-2 max-h-[170px] overflow-y-auto">
                {campusEvents.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">Chưa có lịch riêng.</div>
                ) : (
                  campusEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 text-[11px]">{ev.title}</div>
                        <div className="text-[10px] text-slate-400">{ev.startAt} · {ev.location}</div>
                      </div>
                      <span className="text-[10px] text-blue-700 font-semibold">{ev.category.split(' ')[0]}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Campus Evidence */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Minh chứng đã số hóa tại cơ sở ({campusEvidences.length})
              </h3>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {campusEvidences.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">Chưa có minh chứng.</div>
                ) : (
                  campusEvidences.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between"
                    >
                      <div className="truncate mr-2">
                        <span className="font-mono text-blue-600 font-semibold">{e.evidenceCode}</span>{' '}
                        <span className="text-slate-700">{e.title}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                        {e.reviewStatus}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
