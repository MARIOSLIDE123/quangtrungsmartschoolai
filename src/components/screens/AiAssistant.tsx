import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  Download,
  RotateCcw,
  Edit3,
  Send,
  Building2,
  FileCheck2,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';
import { CampusId, CurrentUser, Task } from '../../types';
import { AI_TASK_PRESETS, AiTaskPreset, executeAiAssistant } from '../../services/aiService';
import { dataService } from '../../services/dataService';

interface AiAssistantProps {
  selectedCampus: CampusId;
  currentUser: CurrentUser;
  initialTaskContext?: Task | null;
  onClearInitialTaskContext?: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  selectedCampus,
  currentUser,
  initialTaskContext,
  onClearInitialTaskContext,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<AiTaskPreset>(() => {
    if (initialTaskContext) {
      return AI_TASK_PRESETS.find((p) => p.id === 'noi_dung_don_doc') || AI_TASK_PRESETS[0];
    }
    return AI_TASK_PRESETS[3]; // Default: Phân tích tiến độ
  });

  const [promptInput, setPromptInput] = useState<string>(() => {
    if (initialTaskContext) {
      return `Đề xuất nội dung đôn đốc khẩn gửi ${initialTaskContext.assignee} về nhiệm vụ [${initialTaskContext.taskCode}] "${initialTaskContext.title}" tại ${initialTaskContext.campusName}. Hạn hoàn thành: ${initialTaskContext.dueDate}. Tiến độ hiện tại: ${initialTaskContext.progress}%.`;
    }
    return AI_TASK_PRESETS[3].defaultPrompt;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const metrics = dataService.getMetrics(selectedCampus);

  const handleSelectPreset = (preset: AiTaskPreset) => {
    setSelectedPreset(preset);
    setPromptInput(preset.defaultPrompt);
    if (onClearInitialTaskContext) onClearInitialTaskContext();
  };

  const handleRunAi = async () => {
    if (!promptInput.trim()) return;
    setIsLoading(true);
    setStatusMessage('');

    try {
      const result = await executeAiAssistant(selectedPreset.id, promptInput, selectedCampus);
      setGeneratedOutput(result.text);
      setAiSource(result.source);
    } catch (err) {
      console.error(err);
      setStatusMessage('Có lỗi xảy ra khi tạo nội dung. Đã tải chế độ mô phỏng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedOutput) return;
    const blob = new Blob([generatedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Du_thao_AI_${selectedPreset.id}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToReview = () => {
    if (!generatedOutput) return;
    // Auto creates a draft plan or records an activity log
    dataService.createPlan(
      {
        planCode: `AI-DRAFT-${Date.now().toString().slice(-4)}`,
        title: `Dự thảo do AI hỗ trợ: ${selectedPreset.title.split('. ')[1]}`,
        type: 'Kế hoạch tuần',
        period: 'Tuần điều hành hiện tại',
        campusIds: [selectedCampus],
        owner: currentUser.name,
        content: generatedOutput,
        status: 'Chờ duyệt',
        relatedTaskIds: [],
        isAiDraft: true,
      },
      currentUser
    );
    setStatusMessage('Đã chuyển nội dung dự thảo vào mục "Quản lý kế hoạch - Chờ Ban Giám hiệu kiểm duyệt" thành công!');
    setTimeout(() => setStatusMessage(''), 5000);
  };

  return (
    <div className="p-5 space-y-4 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
              SMARTSCHOOL AI ASSISTANT
            </h1>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Trợ lý Quản trị Tiểu học
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Trợ lý thông minh đồng hành cùng Ban Giám hiệu trong công tác quản trị và điều hành 3 khu trường.
          </p>
        </div>

        {/* Live Data Badge */}
        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Dữ liệu nguồn:</span>
          <span className="font-bold text-[#142B4A] tabular-nums">
            {metrics.total} nhiệm vụ ({metrics.overdue} quá hạn)
          </span>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: 10 AI Task Cards (col-span-4) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Danh mục tác vụ AI nghiệp vụ (10)
            </span>
            <span className="text-[10px] text-slate-400">Chọn để nạp mẫu</span>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
            {AI_TASK_PRESETS.map((p) => {
              const isSelected = selectedPreset.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs group relative ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs text-blue-950 font-semibold'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[12px] group-hover:text-blue-700">
                      {p.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {p.shortDesc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Prompt & Structured Result (col-span-8) */}
        <div className="lg:col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          {/* Prompt Form */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Nội dung yêu cầu chi tiết gửi tới AI:</span>
              </label>
              <span className="text-[10px] text-slate-400">
                AI sẽ tự động nạp dữ liệu {selectedCampus === 'all' ? 'cả 3 khu trường' : selectedCampus}
              </span>
            </div>

            <textarea
              rows={3}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Nhập nội dung bạn muốn trợ lý AI hỗ trợ xử lý..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed text-slate-800"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>AI chỉ đóng vai trò dự thảo; Ban Giám hiệu giữ quyền quyết định.</span>
              </div>

              <button
                onClick={handleRunAi}
                disabled={isLoading || !promptInput.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-all ${
                  isLoading
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Đang phân tích & tạo văn bản...' : 'Tạo văn bản ngay'}</span>
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* AI Result Area */}
          <div className="flex-1 flex flex-col min-h-[360px] bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden">
            {/* Result Toolbar */}
            <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">KẾT QUẢ DỰ THẢO</span>
                {aiSource && (
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {aiSource === 'gemini-3.8-flash' ? 'Mô hình: Gemini 3.8 Flash' : 'Mô phỏng dữ liệu thực'}
                  </span>
                )}
              </div>

              {generatedOutput && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-1.5 hover:bg-white rounded text-slate-600 transition-colors flex items-center gap-1 text-[11px]"
                    title="Chỉnh sửa trực tiếp"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Xem văn bản' : 'Sửa'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-white rounded text-slate-600 transition-colors flex items-center gap-1 text-[11px]"
                    title="Sao chép"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 hover:bg-white rounded text-slate-600 transition-colors flex items-center gap-1 text-[11px]"
                    title="Tải tệp văn bản"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải TXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Result Content */}
            <div className="p-4 flex-1 overflow-y-auto font-sans text-xs text-slate-800 leading-relaxed">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium text-xs">
                    Trợ lý AI đang đối soát dữ liệu 3 khu trường và soạn thảo văn bản...
                  </p>
                </div>
              ) : generatedOutput ? (
                isEditing ? (
                  <textarea
                    rows={14}
                    value={generatedOutput}
                    onChange={(e) => setGeneratedOutput(e.target.value)}
                    className="w-full h-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="whitespace-pre-wrap font-sans bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                    {generatedOutput}
                  </div>
                )
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Bot className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  <div className="font-semibold text-slate-600">Sẵn sàng hỗ trợ Ban Giám hiệu</div>
                  <p className="text-[11px] max-w-sm text-slate-400">
                    Chọn một trong 10 tác vụ ở cột trái hoặc chỉnh sửa yêu cầu, sau đó bấm <strong>"Tạo văn bản ngay"</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Actions: Phê duyệt kiểm duyệt workflow */}
            {generatedOutput && !isLoading && (
              <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  Dự thảo do AI hỗ trợ – Chờ kiểm duyệt
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunAi}
                    className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tạo lại</span>
                  </button>

                  <button
                    onClick={handleSendToReview}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Đưa vào quy trình kiểm duyệt</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
