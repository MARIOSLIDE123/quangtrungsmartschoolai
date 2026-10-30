import React, { useState } from 'react';
import {
  X,
  User,
  Briefcase,
  GraduationCap,
  History,
  CheckCircle2,
  Calendar,
  Phone,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  Edit3,
  Save,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Staff, CurrentUser, Task } from '../../types';
import { dataService } from '../../services/dataService';

interface StaffDetailModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onUpdateStaff: (updated: Staff) => void;
  onOpenTaskDetail?: (task: Task) => void;
}

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  staff,
  isOpen,
  onClose,
  currentUser,
  onUpdateStaff,
  onOpenTaskDetail,
}) => {
  if (!isOpen || !staff) return null;

  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'qualification' | 'history'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Staff>({ ...staff });
  const [editReason, setEditReason] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isBGH = currentUser.role === 'hieu_truong' || currentUser.role === 'pho_hieu_truong';
  const historyList = dataService.getStaffHistory(staff.id);

  // Tìm các nhiệm vụ liên kết với giáo viên này
  const allTasks = dataService.getTasks();
  const assignedTasks = allTasks.filter(
    (t) => t.assignee === staff.fullName || t.assigneeId === staff.id || (t.collaboratorIds || []).includes(staff.id) || (t.collaborators && t.collaborators.includes(staff.fullName))
  );

  const completedTasks = assignedTasks.filter((t) => t.status === 'Hoàn thành');
  const inProgressTasks = assignedTasks.filter((t) => t.status === 'Đang thực hiện');

  // Xử lý lưu chỉnh sửa hồ sơ
  const handleSave = () => {
    try {
      const updated = dataService.saveStaff(formData, currentUser, editReason || 'Cập nhật từ màn hình chi tiết');
      onUpdateStaff(updated);
      setIsEditing(false);
      setMessage({ text: 'Đã lưu thay đổi hồ sơ nhân sự thành công!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: 'Lỗi lưu hồ sơ: ' + err.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 text-xs flex flex-col max-h-[90vh]">
        {/* Header Hồ Sơ */}
        <div className="p-5 bg-[#142B4A] text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 border-2 border-white/20 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {staff.fullName.split(' ').slice(-1)[0][0]}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-white tracking-wide">{staff.fullName}</h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  staff.status === 'Đang làm việc' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                  staff.status === 'Đã nghỉ hưu' ? 'bg-slate-500/20 text-slate-300 border border-slate-400/30' : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {staff.status}
                </span>
                {staff.isWarning && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded text-[10px] font-medium">
                    Cần xác nhận phân hiệu
                  </span>
                )}
              </div>
              <div className="text-slate-300 text-xs flex items-center gap-3">
                <span>{staff.jobPosition}</span>
                {staff.positionGroup && <span>• {staff.positionGroup}</span>}
                <span>• {staff.campusName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBGH && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'personal' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Thông tin cá nhân</span>
          </button>
          <button
            onClick={() => setActiveTab('job')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'job' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>2. Thông tin công tác</span>
          </button>
          <button
            onClick={() => setActiveTab('qualification')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'qualification' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>3. Trình độ & Chuyên môn</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>4. Nhiệm vụ & Lịch sử ({assignedTasks.length})</span>
          </button>
        </div>

        {/* Thông báo cập nhật */}
        {message && (
          <div className={`p-3 mx-5 mt-4 rounded-xl flex items-center gap-2 border ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Nội dung Tab */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Mã định danh Bộ GD&ĐT:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.moetCode}
                    onChange={(e) => setFormData({ ...formData, moetCode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700 bg-white"
                  />
                ) : (
                  <div className="font-mono font-bold text-sm text-blue-700">
                    {isBGH ? staff.moetCode : (staff.moetCode ? staff.moetCode.slice(0, 3) + '****' + staff.moetCode.slice(-3) : '---')}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Họ và tên:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-800 bg-white"
                  />
                ) : (
                  <div className="font-bold text-sm text-slate-800">{staff.fullName}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Ngày tháng năm sinh:</span>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-medium text-slate-800">
                    {isBGH ? staff.birthDate : '**/**/' + staff.birthDate.split('/').slice(-1)[0]}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Giới tính:</span>
                {isEditing ? (
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Nữ">Nữ</option>
                    <option value="Nam">Nam</option>
                  </select>
                ) : (
                  <div className="font-medium text-slate-800">{staff.gender}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Dân tộc:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.ethnicity}
                    onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-medium text-slate-800">{isBGH ? staff.ethnicity : 'Được bảo vệ'}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Số điện thoại liên hệ:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-white"
                  />
                ) : (
                  <div className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isBGH ? staff.phone : (staff.phone ? staff.phone.slice(0, 3) + '*****' + staff.phone.slice(-3) : '---')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THÔNG TIN CÔNG TÁC */}
          {activeTab === 'job' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Vị trí việc làm:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.jobPosition}
                    onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-bold text-slate-800">{staff.jobPosition}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Nhóm chức vụ:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.positionGroup}
                    onChange={(e) => setFormData({ ...formData, positionGroup: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-medium text-slate-800">{staff.positionGroup || 'Không kiêm nhiệm'}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Hình thức hợp đồng:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-medium text-slate-800">{staff.contractType}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Phân hiệu / Khu trường công tác:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.campusName}
                    onChange={(e) => setFormData({ ...formData, campusName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-bold text-blue-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{staff.campusName}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 col-span-2">
                <span className="text-[11px] text-slate-500 font-medium">Trạng thái công tác:</span>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Đang làm việc">Đang làm việc</option>
                    <option value="Chuyển đến">Chuyển đến</option>
                    <option value="Đã nghỉ hưu">Đã nghỉ hưu</option>
                    <option value="Chuyển đi">Chuyển đi</option>
                    <option value="Nghỉ việc">Nghỉ việc</option>
                  </select>
                ) : (
                  <div className="font-semibold text-slate-800">{staff.status}</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRÌNH ĐỘ VÀ CHUYÊN MÔN */}
          {activeTab === 'qualification' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Trình độ chuyên môn nghiệp vụ:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-bold text-slate-800">{staff.qualification}</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] text-slate-500 font-medium">Môn giảng dạy chính:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.teachingSubject}
                    onChange={(e) => setFormData({ ...formData, teachingSubject: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                ) : (
                  <div className="font-bold text-emerald-700">{staff.teachingSubject || 'Không tham gia giảng dạy'}</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LỊCH SỬ HOẠT ĐỘNG & NHIỆM VỤ */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Thống kê nhanh nhiệm vụ */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center">
                  <div className="text-[11px] text-blue-700">Tổng nhiệm vụ liên quan</div>
                  <div className="text-lg font-bold text-blue-900">{assignedTasks.length}</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="text-[11px] text-emerald-700">Đã hoàn thành</div>
                  <div className="text-lg font-bold text-emerald-900">{completedTasks.length}</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <div className="text-[11px] text-amber-700">Đang triển khai</div>
                  <div className="text-lg font-bold text-amber-900">{inProgressTasks.length}</div>
                </div>
              </div>

              {/* Danh sách nhiệm vụ phụ trách */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Danh sách nhiệm vụ giao trực tiếp:
                </div>
                {assignedTasks.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                    Chưa có nhiệm vụ nào được phân công cho cán bộ này trên hệ thống.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {assignedTasks.map((t) => (
                      <div key={t.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-700">{t.taskCode}</span>
                            <span className="font-semibold text-slate-800">{t.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3">
                            <span>Hạn: {t.dueDate}</span>
                            <span>• Tiến độ: {t.progress}%</span>
                            <span>• {t.campusName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'Quá hạn' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {t.status}
                          </span>
                          {onOpenTaskDetail && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenTaskDetail(t);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600"
                              title="Xem chi tiết nhiệm vụ"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lịch sử cập nhật hồ sơ */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                  Nhật ký biến động hồ sơ ({historyList.length}):
                </div>
                {historyList.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px]">
                    Hồ sơ được nhập từ file dữ liệu gốc, chưa ghi nhận thay đổi thủ công.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {historyList.map((h) => (
                      <div key={h.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
                        <div className="flex justify-between items-center text-slate-500">
                          <span className="font-medium text-slate-700">{h.changedField}</span>
                          <span className="tabular-nums">{h.timestamp}</span>
                        </div>
                        <div className="text-slate-800">
                          <span className="line-through text-slate-400 mr-2">{h.oldValue}</span>
                          <span className="font-semibold text-emerald-700">→ {h.newValue}</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Người thực hiện: {h.changedBy} ({h.changedRole}) - Lý do: {h.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ô nhập lý do khi đang ở chế độ chỉnh sửa */}
          {isEditing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="block font-semibold text-amber-900 text-[11px]">
                Lý do cập nhật hồ sơ (được lưu vào nhật ký kiểm toán hệ thống):
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Điều chuyển cơ sở theo Quyết định số 12/QĐ-BGH..."
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full p-2 border border-amber-300 rounded-lg bg-white text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-[11px] text-slate-500">
            Mã định danh nội bộ: <code className="font-mono text-slate-700 font-bold">{staff.id}</code>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Hủy chỉnh sửa
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
              >
                Đóng hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
