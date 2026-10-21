import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Sparkles,
  FileText,
  BarChart3,
  FolderArchive,
  Building2,
  Settings,
  Database,
  Cpu,
} from 'lucide-react';
import { CrestLogo } from '../common/CrestLogo';

export type NavScreenId =
  | 'overview'
  | 'tasks'
  | 'calendar'
  | 'ai-assistant'
  | 'plans'
  | 'reports'
  | 'evidence'
  | 'campuses'
  | 'settings';

interface SidebarProps {
  activeScreen: NavScreenId;
  onSelectScreen: (screen: NavScreenId) => void;
  pendingAlertsCount: number;
}

interface NavItem {
  id: NavScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onSelectScreen,
  pendingAlertsCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Tổng quan điều hành', icon: LayoutDashboard },
    { id: 'tasks', label: 'Quản lý nhiệm vụ', icon: CheckSquare, badge: pendingAlertsCount },
    { id: 'calendar', label: 'Lịch công tác', icon: Calendar },
    { id: 'ai-assistant', label: 'Trợ lý AI', icon: Sparkles },
    { id: 'plans', label: 'Quản lý kế hoạch', icon: FileText },
    { id: 'reports', label: 'Báo cáo & thống kê', icon: BarChart3 },
    { id: 'evidence', label: 'Kho minh chứng', icon: FolderArchive },
    { id: 'campuses', label: 'Quản lý 3 khu trường', icon: Building2 },
    { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <aside className="w-[240px] h-screen bg-[#142B4A] text-white flex flex-col shrink-0 select-none border-r border-[#1e3a5f]/60 z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <CrestLogo className="w-10 h-10 shrink-0 drop-shadow" />
        <div className="flex flex-col min-w-0">
          <div className="font-bold text-sm tracking-wide text-white leading-tight uppercase font-sans">
            QUANG TRUNG
          </div>
          <div className="text-xs font-semibold text-blue-400 tracking-wider">
            SMARTSCHOOL AI
          </div>
          <div className="text-[10px] text-slate-300 tracking-tight truncate mt-0.5 font-medium">
            HỆ THỐNG QUẢN TRỊ THÔNG MINH
          </div>
        </div>
      </div>

      {/* Campus Slogan */}
      <div className="px-3 py-2 mx-3 my-2 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-200 leading-tight text-center font-medium">
        1 Hệ thống · 3 Khu trường · Quyết định dựa trên dữ liệu
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full" />
              )}
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-300 group-hover:text-blue-300'
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                    isActive
                      ? 'bg-white text-blue-700'
                      : 'bg-red-500/90 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-white/10 bg-[#0e1f36]/70 text-[11px] text-slate-300 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Trạng thái dữ liệu</span>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <Database className="w-3 h-3" /> Cục bộ & GAS
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Mô hình AI</span>
          <span className="text-[10px] text-blue-300 font-medium flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Gemini 3.8 Flash
          </span>
        </div>
        <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-white/5">
          Phiên bản 2.4 · Trường TH Quang Trung
        </div>
      </div>
    </aside>
  );
};
