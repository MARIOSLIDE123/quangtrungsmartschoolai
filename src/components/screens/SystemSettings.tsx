import React, { useState } from 'react';
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  History,
  Cloud,
  RefreshCw,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { CurrentUser } from '../../types';
import { dataService } from '../../services/dataService';
import { USERS } from '../../data/initialData';
import { GOOGLE_SHEET_CONFIG } from '../../config/googleSheetConfig';

interface SystemSettingsProps {
  currentUser: CurrentUser;
  onChangeUser: (u: CurrentUser) => void;
  onDataReset: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  currentUser,
  onChangeUser,
  onDataReset,
}) => {
  const [gasSettings, setGasSettings] = useState(() => dataService.getGasSettings());
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const logs = dataService.getActivityLogs();
  const configuredUrl = dataService.getActiveWebAppUrl();

  const handlePullFromSheet = async () => {
    setIsSyncingNow(true);
    setSyncStatusMsg({ type: 'info', text: 'Đang kết nối và kéo dữ liệu mới nhất từ Google Sheets...' });
    const res = await dataService.pullFromGas();
    setIsSyncingNow(false);
    if (res.success) {
      setGasSettings(dataService.getGasSettings());
      setSyncStatusMsg({ type: 'success', text: res.message || 'Đồng bộ từ Google Sheets thành công!' });
      onDataReset();
    } else {
      setSyncStatusMsg({ type: 'error', text: res.message || 'Chưa thể kết nối tới Google Sheets' });
    }
  };

  const handlePushAllToSheet = async () => {
    setIsSyncingNow(true);
    setSyncStatusMsg({ type: 'info', text: 'Đang đẩy toàn bộ dữ liệu mẫu lên Google Sheets...' });
    const res = await dataService.syncAllToGas();
    setIsSyncingNow(false);
    if (res.success) {
      setGasSettings(dataService.getGasSettings());
      setSyncStatusMsg({ type: 'success', text: res.message });
    } else {
      setSyncStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleConfirmRestore = () => {
    dataService.restoreDemoData();
    setShowRestoreConfirm(false);
    setSyncStatusMsg({ type: 'success', text: 'Đã khôi phục bộ dữ liệu mẫu chuẩn của nhà trường!' });
    onDataReset();
  };

  return (
    <div className="p-5 space-y-5 max-w-[1720px] mx-auto overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl font-bold text-[#142B4A] tracking-tight">
          CÀI ĐẶT HỆ THỐNG VÀ PHÂN QUYỀN ĐIỀU HÀNH
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quản lý vai trò người dùng (RBAC), kiểm soát đồng bộ dữ liệu Google Sheets tự động và nhật ký điều hành
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (col-span-7): User Role Switching & Permission Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    Phân quyền vai trò người dùng (RBAC)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Chuyển đổi vai trò trong Ban Giám hiệu và các bộ phận để trải nghiệm thẩm quyền
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                Hiện tại: {currentUser.roleTitle.split(' - ')[0]}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {USERS.map((u) => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => onChangeUser(u)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {u.avatarText}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">{u.name}</div>
                      <div className="text-[10px] text-blue-700 font-semibold truncate">
                        {u.roleTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Phạm vi: {u.campusName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Permission explanation matrix */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-700 pb-1 border-b border-slate-200">
                Ma trận thẩm quyền điều hành Trường Tiểu học Quang Trung:
              </div>
              <div>
                <strong>• Thầy Nguyễn Văn Thông (Hiệu trưởng):</strong> Toàn quyền phê duyệt hoàn thành nhiệm vụ, ban hành kế hoạch chính thức, điều hành toàn diện 3 khu trường.
              </div>
              <div>
                <strong>• Cô Tạ Thị Hằng (Phó Hiệu trưởng):</strong> Trực tiếp chỉ đạo chuyên môn, phụ trách cơ sở Khu 1, thẩm định minh chứng và xác nhận hoàn thành công việc.
              </div>
              <div>
                <strong>• Cô Đào Thị Hồng Duyên (Phó Hiệu trưởng):</strong> Trực tiếp phụ trách cơ sở Khu 2, quản lý nhiệm vụ, thẩm định hồ sơ minh chứng cơ sở.
              </div>
              <div>
                <strong>• Tổ trưởng chuyên môn:</strong> Giao việc trong tổ, theo dõi tiến độ và nộp biên bản sinh hoạt chuyên môn định kỳ.
              </div>
              <div>
                <strong>• Giáo viên / Nhân viên CNTT:</strong> Cập nhật phần trăm tiến độ, nộp minh chứng và gửi đề xuất kiến nghị.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5): Google Sheets Status & Data Reset */}
        <div className="lg:col-span-5 space-y-4">
          {/* Central Data & Google Sheets Status Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    Đồng bộ Google Sheets tự động
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Cấu hình mặc định trong mã nguồn (Code)
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  configuredUrl
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {configuredUrl ? 'Sẵn sàng kết nối' : 'Chế độ Demo nội bộ'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Toàn bộ dữ liệu tác vụ, lịch sử hành động, duyệt minh chứng và đăng nhập được cấu hình kết nối trực tiếp đến Google Sheets qua <strong>Apps Script Web App</strong> đã cài đặt ngầm định trong mã nguồn (`googleSheetConfig.ts`).
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Tự động đồng bộ 2 chiều:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Bật (Thời gian thực)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Lần đồng bộ gần nhất:</span>
                <span className="font-mono text-slate-700 font-medium">
                  {gasSettings.lastSyncTime || 'Sẵn sàng'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span className="font-medium text-slate-700">Tệp cấu hình Web App URL:</span>
                <code className="ml-1 text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-[10px]">
                  src/config/googleSheetConfig.ts
                </code>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncStatusMsg && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border ${
                  syncStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : syncStatusMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {syncStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : syncStatusMsg.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                ) : (
                  <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin" />
                )}
                <span>{syncStatusMsg.text}</span>
              </div>
            )}

            {/* Fast Manual Sync Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handlePullFromSheet}
                disabled={isSyncingNow}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Kéo dữ liệu từ Sheet</span>
              </button>
              <button
                onClick={handlePushAllToSheet}
                disabled={isSyncingNow}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Đẩy dữ liệu lên Sheet</span>
              </button>
            </div>
          </div>

          {/* Demo Data Management Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Quản lý dữ liệu mẫu trình diễn
                </h2>
                <p className="text-[11px] text-slate-500">
                  Phục hồi bộ dữ liệu dự thi với mốc thời gian chuẩn hóa
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bộ dữ liệu mẫu chuẩn gồm <strong>22+ nhiệm vụ 3 khu trường</strong>, 10 minh chứng kiểm định, 6 sự kiện lịch công tác và 3 kế hoạch chiến lược.
            </p>

            <button
              onClick={() => setShowRestoreConfirm(true)}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục dữ liệu mẫu ban đầu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Nhật ký hoạt động điều hành hệ thống ({logs.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Ghi nhận minh bạch mọi thao tác tạo việc, sửa đổi, đăng nhập, nộp minh chứng và phê duyệt
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">Được đồng bộ tự động lên trang tính ActivityLogs</span>
        </div>

        <div className="overflow-x-auto max-h-[260px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2 px-3">Thời gian</th>
                <th className="py-2 px-3">Thực thể</th>
                <th className="py-2 px-3">Hành động</th>
                <th className="py-2 px-3">Người thực hiện</th>
                <th className="py-2 px-3">Chi tiết nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500 tabular-nums whitespace-nowrap text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-700 whitespace-nowrap">
                    {log.entityType}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.action.includes('Phê duyệt')
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action.includes('Tạo')
                          ? 'bg-blue-100 text-blue-800'
                          : log.action.includes('Đăng nhập')
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-medium whitespace-nowrap">
                    {log.actor} ({log.actorRole})
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Demo Data Confirmation Modal */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="p-4 bg-amber-600 text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm">Xác nhận khôi phục dữ liệu mẫu</span>
            </div>
            <div className="p-5 space-y-2 text-slate-700">
              <p>
                Thao tác này sẽ thiết lập lại <strong>toàn bộ nhiệm vụ, minh chứng, lịch và kế hoạch</strong> về trạng thái chuẩn ban đầu với Ban Giám hiệu mới:
              </p>
              <ul className="list-disc pl-5 space-y-1 font-medium text-slate-800">
                <li>Thầy Nguyễn Văn Thông - Hiệu trưởng</li>
                <li>Cô Tạ Thị Hằng - Phó Hiệu trưởng</li>
                <li>Cô Đào Thị Hồng Duyên - Phó Hiệu trưởng</li>
              </ul>
              <p className="text-amber-700 font-medium pt-1">
                Các mốc ngày sẽ được tính toán tự động tương đối với ngày hôm nay.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-4 py-2 text-slate-600 font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
