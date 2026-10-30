import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  ChevronDown,
  Building,
  UserCheck,
  PlayCircle,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { CampusId, CurrentUser } from '../../types';
import { CAMPUSES, USERS } from '../../data/initialData';
import { dataService } from '../../services/dataService';
import { NavScreenId } from './Sidebar';

interface HeaderProps {
  activeScreen: NavScreenId;
  selectedCampus: CampusId;
  onSelectCampus: (campusId: CampusId) => void;
  currentUser: CurrentUser;
  onChangeUser: (user: CurrentUser) => void;
  onOpenNewTaskModal: () => void;
  onOpenDemoScriptModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  alertsCount: number;
  onViewAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  selectedCampus,
  onSelectCampus,
  currentUser,
  onChangeUser,
  onOpenNewTaskModal,
  onOpenDemoScriptModal,
  searchQuery,
  onSearchChange,
  alertsCount,
  onViewAlerts,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const activeGasUrl = dataService.getActiveWebAppUrl();

  const handleQuickSync = async () => {
    if (!activeGasUrl) {
      alert('Hệ thống hiện đang chạy chế độ Lưu trữ cục bộ (Local Storage). Để đồng bộ Google Sheets, vui lòng mở file `src/config/googleSheetConfig.ts` và dán đường dẫn Web App URL vào.');
      return;
    }
    setIsSyncing(true);
    const res = await dataService.pullFromGas();
    setIsSyncing(false);
    setSyncFeedback(res.success ? 'Đã đồng bộ!' : 'Lỗi kết nối');
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      setCurrentDateTime(now.toLocaleDateString('vi-VN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        alert('Trình duyệt đã chặn toàn màn hình. Quý Thầy/Cô vui lòng nhấn phím F11 trên bàn phím để bật chế độ toàn màn hình 16:9.');
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const screenTitles: Record<NavScreenId, string> = {
    overview: 'Tổng quan điều hành',
    staff: 'Quản lý hồ sơ nhân sự & Giáo viên',
    tasks: 'Quản lý nhiệm vụ',
    calendar: 'Lịch công tác',
    'ai-assistant': 'Trợ lý AI SmartSchool',
    plans: 'Quản lý kế hoạch',
    reports: 'Báo cáo & Thống kê',
    evidence: 'Kho minh chứng tập trung',
    campuses: 'Quản lý ba khu trường',
    settings: 'Cài đặt hệ thống & Phân quyền',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 shrink-0 shadow-xs z-20">
      {/* Left: Breadcrumbs & Campus Filter */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
          <span className="font-medium text-slate-700">Quang Trung</span>
          <span>/</span>
          <span className="font-semibold text-blue-600 truncate max-w-[180px]">
            {screenTitles[activeScreen]}
          </span>
        </div>

        {/* Campus Filter Segmented Control */}
        <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
          <button
            onClick={() => onSelectCampus('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              selectedCampus === 'all'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả (3 Khu)
          </button>
          {CAMPUSES.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCampus(c.id)}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                selectedCampus === c.id
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.shortName.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-xs relative hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm nhanh nhiệm vụ, cán bộ, mã QT..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Real-time Digital Clock */}
        <div className="hidden xl:flex flex-col text-right pr-2 border-r border-slate-200">
          <span className="text-[11px] font-semibold text-slate-700 tabular-nums">
            {currentDateTime}
          </span>
          <span className="text-[10px] text-slate-400">
            Năm học 2025 - 2026
          </span>
        </div>

        {/* Google Sheet Sync Quick Action */}
        <button
          onClick={handleQuickSync}
          disabled={isSyncing}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors border ${
            activeGasUrl
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={
            activeGasUrl
              ? 'Google Sheets đã kết nối tự động. Bấm để đồng bộ dữ liệu 2 chiều ngay.'
              : 'Đang chạy Local Storage. Dán Web App URL vào file googleSheetConfig.ts để kết nối Google Sheets.'
          }
        >
          <Cloud className={`w-3.5 h-3.5 ${activeGasUrl ? 'text-emerald-600' : 'text-slate-400'} ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">
            {syncFeedback || (isSyncing ? 'Đang đồng bộ...' : (activeGasUrl ? 'Đồng bộ Sheet' : 'Demo Local'))}
          </span>
        </button>

        {/* Demo Script Walkthrough Button (For Judges) */}
        <button
          onClick={onOpenDemoScriptModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          title="Xem kịch bản trình diễn 8 bước cho Ban Giám khảo"
        >
          <PlayCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Kịch bản BGK</span>
        </button>

        {/* Action: Giao nhiệm vụ mới */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Giao nhiệm vụ</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onViewAlerts}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title={`${alertsCount} cảnh báo cần xử lý`}
        >
          <Bell className="w-4 h-4" />
          {alertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
              {alertsCount}
            </span>
          )}
        </button>

        {/* Fullscreen Mode toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Trình diễn toàn màn hình 16:9 (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* User Account & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.avatarText}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-blue-600 font-medium leading-tight">
                {currentUser.roleTitle.split(' - ')[0]}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Dropdown */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-500 text-[10px] uppercase block">
                  Đổi vai trò để thử nghiệm phân quyền
                </span>
                <span className="text-slate-800 text-[11px] font-medium">
                  {currentUser.roleTitle}
                </span>
              </div>

              {USERS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onChangeUser(u);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-slate-50 transition-colors ${
                    currentUser.id === u.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                      currentUser.id === u.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {u.avatarText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{u.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {u.roleTitle}
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}

              <div className="mt-1 pt-1 border-t border-slate-100 px-3 py-1 text-[10px] text-slate-400">
                Phân quyền theo chức danh quản lý giáo dục
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
