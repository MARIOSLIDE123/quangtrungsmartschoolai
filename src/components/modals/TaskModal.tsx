import React, { useState } from 'react';
import { X, CheckSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { Task, TaskCategory, TaskPriority, CampusId, CurrentUser } from '../../types';
import { CAMPUSES } from '../../data/initialData';

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
  const [assigneeRole, setAssigneeRole] = useState('Giáo viên / Nhân viên');
  const [collaborators, setCollaborators] = useState('');
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

    const campusObj = CAMPUSES.find((c) => c.id === campusId);
    const campusName = campusId === 'all' ? 'Toàn trường (3 Khu)' : (campusObj ? campusObj.name : 'Toàn trường');

    onSaveTask({
      taskCode: '',
      title,
      description,
      category,
      campusId,
      campusName,
      assignee,
      assigneeRole,
      creator: `${currentUser.name} (${currentUser.roleTitle.split(' - ')[0]})`,
      collaborators,
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

          {/* Assignee & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Người phụ trách chính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Cô Vũ Thanh Huyền..."
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Chức vụ / Đơn vị phụ trách
              </label>
              <input
                type="text"
                placeholder="VD: Tổ trưởng Chuyên môn Khối 4..."
                value={assigneeRole}
                onChange={(e) => setAssigneeRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
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
