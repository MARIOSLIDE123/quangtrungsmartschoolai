import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  Eye,
  Edit,
  Building2,
  GraduationCap,
  Briefcase,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Staff, CurrentUser, Task } from '../../types';
import { dataService } from '../../services/dataService';
import { exportStaffToExcel } from '../../services/excelService';
import { StaffImport } from './StaffImport';
import { StaffDetailModal } from '../modals/StaffDetailModal';

interface StaffManagerProps {
  currentUser: CurrentUser;
  onOpenTaskDetail?: (task: Task) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  currentUser,
  onOpenTaskDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'stats' | 'campuses' | 'history'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampus, setFilterCampus] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterQualification, setFilterQualification] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'campus' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected staff for detail modal
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // New campus creation state
  const [newCampusName, setNewCampusName] = useState('');
  const [newCampusCode, setNewCampusCode] = useState('');
  const [newCampusManager, setNewCampusManager] = useState('');
  const [newCampusAddress, setNewCampusAddress] = useState('');

  const isBGH = currentUser.role === 'hieu_truong' || currentUser.role === 'pho_hieu_truong';
  const staffList = dataService.getStaffList();
  const campuses = dataService.getCampuses();
  const metrics = dataService.getStaffMetrics(filterCampus);
  const allHistory = dataService.getStaffHistory();

  // Danh sách các bộ lọc duy nhất
  const uniqueCampuses = Array.from(new Set(staffList.map((s) => s.campusName).filter(Boolean)));
  const uniquePositions = Array.from(new Set(staffList.map((s) => s.jobPosition).filter(Boolean)));
  const uniqueSubjects = Array.from(new Set(staffList.map((s) => s.teachingSubject).filter(Boolean)));
  const uniqueQualifications = Array.from(new Set(staffList.map((s) => s.qualification).filter(Boolean)));

  // Lọc danh sách
  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.moetCode.includes(searchTerm) ||
      s.phone.includes(searchTerm) ||
      s.teachingSubject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCampus = filterCampus === 'all' || s.campusName.includes(filterCampus);
    const matchPosition = filterPosition === 'all' || s.jobPosition === filterPosition;
    const matchSubject = filterSubject === 'all' || s.teachingSubject === filterSubject;
    const matchQualification = filterQualification === 'all' || s.qualification === filterQualification;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchSearch && matchCampus && matchPosition && matchSubject && matchQualification && matchStatus;
  });

  // Sắp xếp
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = a.fullName.split(' ').slice(-1)[0] || '';
      const nameB = b.fullName.split(' ').slice(-1)[0] || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB, 'vi') : nameB.localeCompare(nameA, 'vi');
    }
    if (sortBy === 'campus') {
      return sortOrder === 'asc' ? a.campusName.localeCompare(b.campusName, 'vi') : b.campusName.localeCompare(a.campusName, 'vi');
    }
    return sortOrder === 'asc' ? a.status.localeCompare(b.status, 'vi') : b.status.localeCompare(a.status, 'vi');
  });

  // Phân trang
  const totalPages = Math.ceil(sortedStaff.length / pageSize) || 1;
  const paginatedStaff = sortedStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportExcel = () => {
    exportStaffToExcel(sortedStaff, `Danh_sach_nhan_su_loc_${Date.now()}.xlsx`);
  };

  const handleAddCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusName.trim()) return;

    const newId = `campus-${Date.now()}`;
    dataService.saveCampus(
      {
        id: newId,
        code: newCampusCode || `KHU-0${campuses.length + 1}`,
        name: newCampusName.trim(),
        shortName: newCampusName.trim(),
        address: newCampusAddress || 'Đang cập nhật địa chỉ',
        manager: newCampusManager || 'Ban Giám hiệu điều hành',
        managerTitle: 'Phụ trách cơ sở',
        phone: '024.3824.9999',
        classesCount: 10,
        studentsCount: 350,
        teachersCount: 18,
        description: 'Điểm trường mở rộng của Trường Tiểu học Quang Trung',
        color: '#6366F1',
      },
      currentUser
    );

    setNewCampusName('');
    setNewCampusCode('');
    setNewCampusManager('');
    setNewCampusAddress('');
    alert('Đã bổ sung phân hiệu mới vào danh mục quản lý!');
  };

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)] text-xs">
      {/* Title & Navigation Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#142B4A] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>QUẢN LÝ HỒ SƠ NHÂN SỰ – GIÁO VIÊN</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tập trung thông tin cán bộ quản lý, giáo viên và nhân viên trên toàn trường.
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Danh sách nhân sự ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'import' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nhập Excel</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'stats' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thống kê nhân sự
          </button>
          <button
            onClick={() => setActiveTab('campuses')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'campuses' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quản lý phân hiệu ({campuses.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch sử cập nhật
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. MÀN HÌNH NHẬP DỮ LIỆU EXCEL */}
      {/* ===================================================================== */}
      {activeTab === 'import' && (
        <StaffImport
          currentUser={currentUser}
          onImportSuccess={() => setActiveTab('list')}
          onCancel={() => setActiveTab('list')}
        />
      )}

      {/* ===================================================================== */}
      {/* 2. MÀN HÌNH DANH SÁCH NHÂN SỰ CHÍNH */}
      {/* ===================================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Tổng số nhân sự</span>
              <div className="text-2xl font-bold text-[#142B4A] mt-0.5">{metrics.total}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-blue-600 font-medium">Cán bộ quản lý</span>
              <div className="text-2xl font-bold text-blue-700 mt-0.5">{metrics.managers}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-emerald-600 font-medium">Giáo viên</span>
              <div className="text-2xl font-bold text-emerald-700 mt-0.5">{metrics.teachers}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-purple-600 font-medium">Nhân viên</span>
              <div className="text-2xl font-bold text-purple-700 mt-0.5">{metrics.employees}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-teal-600 font-medium">Đang làm việc</span>
              <div className="text-2xl font-bold text-teal-700 mt-0.5">{metrics.active}</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-amber-600 font-medium">Các trường hợp khác</span>
              <div className="text-2xl font-bold text-amber-700 mt-0.5">{metrics.retiredOrOthers}</div>
            </div>
          </div>

          {/* Search, Filter Toolbar & Export */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row gap-2.5 justify-between items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nhanh theo họ tên, môn dạy, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất Excel theo bộ lọc</span>
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nhập thêm Excel</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-100 text-[11px]">
              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Phân hiệu:</label>
                <select
                  value={filterCampus}
                  onChange={(e) => {
                    setFilterCampus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Tất cả phân hiệu ({uniqueCampuses.length})</option>
                  {uniqueCampuses.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Vị trí việc làm:</label>
                <select
                  value={filterPosition}
                  onChange={(e) => {
                    setFilterPosition(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Tất cả vị trí</option>
                  {uniquePositions.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Môn dạy:</label>
                <select
                  value={filterSubject}
                  onChange={(e) => {
                    setFilterSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Tất cả môn dạy</option>
                  {uniqueSubjects.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Trình độ:</label>
                <select
                  value={filterQualification}
                  onChange={(e) => {
                    setFilterQualification(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Tất cả trình độ</option>
                  {uniqueQualifications.map((q, i) => (
                    <option key={i} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5 font-medium">Trạng thái:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Chuyển đến">Chuyển đến</option>
                  <option value="Đã nghỉ hưu">Đã nghỉ hưu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Staff Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#142B4A] text-white font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">STT</th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-white/10"
                      onClick={() => {
                        setSortBy('name');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Họ và tên</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">Vị trí việc làm</th>
                    <th className="py-2.5 px-3">Nhóm chức vụ</th>
                    <th className="py-2.5 px-3">Môn dạy</th>
                    <th className="py-2.5 px-3">Trình độ chuyên môn</th>
                    <th
                      className="py-2.5 px-3 cursor-pointer select-none hover:bg-white/10"
                      onClick={() => {
                        setSortBy('campus');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Phân hiệu</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        Không tìm thấy hồ sơ giáo viên nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map((staff, idx) => (
                      <tr key={staff.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 text-slate-500 text-center font-mono text-[11px]">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          <button
                            onClick={() => setSelectedStaff(staff)}
                            className="hover:text-blue-600 text-left transition-colors font-bold"
                          >
                            {staff.fullName}
                          </button>
                          {staff.isWarning && (
                            <span className="block text-[10px] text-amber-700 font-normal">
                              ⚠ Cần xác nhận phân hiệu
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">{staff.jobPosition}</td>
                        <td className="py-2 px-3 text-slate-600">{staff.positionGroup || '---'}</td>
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {staff.teachingSubject ? (
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                              {staff.teachingSubject}
                            </span>
                          ) : (
                            '---'
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">{staff.qualification}</td>
                        <td className="py-2 px-3">
                          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold text-[11px]">
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
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedStaff(staff)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Hồ sơ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <div>
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedStaff.length)} trên tổng số <strong>{sortedStaff.length}</strong> hồ sơ
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="px-2 font-bold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MÀN HÌNH THỐNG KÊ NHÂN SỰ */}
      {/* ===================================================================== */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phân bổ theo phân hiệu */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Số lượng nhân sự theo phân hiệu / khu trường</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.campusMap).map(([campus, count], idx) => {
                  const pct = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{campus}</span>
                        <span className="font-bold text-blue-700">{count} CBGV ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cơ cấu chuyên môn / môn dạy */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Cơ cấu nhân sự theo môn dạy</span>
              </h3>
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {Object.entries(metrics.subjectMap).map(([subj, count], idx) => {
                  const pct = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{subj}</span>
                        <span className="font-bold text-emerald-700">{count} người ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trình độ chuyên môn nghiệp vụ */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <span>Trình độ đào tạo chuyên môn</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.qualificationMap).map(([q, count], idx) => {
                  const pct = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{q}</span>
                        <span className="font-bold text-purple-700">{count} người ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cơ cấu hợp đồng */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Hình thức hợp đồng lao động</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.contractMap).map(([ct, count], idx) => {
                  const pct = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{ct}</span>
                        <span className="font-bold text-amber-700">{count} người ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MÀN HÌNH QUẢN LÝ PHÂN HIỆU LINH HOẠT */}
      {/* ===================================================================== */}
      {activeTab === 'campuses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {campuses.map((c) => {
              const count = staffList.filter((s) => s.campusName.includes(c.name) || s.campusName.includes(c.shortName)).length;
              return (
                <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {c.code}
                    </span>
                    <span className="font-bold text-emerald-700 text-xs">{count} Cán bộ / Giáo viên</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.address}</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] space-y-1 text-slate-600">
                    <div><strong>Phụ trách:</strong> {c.manager} ({c.managerTitle})</div>
                    <div><strong>Điện thoại:</strong> {c.phone}</div>
                    <div><strong>Quy mô:</strong> {c.classesCount} lớp • {c.studentsCount} học sinh</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form thêm mới phân hiệu */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Bổ sung phân hiệu / khu trường mới vào danh mục quản lý</span>
            </h3>
            <form onSubmit={handleAddCampus} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Tên khu trường / Phân hiệu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Điểm trường Minh Cường"
                  value={newCampusName}
                  onChange={(e) => setNewCampusName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Mã khu trường:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: KHU-04"
                  value={newCampusCode}
                  onChange={(e) => setNewCampusCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Cán bộ phụ trách:</label>
                <input
                  type="text"
                  placeholder="Họ và tên cán bộ quản lý..."
                  value={newCampusManager}
                  onChange={(e) => setNewCampusManager(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">Địa chỉ:</label>
                <input
                  type="text"
                  placeholder="Địa chỉ điểm trường..."
                  value={newCampusAddress}
                  onChange={(e) => setNewCampusAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Lưu phân hiệu mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MÀN HÌNH LỊCH SỬ CẬP NHẬT BIẾN ĐỘNG HỒ SƠ */}
      {/* ===================================================================== */}
      {activeTab === 'history' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <span>Nhật ký biến động và cập nhật hồ sơ nhân sự ({allHistory.length})</span>
            </h3>
            <span className="text-[11px] text-slate-500">Tự động ghi nhận thời gian thực và người thực hiện</span>
          </div>

          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Giáo viên / Nhân viên</th>
                  <th className="py-2.5 px-3">Thông tin thay đổi</th>
                  <th className="py-2.5 px-3">Giá trị cũ</th>
                  <th className="py-2.5 px-3">Giá trị mới</th>
                  <th className="py-2.5 px-3">Người cập nhật</th>
                  <th className="py-2.5 px-3">Lý do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Chưa ghi nhận biến động hồ sơ nào. Mọi thay đổi về phân hiệu hoặc chức danh sẽ được lưu tại đây.
                    </td>
                  </tr>
                ) : (
                  allHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500 tabular-nums whitespace-nowrap">{h.timestamp}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{h.staffName}</td>
                      <td className="py-2 px-3 font-semibold text-blue-700">{h.changedField}</td>
                      <td className="py-2 px-3 text-slate-400 line-through">{h.oldValue}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{h.newValue}</td>
                      <td className="py-2 px-3 text-slate-700">{h.changedBy} ({h.changedRole})</td>
                      <td className="py-2 px-3 text-slate-600">{h.reason || 'Cập nhật hệ thống'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal chi tiết hồ sơ giáo viên */}
      {selectedStaff && (
        <StaffDetailModal
          staff={selectedStaff}
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          currentUser={currentUser}
          onUpdateStaff={(updated) => setSelectedStaff(updated)}
          onOpenTaskDetail={onOpenTaskDetail}
        />
      )}
    </div>
  );
};
