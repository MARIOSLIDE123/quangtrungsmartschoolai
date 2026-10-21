import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Building2,
  Trash2,
  CheckSquare,
  X,
} from 'lucide-react';
import { CalendarEvent, CampusId, CurrentUser, EventCategory } from '../../types';
import { dataService } from '../../services/dataService';
import { CAMPUSES } from '../../data/initialData';

interface CalendarScheduleProps {
  selectedCampus: CampusId;
  onSelectCampus: (c: CampusId) => void;
  currentUser: CurrentUser;
}

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({
  selectedCampus,
  onSelectCampus,
  currentUser,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form states for new event
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [campusId, setCampusId] = useState<CampusId>('all');
  const [category, setCategory] = useState<EventCategory>('Họp Ban Giám hiệu');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const rawEvents = dataService.getEvents(selectedCampus);
  const tasks = dataService.getTasks(selectedCampus);

  // Merge task deadlines as calendar events as required by Section 6:
  // "Các thời hạn nhiệm vụ phải có khả năng xuất hiện trên lịch công tác."
  const taskDeadlineEvents: CalendarEvent[] = tasks.map((t) => ({
    id: `task-deadline-${t.id}`,
    title: `[Hạn QT] ${t.title}`,
    startAt: t.dueDate,
    endAt: t.dueDate,
    campusId: t.campusId,
    category: 'Hạn hoàn thành nhiệm vụ',
    relatedTaskId: t.id,
    organizer: t.assignee,
    location: t.campusName,
    description: `Nhiệm vụ: [${t.taskCode}] - Tiến độ: ${t.progress}% - Trạng thái: ${t.status}`,
  }));

  const allCombinedEvents = [...rawEvents, ...taskDeadlineEvents];

  const filteredEvents = allCombinedEvents.filter((ev) => {
    if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
    return true;
  });

  const getCategoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'Họp Ban Giám hiệu':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Kiểm tra nội bộ':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Sinh hoạt chuyên môn':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Hạn hoàn thành nhiệm vụ':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Hoạt động chung 3 khu':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Hoạt động giáo dục':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleCreateEvent = () => {
    if (!title.trim()) return;

    dataService.createEvent(
      {
        title,
        startAt,
        endAt: startAt,
        campusId,
        category,
        organizer: currentUser.name,
        location: location || 'Hội đồng trường',
        description,
      },
      currentUser
    );

    setIsNewEventModalOpen(false);
    setTitle('');
    setLocation('');
    setDescription('');
  };

  const handleDeleteEvent = (id: string) => {
    if (id.startsWith('task-deadline-')) {
      alert('Đây là mốc hạn nhiệm vụ được đồng bộ tự động từ bảng Quản lý nhiệm vụ.');
      return;
    }
    if (confirm('Quý Thầy/Cô có chắc chắn muốn hủy sự kiện này?')) {
      dataService.deleteEvent(id, currentUser);
      setSelectedEvent(null);
    }
  };

  // Generate 35 calendar cells for October
  const calendarCells = Array.from({ length: 35 }, (_, idx) => {
    const dayNum = idx - 2; // Alignment for Month grid
    const isCurrentMonth = dayNum >= 1 && dayNum <= 31;
    const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
    const dayEvents = isCurrentMonth
      ? filteredEvents.filter((e) => e.startAt === dateStr)
      : [];

    return {
      dayNum: isCurrentMonth ? dayNum : (dayNum <= 0 ? 30 + dayNum : dayNum - 31),
      isCurrentMonth,
      dateStr,
      events: dayEvents,
    };
  });

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
            LỊCH CÔNG TÁC TOÀN TRƯỜNG
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch họp giao ban, thanh tra nội bộ, chuyên môn và hạn hoàn thành nhiệm vụ 3 khu trường
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Segmented Controls */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Tháng
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Danh sách ({filteredEvents.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo sự kiện</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Lọc loại sự kiện:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-xs"
          >
            <option value="all">Tất cả các loại lịch</option>
            <option value="Họp Ban Giám hiệu">Họp Ban Giám hiệu</option>
            <option value="Sinh hoạt chuyên môn">Sinh hoạt chuyên môn</option>
            <option value="Kiểm tra nội bộ">Kiểm tra nội bộ</option>
            <option value="Hoạt động giáo dục">Hoạt động giáo dục</option>
            <option value="Hạn hoàn thành nhiệm vụ">Hạn hoàn thành nhiệm vụ</option>
            <option value="Hoạt động chung 3 khu">Hoạt động chung 3 khu</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-blue-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" /> Họp BGH
          </span>
          <span className="flex items-center gap-1 text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Chuyên môn
          </span>
          <span className="flex items-center gap-1 text-amber-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" /> Kiểm tra
          </span>
          <span className="flex items-center gap-1 text-red-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-500" /> Hạn nhiệm vụ
          </span>
          <span className="flex items-center gap-1 text-purple-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" /> Chung 3 khu
          </span>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center font-semibold text-xs py-2 text-slate-600">
            <div>Thứ Hai</div>
            <div>Thứ Ba</div>
            <div>Thứ Tư</div>
            <div>Thứ Năm</div>
            <div>Thứ Sáu</div>
            <div className="text-blue-700">Thứ Bảy</div>
            <div className="text-red-600">Chủ Nhật</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 text-xs">
            {calendarCells.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[105px] p-1.5 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-xs tabular-nums ${
                      cell.dayNum === 21 && cell.isCurrentMonth
                        ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'
                        : cell.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-300'
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                  {cell.events.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {cell.events.length} việc
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[70px]">
                  {cell.events.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate cursor-pointer hover:shadow-2xs transition-all ${getCategoryColor(
                        ev.category
                      )}`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Không có sự kiện nào theo bộ lọc.</div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="p-3.5 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(
                        ev.category
                      )}`}
                    >
                      {ev.category}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{ev.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {ev.startAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" /> Phụ trách: {ev.organizer}
                    </span>
                  </div>
                </div>

                <button className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold text-slate-700 transition-colors">
                  Chi tiết
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Selected Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Chi tiết sự kiện lịch</span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(
                    selectedEvent.category
                  )}`}
                >
                  {selectedEvent.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">
                  {selectedEvent.title}
                </h3>
              </div>

              <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thời gian: {selectedEvent.startAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Địa điểm: {selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chủ trì / Phụ trách: {selectedEvent.organizer}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Nội dung chi tiết:</span>
                <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                  {selectedEvent.description || 'Không có mô tả bổ sung.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              {!selectedEvent.id.startsWith('task-deadline-') ? (
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hủy sự kiện</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-500">Đồng bộ từ Quản lý nhiệm vụ</div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-[#142B4A] text-white flex items-center justify-between">
              <span className="font-bold text-sm">Thêm sự kiện lịch công tác mới</span>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên sự kiện / Buổi họp *</label>
                <input
                  type="text"
                  placeholder="VD: Họp giao ban BGH và Tổ trưởng chuyên môn..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ngày diễn ra *</label>
                  <input
                    type="date"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Loại lịch</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="Họp Ban Giám hiệu">Họp Ban Giám hiệu</option>
                    <option value="Sinh hoạt chuyên môn">Sinh hoạt chuyên môn</option>
                    <option value="Kiểm tra nội bộ">Kiểm tra nội bộ</option>
                    <option value="Hoạt động giáo dục">Hoạt động giáo dục</option>
                    <option value="Hoạt động chung 3 khu">Hoạt động chung 3 khu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Khu trường</label>
                  <select
                    value={campusId}
                    onChange={(e) => setCampusId(e.target.value as CampusId)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white"
                  >
                    <option value="all">Toàn trường (3 Khu)</option>
                    {CAMPUSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa điểm</label>
                  <input
                    type="text"
                    placeholder="VD: Phòng họp Hội đồng Khu 1..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả / Yêu cầu chuẩn bị</label>
                <textarea
                  rows={3}
                  placeholder="Thành phần tham dự, tài liệu cần chuẩn bị..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Thêm sự kiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
