import React, { useState } from 'react';
import { X, CheckSquare, ShieldCheck, AlertCircle, Search, User, AlertTriangle, Users } from 'lucide-react';
import { Task, TaskCategory, TaskPriority, CampusId, CurrentUser, Staff } from '../../types';
import { CAMPUSES } from '../../data/initialData';
import { dataService } from '../../services/dataService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentUser: CurrentUser;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Công tác chuyên môn');
  const [campusId, setCampusId] = useState<CampusId>('all');
  const [assignee, setAssignee] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [assigneeRole, setAssigneeRole] = useState('Giáo viên / Nhân viên');
  const [selectedStaffWarning, setSelectedStaffWarning] = useState<string | null>(null);
  const [assigneeSearchOpen, setAssigneeSearchOpen] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');

  // Collaborators
  const [collaborators, setCollaborators] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [collabSearchOpen, setCollabSearchOpen] = useState(false);
  const [collabSearchQuery, setCollabSearchQuery] = useState('');

  const staffList = dataService.getStaffList();
  const campuses = dataService.getCampuses();
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<TaskPriority>('Trung bình');
  const [completionCriteria, setCompletionCriteria] = useState('');
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

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

  const handleSubmit = (status: Task['status'] = 'Chưa thực hiện') => {
    if (!title.trim()) {
      setError('Vui lòng nhập tên nhiệm vụ.');
      return;
    }
    if (!assignee.trim()) {
      setError('Vui lòng chỉ định người phụ trách.');
      return;
    }

    const campusObj = campuses.find((c) => c.id === campusId);
    const campusName = campusId === 'all' ? 'Toàn trường (Cả các cơ sở)' : (campusObj ? campusObj.name : 'Toàn trường');

    onSaveTask({
      taskCode: '',
      title,
      description,
      category,
      campusId,
      campusName,
      assignee,
      assigneeId,
      assigneeRole,
      creator: `${currentUser.name} (${currentUser.roleTitle.split(' - ')[0]})`,
      collaborators,
      collaboratorIds,
      dueDate,
      priority,
      status,
      progress: 0,
      completionCriteria: completionCriteria || 'Nộp sản phẩm và minh chứng theo quy định.',
      evidenceRequired,
      evidenceIds: [],
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#142B4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="font-bold text-sm">Giao nhiệm vụ mới</h2>
              <p className="text-[11px] text-slate-300">
                Khởi tạo nhiệm vụ và phân bổ tới 3 khu trường
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên nhiệm vụ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Kiểm tra chuyên đề nề nếp bán trú Khu 2..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category & Campus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nhóm công việc <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Khu trường áp dụng <span className="text-red-500">*</span>
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value as CampusId)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="all">Toàn trường (Cả 3 khu trường)</option>
                {CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Collaborators Integration with Staff Database */}
          <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Người phụ trách chính */}
              <div className="relative">
                <label className="block font-semibold text-slate-700 mb-1">
                  Người phụ trách chính <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm theo tên giáo viên từ CSDL..."
                    value={assigneeSearchOpen ? assigneeSearchQuery : assignee}
                    onFocus={() => {
                      setAssigneeSearchOpen(true);
                      setAssigneeSearchQuery('');
                    }}
                    onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white font-semibold text-slate-800"
                  />
                  {assignee && !assigneeSearchOpen && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeSearchOpen(true);
                        setAssigneeSearchQuery('');
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Đổi người
                    </button>
                  )}
                </div>

                {/* Dropdown gợi ý trực tiếp từ danh sách nhân sự */}
                {assigneeSearchOpen && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {staffList
                      .filter((s) => s.fullName.toLowerCase().includes(assigneeSearchQuery.toLowerCase()) || (s.teachingSubject && s.teachingSubject.toLowerCase().includes(assigneeSearchQuery.toLowerCase())))
                      .slice(0, 15)
                      .map((staff) => {
                        const isRetired = staff.status === 'Đã nghỉ hưu' || staff.status === 'Nghỉ việc';
                        return (
                          <div
                            key={staff.id}
                            onClick={() => {
                              if (isRetired) {
                                setSelectedStaffWarning(`Cảnh báo: Giáo viên ${staff.fullName} có trạng thái "${staff.status}". Hệ thống không khuyến khích giao nhiệm vụ mới!`);
                              } else {
                                setSelectedStaffWarning(null);
                              }
                              setAssignee(staff.fullName);
                              setAssigneeId(staff.id);
                              setAssigneeRole(`${staff.jobPosition}${staff.positionGroup ? ' - ' + staff.positionGroup : ''} (${staff.campusName})`);
                              setAssigneeSearchOpen(false);
                              setError('');
                            }}
                            className={`p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors ${
                              isRetired ? 'bg-amber-50/50' : ''
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>{staff.fullName}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  staff.status === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {staff.status}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {staff.jobPosition} • Môn: {staff.teachingSubject || 'Văn phòng'} • {staff.campusName}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Chức vụ / Đơn vị phụ trách tự động điền */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chức vụ & Đơn vị phụ trách
                </label>
                <input
                  type="text"
                  placeholder="Tự động cập nhật từ hồ sơ..."
                  value={assigneeRole}
                  onChange={(e) => setAssigneeRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
                />
              </div>
            </div>

            {/* Cảnh báo khi người được chọn đã nghỉ hưu */}
            {selectedStaffWarning && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{selectedStaffWarning}</span>
              </div>
            )}

            {/* Phối hợp thực hiện (nhiều giáo viên) */}
            <div className="relative">
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Cán bộ / Giáo viên phối hợp</span>
                <span className="text-[10px] text-slate-400 font-normal">Có thể chọn nhiều người từ CSDL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Chọn từ danh sách giáo viên..."
                  value={collaborators}
                  onChange={(e) => setCollaborators(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setCollabSearchOpen(!collabSearchOpen)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg shrink-0 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Chọn</span>
                </button>
              </div>

              {collabSearchOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100 p-2">
                  <div className="p-1 mb-1 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="Lọc tên giáo viên phối hợp..."
                      value={collabSearchQuery}
                      onChange={(e) => setCollabSearchQuery(e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  {staffList
                    .filter((s) => s.fullName.toLowerCase().includes(collabSearchQuery.toLowerCase()))
                    .slice(0, 10)
                    .map((s) => {
                      const isSelected = (collaboratorIds || []).includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            if (isSelected) {
                              setCollaboratorIds(collaboratorIds.filter((id) => id !== s.id));
                              const currentNames = collaborators.split(', ').filter((n) => n !== s.fullName);
                              setCollaborators(currentNames.join(', '));
                            } else {
                              setCollaboratorIds([...collaboratorIds, s.id]);
                              const currentNames = collaborators ? collaborators + ', ' + s.fullName : s.fullName;
                              setCollaborators(currentNames);
                            }
                          }}
                          className={`p-2 hover:bg-slate-100 cursor-pointer flex items-center justify-between rounded ${
                            isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>{s.fullName} ({s.campusName})</div>
                            <div className="text-[10px] text-slate-400">{s.jobPosition} • {s.teachingSubject || 'Văn phòng'}</div>
                          </div>
                          {isSelected && <span className="text-blue-600 text-xs">✓ Đã chọn</span>}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn hoàn thành <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Cao">Cao (Khẩn cấp, có hạn định nghiêm ngặt)</option>
                <option value="Trung bình">Trung bình (Theo kế hoạch thường kỳ)</option>
                <option value="Thấp">Thấp (Nhiệm vụ dài hạn / phụ trợ)</option>
              </select>
            </div>
          </div>

          {/* Description & Requirements */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung yêu cầu chi tiết
            </label>
            <textarea
              rows={3}
              placeholder="Mô tả mục tiêu, yêu cầu triển khai, địa điểm và kết quả cần đạt..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Completion Criteria & Evidence Requirement */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tiêu chí nghiệm thu hoàn thành
              </label>
              <input
                type="text"
                placeholder="VD: Biên bản nghiệm thu có chữ ký BGH và ảnh minh chứng..."
                value={completionCriteria}
                onChange={(e) => setCompletionCriteria(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={evidenceRequired}
                onChange={(e) => setEvidenceRequired(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Bắt buộc nộp hồ sơ minh chứng trước khi nghiệm thu hoàn thành
              </span>
            </label>
          </div>

          {/* Collaborators & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lực lượng phối hợp thực hiện
              </label>
              <input
                type="text"
                placeholder="VD: Ban đại diện CMHS, Đoàn Thanh niên..."
                value={collaborators}
                onChange={(e) => setCollaborators(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
              <input
                type="text"
                placeholder="Ghi chú thêm cho người phụ trách..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-xs rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('Chưa thực hiện')}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg transition-colors"
            >
              Lưu bản nháp
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('Đang thực hiện')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
            >
              Giao nhiệm vụ ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
