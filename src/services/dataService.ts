import { Task, Evidence, CalendarEvent, SchoolPlan, ActivityLog, CampusId, CurrentUser, ReviewStatus } from '../types';
import { CAMPUSES, USERS, generateInitialTasks, INITIAL_EVIDENCES, INITIAL_EVENTS, INITIAL_PLANS, INITIAL_ACTIVITY_LOGS } from '../data/initialData';
import { GOOGLE_SHEET_CONFIG } from '../config/googleSheetConfig';

const STORAGE_KEYS = {
  TASKS: 'qt_smartschool_tasks_v3',
  EVIDENCES: 'qt_smartschool_evidences_v3',
  EVENTS: 'qt_smartschool_events_v3',
  PLANS: 'qt_smartschool_plans_v3',
  LOGS: 'qt_smartschool_logs_v3',
  CURRENT_USER: 'qt_smartschool_current_user_v3',
  GAS_SETTINGS: 'qt_smartschool_gas_settings_v3',
};

export interface GasSettings {
  webAppUrl: string;
  autoSync: boolean;
  lastSyncTime?: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error' | 'local_demo';
  lastError?: string;
}

// Check if a task is overdue based on strict business logic:
// Must NOT be 'Hoàn thành', and dueDate < today (midnight)
export function computeTaskStatus(task: Task): Task['status'] {
  if (task.status === 'Hoàn thành') {
    return 'Hoàn thành';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);

  if (due < today) {
    return 'Quá hạn';
  }
  return task.status;
}

