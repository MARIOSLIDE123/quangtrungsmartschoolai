import React, { useState } from 'react';
import {
  X,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building2,
  Calendar,
  Sparkles,
  Upload,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Task, CurrentUser, Evidence } from '../../types';
import { dataService } from '../../services/dataService';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  onUpdateTask: (updated: Task) => void;
  onOpenUploadEvidence: (task: Task) => void;
  onOpenAiAssistantWithTask: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  currentUser,
  onUpdateTask,
  onOpenUploadEvidence,
  onOpenAiAssistantWithTask,
}) => {
  if (!isOpen || !task) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'progress' | 'evidence' | 'logs'>('info');
  const [progressVal, setProgressVal] = useState(task.progress);
  const [progressNotes, setProgressNotes] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isBGH = currentUser.role === 'hieu_truong' || currentUser.role === 'pho_hieu_truong';
  const evidences = dataService.getEvidences().filter((e) => e.taskId === task.id || (task.evidenceIds || []).includes(e.id));
  const activityLogs = dataService.getActivityLogs().filter((l) => l.entityId === task.id);

  const handleSaveProgress = () => {
    let nextStatus = task.status;
    if (progressVal === 100) {
      if (isBGH) {
        nextStatus = 'Hoàn thành';
      } else {
        nextStatus = 'Chờ kiểm tra';
      }
    } else if (progressVal > 0 && task.status === 'Chưa thực hiện') {
      nextStatus = 'Đang thực hiện';
    }

    const updated = dataService.updateTask(
      task.id,
      {
        progress: progressVal,
        status: nextStatus,
        notes: progressNotes ? `${task.notes ? task.notes + ' | ' : ''}${progressNotes}` : task.notes,
      },
      currentUser
    );

    if (updated) {
      onUpdateTask(updated);
      setMessage({
        text: `Đã cập nhật tiến độ ${progressVal}% thành công! ${
          progressVal === 100 && !isBGH ? 'Nhiệm vụ chuyển sang trạng thái "Chờ kiểm tra" để BGH phê duyệt.' : ''
        }`,
        type: 'success',
      });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleApprove = () => {
    if (!isBGH) {
      setMessage({
        text: 'Chỉ Ban Giám hiệu mới có thẩm quyền ký duyệt hoàn thành nhiệm vụ.',
        type: 'error',
      });
      return;
    }

    const updated = dataService.approveTask(task.id, approvalComment, currentUser);
    if (updated) {
      onUpdateTask(updated);
      setProgressVal(100);
      setMessage({
        text: `Ban Giám hiệu đã phê duyệt hoàn thành nhiệm vụ [${task.taskCode}] thành công!`,
        type: 'success',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Header */}
        <div className="px-5 py-4 bg-[#142B4A] text-white flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {task.taskCode}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {task.campusName}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  task.status === 'Hoàn thành'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : task.status === 'Quá hạn'
                    ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                    : task.status === 'Chờ kiểm tra'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}
              >
                {task.status}
              </span>
            </div>
            <h2 className="font-bold text-base text-white leading-tight mt-1">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Thông tin chi tiết
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cập nhật tiến độ ({task.progress}%)
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'evidence'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Hồ sơ minh chứng ({evidences.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhật ký & Lịch sử ({activityLogs.length})
          </button>
        </div>

        {/* Status / Alert Feedback Message */}
        {message && (
          <div
            className={`mx-5 mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Core Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Người phụ trách
                  </span>
                  <div className="font-bold text-slate-800 mt-0.5">{task.assignee}</div>
                  <div className="text-[10px] text-slate-500">{task.assigneeRole}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Người giao việc
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">{task.creator}</div>
                  <div className="text-[10px] text-slate-500">Ban Giám hiệu</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Hạn hoàn thành
                  </span>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {task.dueDate}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Giao: {task.createdAt}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Mức độ ưu tiên
                  </span>
                  <span
                    className={`inline-block mt-0.5 font-bold px-2 py-0.5 rounded text-[10px] ${
                      task.priority === 'Cao'
                        ? 'bg-red-100 text-red-700'
                        : task.priority === 'Trung bình'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Yêu cầu nội dung chi tiết</h4>
                <p className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {task.description || 'Không có mô tả chi tiết.'}
                </p>
              </div>

              {/* Completion Criteria */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">
                  Tiêu chí nghiệm thu & yêu cầu minh chứng
                </h4>
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/60 text-slate-800 space-y-1">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{task.completionCriteria}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-6">
                    Yêu cầu minh chứng: {task.evidenceRequired ? 'BẮT BUỘC có biên bản/ảnh nghiệm thu' : 'Không bắt buộc'}
                  </div>
                </div>
              </div>

              {/* Collaborators & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1">Lực lượng phối hợp</h4>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    {task.collaborators || 'Tự chủ thực hiện'}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 mb-1">Ghi chú điều hành</h4>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                    {task.notes || 'Chưa có ghi chú phát sinh.'}
                  </div>
                </div>
              </div>

              {/* Approval Info (if approved) */}
              {task.approvedBy && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900">
                        Đã được phê duyệt hoàn thành bởi {task.approvedBy}
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        Nhận xét: "{task.reviewComment || 'Đạt yêu cầu chất lượng'}" · {task.approvedAt}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-800">
                    Mức độ hoàn thành hiện tại:
                  </label>
                  <span className="text-lg font-bold text-blue-600 tabular-nums">
                    {progressVal}%
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressVal}
                  onChange={(e) => setProgressVal(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Chưa bắt đầu)</span>
                  <span>50% (Đang triển khai)</span>
                  <span>100% (Sẵn sàng nghiệm thu)</span>
                </div>
              </div>

              {/* Notes / Difficulties */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhật ký cập nhật nội dung đã làm & khó khăn phát sinh
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi rõ các đầu việc đã hoàn tất, khó khăn cần Ban Giám hiệu hỗ trợ tháo gỡ..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Save Progress Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProgress}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Lưu mốc tiến độ
                </button>
              </div>

              {/* Approval Workflow Box (Section 5.4) */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Quy trình thẩm định và phê duyệt hoàn thành</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Luồng: <strong>Giao nhiệm vụ → Thực hiện → Nộp minh chứng → Chờ kiểm tra → BGH phê duyệt</strong>.
                  {!isBGH && (
                    <span className="block mt-1 text-slate-600 italic">
                      (Bạn đang ở vai trò {currentUser.roleTitle}. Chỉ Ban Giám hiệu mới có quyền ký duyệt.)
                    </span>
                  )}
                </p>

                {task.status !== 'Hoàn thành' && (
                  <div className="space-y-2 pt-2 border-t border-purple-200">
                    <label className="block font-semibold text-purple-900 text-xs">
                      Nhận xét của người kiểm tra (Dành cho Ban Giám hiệu):
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Đã kiểm tra hồ sơ, minh chứng đầy đủ đạt yêu cầu..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      disabled={!isBGH}
                      className="w-full px-3 py-1.5 border border-purple-300 rounded-lg focus:outline-none bg-white disabled:bg-slate-100"
                    />

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={!isBGH}
                        className={`px-4 py-2 rounded-lg font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                          isBGH
                            ? 'bg-purple-700 hover:bg-purple-800 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ban Giám hiệu xác nhận hoàn thành</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800">
                    Danh sách minh chứng đính kèm ({evidences.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Hồ sơ biên bản, hình ảnh phục vụ kiểm định chất lượng
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenUploadEvidence(task)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Nộp minh chứng mới</span>
                </button>
              </div>

              {evidences.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
                  <div className="font-semibold text-slate-700">Chưa có minh chứng nào</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Nhiệm vụ này yêu cầu biên bản hoặc ảnh thực tế để Ban Giám hiệu kiểm duyệt. Hãy bấm "Nộp minh chứng mới".
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {evidences.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{ev.title}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-blue-600">{ev.evidenceCode}</span>
                            <span>·</span>
                            <span>{ev.fileName}</span>
                            <span>·</span>
                            <span>{ev.fileSize}</span>
                            <span>·</span>
                            <span>Đăng bởi: {ev.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.reviewStatus === 'Đạt yêu cầu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ev.reviewStatus === 'Cần bổ sung'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ev.reviewStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Nhật ký hoạt động nhiệm vụ</h4>
              {activityLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">Chưa có lịch sử thay đổi bổ sung.</div>
              ) : (
                <div className="space-y-2 border-l-2 border-blue-200 pl-3 ml-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="relative pb-2">
                      <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold text-slate-800">{log.action}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                      <div className="text-[10px] text-slate-400">
                        Thực hiện bởi: {log.actor} ({log.actorRole})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with AI Support Quick Action */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAiAssistantWithTask(task);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Đề xuất nội dung đôn đốc</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs rounded-lg transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
