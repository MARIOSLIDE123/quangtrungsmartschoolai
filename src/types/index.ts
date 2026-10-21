export type CampusId = 'all' | 'campus-1' | 'campus-2' | 'campus-3';

export interface Campus {
  id: 'campus-1' | 'campus-2' | 'campus-3';
  code: string;
  name: string;
  shortName: string;
  address: string;
  manager: string;
  managerTitle: string;
  phone: string;
  classesCount: number;
  studentsCount: number;
  teachersCount: number;
  description: string;
  color: string;
}

export type TaskCategory = 
  | 'Công tác chuyên môn'
  | 'Kiểm tra nội bộ'
  | 'Cơ sở vật chất'
  | 'Hoạt động giáo dục'
  | 'Công tác hành chính'
  | 'Phối hợp phụ huynh'
  | 'Chuyển đổi số'
  | 'Báo cáo định kỳ';

export type TaskPriority = 'Cao' | 'Trung bình' | 'Thấp';

export type TaskStatus = 
  | 'Chưa thực hiện'
  | 'Đang thực hiện'
  | 'Chờ kiểm tra'
  | 'Hoàn thành'
  | 'Quá hạn';

export interface Task {
  id: string;
  taskCode: string;
  title: string;
  description: string;
  category: TaskCategory;
  campusId: CampusId;
  campusName: string;
  assignee: string;
  assigneeRole: string;
  creator: string;
  collaborators: string;
  createdAt: string; // ISO String
  dueDate: string;   // ISO String (YYYY-MM-DD)
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 - 100
  completionCriteria: string;
  evidenceRequired: boolean;
  evidenceIds: string[];
  notes: string;
  updatedAt: string;
  reviewComment?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export type EvidenceType = 
  | 'Biên bản'
  | 'Ảnh thực tế'
  | 'Kế hoạch/Báo cáo'
  | 'Đề kiểm tra/Ma trận'
  | 'Danh sách/Sổ điểm'
  | 'Khác';

export type ReviewStatus = 'Đạt yêu cầu' | 'Chờ duyệt' | 'Cần bổ sung';

export interface Evidence {
  id: string;
  evidenceCode: string;
  title: string;
  type: EvidenceType;
  taskId: string;
  taskCode?: string;
  taskTitle?: string;
  campusId: CampusId;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  reviewStatus: ReviewStatus;
  notes: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export type EventCategory = 
  | 'Họp Ban Giám hiệu'
  | 'Sinh hoạt chuyên môn'
  | 'Kiểm tra nội bộ'
  | 'Hoạt động giáo dục'
  | 'Hạn hoàn thành nhiệm vụ'
  | 'Hoạt động chung 3 khu';

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  endAt: string;
  campusId: CampusId;
  category: EventCategory;
  relatedTaskId?: string;
  organizer: string;
  location: string;
  description: string;
}

export type PlanType = 
  | 'Kế hoạch tuần'
  | 'Kế hoạch tháng'
  | 'Kế hoạch học kỳ'
  | 'Kế hoạch năm học';

export type PlanStatus = 'Dự thảo' | 'Chờ duyệt' | 'Đã ban hành';

export interface SchoolPlan {
  id: string;
  planCode: string;
  title: string;
  type: PlanType;
  period: string;
  campusIds: CampusId[];
  owner: string;
  content: string;
  status: PlanStatus;
  relatedTaskIds: string[];
  createdAt: string;
  updatedAt: string;
  isAiDraft?: boolean;
  approvedBy?: string;
  attachmentName?: string;
}

export interface ActivityLog {
  id: string;
  entityType: 'Nhiệm vụ' | 'Minh chứng' | 'Kế hoạch' | 'Lịch' | 'Hệ thống';
  entityId: string;
  action: 'Tạo mới' | 'Cập nhật' | 'Gửi kiểm tra' | 'Phê duyệt hoàn thành' | 'Khôi phục' | 'Từ chối';
  actor: string;
  actorRole: string;
  timestamp: string;
  details: string;
}

export type UserRole = 'hieu_truong' | 'pho_hieu_truong' | 'to_truong' | 'giao_vien';

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  campusId: CampusId;
  campusName: string;
  avatarText: string;
}
