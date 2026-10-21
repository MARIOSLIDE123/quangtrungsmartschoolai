import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertOctagon,
  Clock,
  X,
  FileCheck2,
} from 'lucide-react';
import { NavScreenId } from '../layout/Sidebar';
import { Task } from '../../types';
import { dataService } from '../../services/dataService';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateScreen: (screen: NavScreenId) => void;
  onSelectTask: (task: Task) => void;
  onOpenAiWithTask: (task: Task) => void;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onNavigateScreen,
  onSelectTask,
  onOpenAiWithTask,
}) => {
  if (!isOpen) return null;

  const [activeStep, setActiveStep] = useState(1);

  const tasks = dataService.getTasks();
  const overdueTask = tasks.find((t) => t.status === 'Quá hạn') || tasks[0];

  const steps = [
    {
      step: 1,
      title: 'Bước 1: Mở Dashboard & Xem tổng quan 3 khu trường',
      desc: 'Nắm bắt tức thì 5 thẻ KPI động, biểu đồ so sánh 3 khu trường và tỷ lệ hoàn thành toàn trường mà không phải lật mở nhiều trang.',
      targetScreen: 'overview' as NavScreenId,
      actionBtnText: 'Mở Tổng quan điều hành',
      execute: () => {
        onNavigateScreen('overview');
        onClose();
      },
    },
    {
      step: 2,
      title: 'Bước 2: Phát hiện nhiệm vụ quá hạn / thiếu minh chứng',
      desc: `Tại bảng "Công việc cần chú ý", hệ thống cảnh báo đỏ nhiệm vụ [${overdueTask.taskCode}] "${overdueTask.title}" do ${overdueTask.assignee} phụ trách đã quá hạn xử lý và chưa có minh chứng.`,
      targetScreen: 'tasks' as NavScreenId,
      actionBtnText: 'Chuyển sang Quản lý nhiệm vụ',
      execute: () => {
        onNavigateScreen('tasks');
        onClose();
      },
    },
    {
      step: 3,
      title: 'Bước 3: Mở chi tiết nhiệm vụ & Kiểm tra người phụ trách',
      desc: 'Bấm vào nhiệm vụ để xem thông tin chi tiết, lực lượng phối hợp, mốc tiến độ hiện tại và tiêu chí nghiệm thu.',
      targetScreen: 'tasks' as NavScreenId,
      actionBtnText: 'Mở cửa sổ chi tiết nhiệm vụ mẫu',
      execute: () => {
        onSelectTask(overdueTask);
        onClose();
      },
    },
    {
      step: 4,
      title: 'Bước 4: Sử dụng Trợ lý AI dự thảo văn bản đôn đốc',
      desc: 'Mở Trợ lý SmartSchool AI, nạp nhiệm vụ quá hạn vào biểu mẫu để AI tạo thông báo đôn đốc chuẩn thể thức hành chính giáo dục.',
      targetScreen: 'ai-assistant' as NavScreenId,
      actionBtnText: 'Khởi động Trợ lý AI với nhiệm vụ này',
      execute: () => {
        onOpenAiWithTask(overdueTask);
        onClose();
      },
    },
    {
      step: 5,
      title: 'Bước 5: Người quản lý kiểm tra, chỉnh sửa & duyệt dự thảo',
      desc: 'Ban Giám hiệu rà soát văn bản do AI sinh ra, chỉnh sửa trực tiếp và bấm "Đưa vào quy trình kiểm duyệt".',
      targetScreen: 'ai-assistant' as NavScreenId,
      actionBtnText: 'Xem màn hình biên tập văn bản AI',
      execute: () => {
        onNavigateScreen('ai-assistant');
        onClose();
      },
    },
    {
      step: 6,
      title: 'Bước 6: Cập nhật tiến độ & Nộp hồ sơ minh chứng',
      desc: 'Người phụ trách cập nhật tiến độ lên 100%, nộp biên bản/ảnh nghiệm thu vào Kho minh chứng để chuyển sang trạng thái "Chờ kiểm tra".',
      targetScreen: 'evidence' as NavScreenId,
      actionBtnText: 'Mở Kho minh chứng tập trung',
      execute: () => {
        onNavigateScreen('evidence');
        onClose();
      },
    },
    {
      step: 7,
      title: 'Bước 7: Người có thẩm quyền phê duyệt hoàn thành',
      desc: 'Hiệu trưởng hoặc Phó Hiệu trưởng kiểm tra tính hợp lệ của hồ sơ minh chứng và bấm "Ban Giám hiệu xác nhận hoàn thành".',
      targetScreen: 'tasks' as NavScreenId,
      actionBtnText: 'Thực hiện phê duyệt trên nhiệm vụ',
      execute: () => {
        onSelectTask(overdueTask);
        onClose();
      },
    },
    {
      step: 8,
      title: 'Bước 8: Dashboard & KPI tự động cập nhật số liệu mới',
      desc: 'Quay lại màn hình Tổng quan điều hành: KPI "Đã hoàn thành" tăng, KPI "Quá hạn" giảm, biểu đồ 3 khu trường tự động vẽ lại!',
      targetScreen: 'overview' as NavScreenId,
      actionBtnText: 'Kiểm tra Dashboard cập nhật',
      execute: () => {
        onNavigateScreen('overview');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#142B4A] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h2 className="font-bold text-sm">
                KỊCH BẢN TRÌNH DIỄN 8 BƯỚC CHO BAN GIÁM KHẢO
              </h2>
              <p className="text-[11px] text-slate-300">
                Quy trình khép kín: Giám sát → Đôn đốc bằng AI → Nộp minh chứng → Phê duyệt BGH → Cập nhật số liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {steps.map((s) => {
            const isCurrent = activeStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/90 border-blue-500 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {s.step}
                      </span>
                      <span>{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                {isCurrent && (
                  <div className="mt-3 pl-7 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        s.execute();
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>{s.actionBtnText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Khẩu hiệu: 1 Hệ thống · 3 Khu trường · Quyết định dựa trên dữ liệu</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold"
          >
            Đóng kịch bản
          </button>
        </div>
      </div>
    </div>
  );
};