export function isTaskUrgent(task: Task): boolean {
  if (task.status === 'Hoàn thành' || task.status === 'Quá hạn') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(task.dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

class DataService {
  private syncTimer: any = null;
  private isSyncing = false;

  constructor() {
    this.initBackgroundSync();
  }

  private getStored<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Error reading key ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving key ${key} to localStorage:`, e);
    }
  }

  // --- GOOGLE APPS SCRIPT SETTINGS & SYNC ---
  getActiveWebAppUrl(): string {
    const codeUrl = (GOOGLE_SHEET_CONFIG.webAppUrl || '').trim();
    if (codeUrl) return codeUrl;
    const stored = this.getStored<GasSettings>(STORAGE_KEYS.GAS_SETTINGS, {
      webAppUrl: '',
      autoSync: true,
      status: 'local_demo',
    });
    return (stored.webAppUrl || '').trim();
  }

  getGasSettings(): GasSettings {
    const webAppUrl = this.getActiveWebAppUrl();
    const stored = this.getStored<GasSettings>(STORAGE_KEYS.GAS_SETTINGS, {
      webAppUrl,
      autoSync: GOOGLE_SHEET_CONFIG.autoSync,
      status: webAppUrl ? 'connected' : 'local_demo',
    });

    return {
      ...stored,
      webAppUrl,
      status: this.isSyncing ? 'syncing' : (webAppUrl ? 'connected' : 'local_demo'),
    };
  }

  saveGasSettings(settings: GasSettings): void {
    this.setStored(STORAGE_KEYS.GAS_SETTINGS, settings);
  }

  /**
   * Đẩy dữ liệu và nhật ký lên Google Sheet qua Apps Script Web App
   */
  async pushToGas(action: string, payload: Record<string, any>, logEntry?: any): Promise<void> {
    const webAppUrl = this.getActiveWebAppUrl();
    if (!webAppUrl || !GOOGLE_SHEET_CONFIG.autoSync) return;

    this.isSyncing = true;
    try {
      const body = {
        action,
        ...payload,
        log: logEntry,
      };

      // 1. Ưu tiên gửi qua Backend Proxy để vượt qua rào cản CORS một cách an toàn
      const proxyRes = await fetch('/api/sync/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl, payload: body }),
      });

      if (!proxyRes.ok) {
        // Fallback gửi trực tiếp tới Google Apps Script
        await fetch(webAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const settings = this.getGasSettings();
      settings.lastSyncTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      settings.status = 'connected';
      this.saveGasSettings(settings);
    } catch (err: any) {
      console.warn('Lưu ý đồng bộ Google Sheet (hệ thống vẫn hoạt động trên Local Storage):', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Kéo toàn bộ dữ liệu mới nhất từ Google Sheet về App (Đồng bộ ngược)
   */
  async pullFromGas(): Promise<{ success: boolean; message?: string }> {
    const webAppUrl = this.getActiveWebAppUrl();
    if (!webAppUrl) {
      return { success: false, message: 'Chưa cấu hình Google Apps Script Web App URL.' };
    }

    this.isSyncing = true;
    try {
      let data: any = null;

      // 1. Thử kéo qua server proxy
      try {
        const proxyRes = await fetch('/api/sync/pull', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webAppUrl }),
        });
        if (proxyRes.ok) {
          const resJson = await proxyRes.json();
          if (resJson.success && resJson.data) {
            data = resJson.data;
          }
        }
      } catch (e) {
        // Continue to direct fetch
      }

      // 2. Nếu server proxy không khả dụng (môi trường static), thử gọi trực tiếp
      if (!data) {
        const directRes = await fetch(`${webAppUrl}?action=getAll`);
        if (directRes.ok) {
          const directJson = await directRes.json();
          if (directJson.success && directJson.data) {
            data = directJson.data;
          }
        }
      }

      if (data) {
        if (Array.isArray(data.tasks) && data.tasks.length > 0) {
          this.setStored(STORAGE_KEYS.TASKS, data.tasks);
        }
        if (Array.isArray(data.evidences) && data.evidences.length > 0) {
          this.setStored(STORAGE_KEYS.EVIDENCES, data.evidences);
        }
        if (Array.isArray(data.events) && data.events.length > 0) {
          this.setStored(STORAGE_KEYS.EVENTS, data.events);
        }
        if (Array.isArray(data.plans) && data.plans.length > 0) {
          this.setStored(STORAGE_KEYS.PLANS, data.plans);
        }
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          this.setStored(STORAGE_KEYS.LOGS, data.logs);
        }

        const settings = this.getGasSettings();
        settings.lastSyncTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        settings.status = 'connected';
        this.saveGasSettings(settings);

        // Bắn tín hiệu để toàn bộ UI cập nhật tức thì
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('qt-data-synced', { detail: data }));
        }

        return { success: true, message: 'Đã đồng bộ dữ liệu mới nhất từ Google Sheets thành công!' };
      }

      return { success: false, message: 'Chưa có dữ liệu từ Google Sheet hoặc kịch bản chưa phản hồi.' };
    } catch (err: any) {
      console.error('Lỗi kéo dữ liệu Google Sheet:', err);
      return { success: false, message: 'Không thể kết nối đến Google Apps Script.' };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Đẩy toàn bộ dữ liệu mẫu hiện tại lên Google Sheets lần đầu
   */
  async syncAllToGas(): Promise<{ success: boolean; message: string }> {
    const webAppUrl = this.getActiveWebAppUrl();
    if (!webAppUrl) {
      return { success: false, message: 'Vui lòng điền Web App URL trong file `src/config/googleSheetConfig.ts` trước.' };
    }

    const payload = {
      action: 'syncAll',
      data: {
        tasks: this.getTasks(),
        evidences: this.getEvidences(),
        events: this.getEvents(),
        plans: this.getPlans(),
        logs: this.getActivityLogs(),
      },
      log: {
        timestamp: new Date().toLocaleString('vi-VN'),
        entityType: 'Hệ thống',
        entityId: 'sync-all',
        action: 'Đồng bộ toàn diện',
        actor: this.getCurrentUser().name,
        actorRole: this.getCurrentUser().roleTitle,
        details: 'Đã đẩy toàn bộ cơ sở dữ liệu lên Google Sheets',
      },
    };

    try {
      const res = await fetch('/api/sync/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl, payload }),
      });
      const json = await res.json();
      return { success: json.success ?? true, message: json.message || 'Đã đồng bộ toàn bộ dữ liệu lên Google Sheets!' };
    } catch (e: any) {
      return { success: false, message: 'Lỗi đồng bộ: ' + (e.message || 'Lỗi mạng') };
    }
  }

  private initBackgroundSync(): void {
    if (typeof window === 'undefined') return;
    const interval = GOOGLE_SHEET_CONFIG.syncIntervalMs || 15000;
    if (interval <= 0) return;

    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = setInterval(() => {
      const webAppUrl = this.getActiveWebAppUrl();
      if (webAppUrl && !this.isSyncing) {
        this.pullFromGas().catch(() => {});
      }
    }, interval);
  }

  // --- CURRENT USER ---
  getCurrentUser(): CurrentUser {
    return this.getStored<CurrentUser>(STORAGE_KEYS.CURRENT_USER, USERS[0]);
  }

  setCurrentUser(user: CurrentUser): void {
    this.setStored(STORAGE_KEYS.CURRENT_USER, user);
    
    // Ghi nhật ký đăng nhập / chuyển đổi phiên làm việc và đồng bộ lên Google Sheet
    this.logActivity({
      entityType: 'Tài khoản',
      entityId: user.id,
      action: 'Đăng nhập',
      actor: user.name,
      actorRole: user.roleTitle,
      details: `Đăng nhập phiên làm việc với vai trò ${user.roleTitle} (${user.campusName})`,
    });
  }

  // --- TASKS ---
  getTasks(filterCampus?: CampusId): Task[] {
    const rawTasks = this.getStored<Task[]>(STORAGE_KEYS.TASKS, generateInitialTasks());
    // Auto re-compute status to guarantee overdue accuracy with time passage
    const updated = rawTasks.map(t => {
      const realStatus = computeTaskStatus(t);
      return realStatus !== t.status ? { ...t, status: realStatus } : t;
    });

    if (!filterCampus || filterCampus === 'all') {
      return updated;
    }
    return updated.filter(t => t.campusId === filterCampus || t.campusId === 'all');
  }

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id);
  }

  createTask(newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, actor: CurrentUser): Task {
    const tasks = this.getTasks();
    const id = `task-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Auto generate code QT-2026-XXX
    const nextNum = (tasks.length + 1).toString().padStart(3, '0');
    const taskCode = newTaskData.taskCode || `QT-2026-${nextNum}`;

    const createdTask: Task = {
      ...newTaskData,
      id,
      taskCode,
      createdAt: now.split('T')[0],
      updatedAt: now.split('T')[0],
    };

    createdTask.status = computeTaskStatus(createdTask);

    const updatedTasks = [createdTask, ...tasks];
    this.setStored(STORAGE_KEYS.TASKS, updatedTasks);

    const logEntry = {
      entityType: 'Nhiệm vụ',
      entityId: id,
      action: 'Tạo mới',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Đã giao nhiệm vụ mới: [${taskCode}] ${createdTask.title} cho ${createdTask.assignee}`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncTasks', { tasks: updatedTasks }, logEntry);

    return createdTask;
  }

  updateTask(id: string, updates: Partial<Task>, actor: CurrentUser): Task | undefined {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;

    const oldTask = tasks[index];
    const now = new Date().toISOString().split('T')[0];

    const merged: Task = {
      ...oldTask,
      ...updates,
      updatedAt: now,
    };

    // If progress is 100% and user sets completed, verify approval
    if (updates.progress !== undefined) {
      if (updates.progress === 100 && merged.status !== 'Hoàn thành') {
        if (actor.role === 'hieu_truong' || actor.role === 'pho_hieu_truong') {
          merged.status = 'Hoàn thành';
          merged.approvedBy = actor.name;
          merged.approvedAt = now;
        } else {
          merged.status = 'Chờ kiểm tra';
        }
      } else if (updates.progress < 100 && merged.status === 'Hoàn thành') {
        merged.status = 'Đang thực hiện';
      }
    }

    merged.status = computeTaskStatus(merged);
    tasks[index] = merged;
    this.setStored(STORAGE_KEYS.TASKS, tasks);

    const logEntry = {
      entityType: 'Nhiệm vụ',
      entityId: id,
      action: 'Cập nhật',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Cập nhật nhiệm vụ [${merged.taskCode}]: tiến độ ${merged.progress}%, trạng thái "${merged.status}"`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncTasks', { tasks }, logEntry);

    return merged;
  }

  approveTask(taskId: string, comment: string, actor: CurrentUser): Task | undefined {
    if (actor.role !== 'hieu_truong' && actor.role !== 'pho_hieu_truong') {
      throw new Error('Chỉ Ban Giám hiệu mới có thẩm quyền phê duyệt hoàn thành nhiệm vụ.');
    }

    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return undefined;

    const now = new Date().toISOString().split('T')[0];
    const task = tasks[index];
    
    task.status = 'Hoàn thành';
    task.progress = 100;
    task.approvedBy = `${actor.name} (${actor.role === 'hieu_truong' ? 'HT' : 'PHT'})`;
    task.approvedAt = now;
    task.reviewComment = comment || 'Đã kiểm tra minh chứng và xác nhận hoàn thành đạt yêu cầu.';
    task.updatedAt = now;

    tasks[index] = task;
    this.setStored(STORAGE_KEYS.TASKS, tasks);

    const logEntry = {
      entityType: 'Nhiệm vụ',
      entityId: taskId,
      action: 'Phê duyệt hoàn thành',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Đã phê duyệt hoàn thành nhiệm vụ [${task.taskCode}] ${task.title}. Nhận xét: "${task.reviewComment}"`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncTasks', { tasks }, logEntry);

    return task;
  }

  deleteTask(id: string, actor: CurrentUser): boolean {
    const tasks = this.getTasks();
    const target = tasks.find(t => t.id === id);
    if (!target) return false;

    const filtered = tasks.filter(t => t.id !== id);
    this.setStored(STORAGE_KEYS.TASKS, filtered);

    const logEntry = {
      entityType: 'Nhiệm vụ',
      entityId: id,
      action: 'Cập nhật',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Đã xóa nhiệm vụ [${target.taskCode}] ${target.title}`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncTasks', { tasks: filtered }, logEntry);

    return true;
  }

  // --- EVIDENCES ---
  getEvidences(filterCampus?: CampusId): Evidence[] {
    const raw = this.getStored<Evidence[]>(STORAGE_KEYS.EVIDENCES, INITIAL_EVIDENCES);
    if (!filterCampus || filterCampus === 'all') {
      return raw;
    }
    return raw.filter(e => e.campusId === filterCampus || e.campusId === 'all');
  }

  submitEvidence(evidenceData: Omit<Evidence, 'id' | 'uploadedAt'>, actor: CurrentUser): Evidence {
    const evidences = this.getEvidences();
    const id = `ev-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    const nextNum = (evidences.length + 1).toString().padStart(3, '0');
    const evidenceCode = evidenceData.evidenceCode || `MC-2026-${nextNum}`;

    const newEvidence: Evidence = {
      ...evidenceData,
      id,
      evidenceCode,
      uploadedAt: now,
      uploadedBy: actor.name,
    };

    const updated = [newEvidence, ...evidences];
    this.setStored(STORAGE_KEYS.EVIDENCES, updated);

    // Link evidence to task if taskId provided
    if (newEvidence.taskId) {
      const task = this.getTaskById(newEvidence.taskId);
      if (task) {
        const evidenceIds = task.evidenceIds || [];
        if (!evidenceIds.includes(id)) {
          this.updateTask(task.id, {
            evidenceIds: [...evidenceIds, id],
            status: task.progress >= 80 ? 'Chờ kiểm tra' : task.status,
          }, actor);
        }
      }
    }

    const logEntry = {
      entityType: 'Minh chứng',
      entityId: id,
      action: 'Tạo mới',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Đã tải lên minh chứng [${evidenceCode}] ${newEvidence.title} cho nhiệm vụ [${newEvidence.taskCode || 'Liên quan'}]`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncEvidences', { evidences: updated }, logEntry);

    return newEvidence;
  }

  reviewEvidence(evidenceId: string, status: ReviewStatus, note: string, actor: CurrentUser): Evidence | undefined {
    const evidences = this.getEvidences();
    const index = evidences.findIndex(e => e.id === evidenceId);
    if (index === -1) return undefined;

    const ev = evidences[index];
    ev.reviewStatus = status;
    ev.reviewNote = note;
    ev.reviewedBy = `${actor.name} (${actor.roleTitle})`;
    
    evidences[index] = ev;
    this.setStored(STORAGE_KEYS.EVIDENCES, evidences);

    const logEntry = {
      entityType: 'Minh chứng',
      entityId: evidenceId,
      action: status === 'Đạt yêu cầu' ? 'Phê duyệt hoàn thành' : 'Cập nhật',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Kiểm tra minh chứng [${ev.evidenceCode}]: Xếp loại "${status}". Ghi chú: ${note || 'Đạt tiêu chuẩn'}`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncEvidences', { evidences }, logEntry);

    return ev;
  }

  // --- CALENDAR EVENTS ---
  getEvents(filterCampus?: CampusId): CalendarEvent[] {
    const raw = this.getStored<CalendarEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    if (!filterCampus || filterCampus === 'all') {
      return raw;
    }
    return raw.filter(e => e.campusId === filterCampus || e.campusId === 'all');
  }

  createEvent(eventData: Omit<CalendarEvent, 'id'>, actor: CurrentUser): CalendarEvent {
    const events = this.getEvents();
    const id = `ev-cal-${Date.now()}`;
    const newEvent: CalendarEvent = { ...eventData, id };
    const updated = [newEvent, ...events];
    this.setStored(STORAGE_KEYS.EVENTS, updated);

    const logEntry = {
      entityType: 'Lịch',
      entityId: id,
      action: 'Tạo mới',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Thêm sự kiện lịch công tác: "${newEvent.title}" ngày ${newEvent.startAt}`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncEvents', { events: updated }, logEntry);

    return newEvent;
  }

  deleteEvent(id: string, actor: CurrentUser): boolean {
    const events = this.getEvents();
    const target = events.find(e => e.id === id);
    if (!target) return false;

    const updated = events.filter(e => e.id !== id);
    this.setStored(STORAGE_KEYS.EVENTS, updated);

    const logEntry = {
      entityType: 'Lịch',
      entityId: id,
      action: 'Cập nhật',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Đã hủy sự kiện lịch: "${target.title}"`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncEvents', { events: updated }, logEntry);

    return true;
  }

  // --- PLANS ---
  getPlans(filterCampus?: CampusId): SchoolPlan[] {
    const raw = this.getStored<SchoolPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    if (!filterCampus || filterCampus === 'all') {
      return raw;
    }
    return raw.filter(p => p.campusIds.includes(filterCampus) || p.campusIds.includes('all'));
  }

  createPlan(planData: Omit<SchoolPlan, 'id' | 'createdAt' | 'updatedAt'>, actor: CurrentUser): SchoolPlan {
    const plans = this.getPlans();
    const id = `plan-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newPlan: SchoolPlan = {
      ...planData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newPlan, ...plans];
    this.setStored(STORAGE_KEYS.PLANS, updated);

    const logEntry = {
      entityType: 'Kế hoạch',
      entityId: id,
      action: 'Tạo mới',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Khởi tạo kế hoạch: [${newPlan.planCode}] ${newPlan.title} (${newPlan.status})`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncPlans', { plans: updated }, logEntry);

    return newPlan;
  }

  updatePlan(id: string, updates: Partial<SchoolPlan>, actor: CurrentUser): SchoolPlan | undefined {
    const plans = this.getPlans();
    const index = plans.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const updated: SchoolPlan = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    plans[index] = updated;
    this.setStored(STORAGE_KEYS.PLANS, plans);

    const logEntry = {
      entityType: 'Kế hoạch',
      entityId: id,
      action: 'Cập nhật',
      actor: actor.name,
      actorRole: actor.roleTitle,
      details: `Cập nhật kế hoạch [${updated.planCode}]: trạng thái "${updated.status}"`,
    };

    this.logActivity(logEntry);
    this.pushToGas('syncPlans', { plans }, logEntry);

    return updated;
  }

  // --- ACTIVITY LOGS ---
  getActivityLogs(): ActivityLog[] {
    return this.getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS);
  }

  logActivity(entry: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getActivityLogs();
    const id = `log-${Date.now()}`;
    const timestamp = new Date().toLocaleString('vi-VN');
    const newLog: ActivityLog = { ...entry, id, timestamp };
    const updated = [newLog, ...logs].slice(0, 50); // Keep last 50 logs
    this.setStored(STORAGE_KEYS.LOGS, updated);

    // Push log entry to Google Sheet
    this.pushToGas('logActivity', {}, newLog);
  }

  // --- RESTORE DEMO DATA ---
  restoreDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.EVIDENCES);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    
    // Write fresh seeded data
    this.setStored(STORAGE_KEYS.TASKS, generateInitialTasks());
    this.setStored(STORAGE_KEYS.EVIDENCES, INITIAL_EVIDENCES);
    this.setStored(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    this.setStored(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    this.setStored(STORAGE_KEYS.LOGS, INITIAL_ACTIVITY_LOGS);

    const user = this.getCurrentUser();
    this.logActivity({
      entityType: 'Hệ thống',
      action: 'Cập nhật',
      actor: user.name,
      actorRole: user.roleTitle,
      details: 'Đã khôi phục dữ liệu mẫu ban đầu của trường',
    });
  }

  // --- STATS & METRICS CALCULATIONS ---
  getMetrics(campusId: CampusId = 'all') {
    const tasks = this.getTasks(campusId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Hoàn thành').length;
    const inProgress = tasks.filter(t => t.status === 'Đang thực hiện').length;
    const pendingReview = tasks.filter(t => t.status === 'Chờ kiểm tra').length;
    const overdue = tasks.filter(t => t.status === 'Quá hạn').length;
    const urgent = tasks.filter(t => isTaskUrgent(t)).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Missing evidence count: tasks where evidenceRequired is true but evidenceIds is empty
    const missingEvidenceTasks = tasks.filter(t => t.evidenceRequired && (!t.evidenceIds || t.evidenceIds.length === 0));

    // Per campus breakdown
    const campusBreakdown = CAMPUSES.map(c => {
      const cTasks = tasks.filter(t => t.campusId === c.id || t.campusId === 'all');
      const cTotal = cTasks.length;
      const cCompleted = cTasks.filter(t => t.status === 'Hoàn thành').length;
      const cInProgress = cTasks.filter(t => t.status === 'Đang thực hiện').length;
      const cOverdue = cTasks.filter(t => t.status === 'Quá hạn').length;
      const cPendingReview = cTasks.filter(t => t.status === 'Chờ kiểm tra').length;
      const cRate = cTotal > 0 ? Math.round((cCompleted / cTotal) * 100) : 0;

      return {
        campus: c,
        total: cTotal,
        completed: cCompleted,
        inProgress: cInProgress,
        overdue: cOverdue,
        pendingReview: cPendingReview,
        completionRate: cRate,
      };
    });

    return {
      total,
      completed,
      inProgress,
      pendingReview,
      overdue,
      urgent,
      completionRate,
      missingEvidenceCount: missingEvidenceTasks.length,
      missingEvidenceTasks,
      campusBreakdown,
    };
  }

  // Dynamic AI Suggestions derived directly from live application state
  getAiExecutiveSuggestions(campusId: CampusId = 'all') {
    const metrics = this.getMetrics(campusId);
    const overdueTasks = this.getTasks(campusId).filter(t => t.status === 'Quá hạn');
    const urgentTasks = this.getTasks(campusId).filter(t => isTaskUrgent(t));
    const pendingReviews = this.getTasks(campusId).filter(t => t.status === 'Chờ kiểm tra');

    const suggestions: { id: string; type: 'danger' | 'warning' | 'info'; title: string; message: string; actionText: string; actionTab: string }[] = [];

    if (overdueTasks.length > 0) {
      const topOverdue = overdueTasks[0];
      suggestions.push({
        id: 'sug-overdue',
        type: 'danger',
        title: `Có ${overdueTasks.length} nhiệm vụ quá hạn cần đôn đốc khẩn`,
        message: `Nhiệm vụ [${topOverdue.taskCode}] "${topOverdue.title}" do ${topOverdue.assignee} phụ trách đã quá hạn xử lý. Cần chỉ đạo giải quyết ngay khó khăn phát sinh.`,
        actionText: 'Dự thảo nhắc nhở bằng AI',
        actionTab: 'ai-assistant',
      });
    }

    if (metrics.missingEvidenceCount > 0) {
      suggestions.push({
        id: 'sug-evidence',
        type: 'warning',
        title: `Phát hiện ${metrics.missingEvidenceCount} nhiệm vụ thiếu minh chứng nghiệm thu`,
        message: 'Các nhiệm vụ đã triển khai khối lượng lớn nhưng chưa nộp biên bản hoặc ảnh thực tế theo quy chế kiểm định chất lượng.',
        actionText: 'Kiểm tra Kho minh chứng',
        actionTab: 'evidence',
      });
    }

    if (pendingReviews.length > 0) {
      suggestions.push({
        id: 'sug-approval',
        type: 'info',
        title: `Có ${pendingReviews.length} nhiệm vụ đang chờ Ban Giám hiệu kiểm tra duyệt`,
        message: 'Cán bộ giáo viên đã hoàn thành và nộp hồ sơ minh chứng. Ban Giám hiệu cần phê duyệt để kịp thời công nhận kết quả thi đua.',
        actionText: 'Duyệt nhiệm vụ ngay',
        actionTab: 'tasks',
      });
    } else if (urgentTasks.length > 0) {
      suggestions.push({
        id: 'sug-urgent',
        type: 'info',
        title: `${urgentTasks.length} nhiệm vụ sắp đến hạn trong 72 giờ tới`,
        message: 'Chủ động rà soát lịch công tác và nhắc các tổ trưởng chuyên môn kiểm tra tiến độ trước hạn chót.',
        actionText: 'Xem Lịch công tác',
        actionTab: 'calendar',
      });
    }

    return suggestions.slice(0, 3);
  }
}

export const dataService = new DataService();
