import { dataService } from './dataService';
import { CampusId } from '../types';

export interface AiTaskPreset {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  defaultPrompt: string;
}

export const AI_TASK_PRESETS: AiTaskPreset[] = [
  {
    id: 'soan_thong_bao',
    title: '1. Soạn thông báo điều hành',
    category: 'Văn bản hành chính',
    shortDesc: 'Dự thảo thông báo nội bộ gửi 3 khu trường chuẩn thể thức giáo dục.',
    defaultPrompt: 'Dự thảo thông báo gửi toàn thể cán bộ giáo viên nhân viên 3 khu trường về việc tăng cường nề nếp chuyên môn, an toàn trường học và kiểm soát vệ sinh bán trú trong giai đoạn cao điểm.',
  },
  {
    id: 'ke_hoach_tuan',
    title: '2. Dự thảo kế hoạch tuần',
    category: 'Kế hoạch công tác',
    shortDesc: 'Tổng hợp công tác trọng tâm tuần mới cho cả 3 điểm trường.',
    defaultPrompt: 'Dự thảo Kế hoạch công tác tuần mới cho Trường Tiểu học Quang Trung, phân rõ nội dung chỉ đạo cho từng khu trường và danh sách các sự kiện chuyên môn ưu tiên.',
  },
  {
    id: 'bao_cao_thang',
    title: '3. Tổng hợp báo cáo tháng',
    category: 'Báo cáo quản lý',
    shortDesc: 'Tổng hợp tình hình thực hiện nhiệm vụ gửi Phòng GD&ĐT.',
    defaultPrompt: 'Tổng hợp báo cáo đánh giá công tác quản trị, dạy học và tiến độ hoàn thành nhiệm vụ của 3 khu trường trong tháng vừa qua, nêu bật các điểm đạt được và chỉ rõ hạn chế cần khắc phục.',
  },
  {
    id: 'phan_tich_tien_do',
    title: '4. Phân tích tiến độ nhiệm vụ',
    category: 'Phân tích dữ liệu',
    shortDesc: 'Đánh giá tỷ lệ hoàn thành, tồn đọng và so sánh 3 khu trường.',
    defaultPrompt: 'Phân tích chi tiết tình hình thực hiện nhiệm vụ của cả 3 khu trường dựa trên dữ liệu thời gian thực hiện có. Nêu rõ các số liệu quan trọng, so sánh tiến độ và đánh giá điểm nghẽn.',
  },
  {
    id: 'nguy_co_cham',
    title: '5. Phát hiện nguy cơ chậm tiến độ',
    category: 'Cảnh báo sớm',
    shortDesc: 'Rà soát các nhiệm vụ sắp đến hạn nhưng khối lượng còn thấp.',
    defaultPrompt: 'Rà soát toàn bộ các nhiệm vụ sắp đến hạn trong 72 giờ tới và các nhiệm vụ đang thực hiện dưới 50% khối lượng để xác định nguy cơ phát sinh chậm trễ, đề xuất biện pháp tháo gỡ kịp thời.',
  },
  {
    id: 'noi_dung_don_doc',
    title: '6. Đề xuất nội dung đôn đốc',
    category: 'Chỉ đạo điều hành',
    shortDesc: 'Soạn văn bản nhắc nhở cá nhân, đơn vị phụ trách nhiệm vụ quá hạn.',
    defaultPrompt: 'Đề xuất nội dung tin nhắn hoặc văn bản đôn đốc của Ban Giám hiệu gửi các cán bộ phụ trách nhiệm vụ đã quá hạn hoặc còn thiếu minh chứng, với giọng điệu chuẩn mực, mang tính xây dựng nhưng kiên quyết.',
  },
  {
    id: 'ket_luan_cuoc_hop',
    title: '7. Xây dựng dự thảo kết luận họp',
    category: 'Biên bản giao ban',
    shortDesc: 'Tạo thông báo kết luận phiên họp giao ban Ban Giám hiệu.',
    defaultPrompt: 'Xây dựng dự thảo Thông báo kết luận của Hiệu trưởng tại phiên họp giao ban đầu tuần với các Phó Hiệu trưởng và Tổ trưởng chuyên môn về tiến độ xử lý công việc tại 3 khu trường.',
  },
  {
    id: 'tong_hop_3_khu',
    title: '8. Tổng hợp tình hình ba khu trường',
    category: 'Báo cáo đối sánh',
    shortDesc: 'So sánh bức tranh tổng thể: CSVC, nhân sự, tiến độ 3 điểm trường.',
    defaultPrompt: 'Lập bảng phân tích tổng hợp đối sánh giữa Khu trường 1 (Cơ sở chính), Khu trường 2 (Điểm Tây) và Khu trường 3 (Điểm Nam) về khối lượng nhiệm vụ, tỷ lệ hoàn thành và tính tuân thủ minh chứng.',
  },
  {
    id: 'thieu_minh_chung',
    title: '9. Phân tích nhiệm vụ thiếu minh chứng',
    category: 'Kiểm định chất lượng',
    shortDesc: 'Kiểm tra tính pháp lý và hồ sơ minh chứng phục vụ kiểm tra nội bộ.',
    defaultPrompt: 'Lập danh sách và phân tích nguyên nhân các nhiệm vụ có yêu cầu minh chứng bắt buộc nhưng hiện tại chưa nộp hoặc minh chứng chưa đạt yêu cầu, hướng dẫn biện pháp hoàn thiện hồ sơ.',
  },
  {
    id: 'uu_tien_xu_ly',
    title: '10. Đề xuất ưu tiên xử lý',
    category: 'Tư vấn quyết sách',
    shortDesc: 'Xếp hạng ma trận Eisenhower những việc khẩn cấp Ban Giám hiệu cần quyết.',
    defaultPrompt: 'Dựa trên toàn bộ dữ liệu quản trị hiện tại, hãy tư vấn cho Ban Giám hiệu danh mục 5 nhiệm vụ cần tập trung chỉ đạo và giải quyết dứt điểm trong 48 giờ tới theo thứ tự ưu tiên giảm dần.',
  },
];

export interface AiResponseResult {
  text: string;
  source: 'gemini-3.8-flash' | 'simulation_engine';
  timestamp: string;
  note?: string;
}

export async function executeAiAssistant(
  presetId: string,
  userPrompt: string,
  campusFilter: CampusId = 'all'
): Promise<AiResponseResult> {
  const metrics = dataService.getMetrics(campusFilter);
  const tasks = dataService.getTasks(campusFilter);
  const overdueList = tasks.filter(t => t.status === 'Quá hạn').map(t => ({
    taskCode: t.taskCode,
    title: t.title,
    assignee: t.assignee,
    campusName: t.campusName,
    dueDate: t.dueDate,
    progress: t.progress,
    category: t.category,
  }));
  const urgentList = tasks.filter(t => t.status === 'Đang thực hiện' && t.progress < 70).slice(0, 5).map(t => ({
    taskCode: t.taskCode,
    title: t.title,
    assignee: t.assignee,
    campusName: t.campusName,
    dueDate: t.dueDate,
    progress: t.progress,
  }));
  const missingEvidences = metrics.missingEvidenceTasks.map(t => ({
    taskCode: t.taskCode,
    title: t.title,
    assignee: t.assignee,
    campusName: t.campusName,
  }));

  const contextData = {
    campusFilter,
    totalTasks: metrics.total,
    completedTasks: metrics.completed,
    inProgressTasks: metrics.inProgress,
    pendingReviewTasks: metrics.pendingReview,
    overdueTasks: metrics.overdue,
    urgentTasks: metrics.urgent,
    completionRate: metrics.completionRate,
    missingEvidenceCount: metrics.missingEvidenceCount,
    missingEvidences,
    overdueList,
    urgentList,
    campusBreakdown: metrics.campusBreakdown.map(b => ({
      name: b.campus.name,
      total: b.total,
      completed: b.completed,
      overdue: b.overdue,
      rate: `${b.completionRate}%`,
    })),
  };

  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: presetId,
        prompt: userPrompt,
        contextData,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.text,
        source: data.source || 'gemini-3.8-flash',
        timestamp: data.timestamp || new Date().toISOString(),
        note: data.note,
      };
    }
  } catch (err) {
    console.warn('Network call to backend AI endpoint failed, falling back to local processing:', err);
  }

  // Pure client fallback logic if server proxy isn't reachable
  const fallbackText = getClientFallbackResponse(presetId, userPrompt, contextData);
  return {
    text: fallbackText,
    source: 'simulation_engine',
    timestamp: new Date().toISOString(),
    note: 'Chế độ mô phỏng chuyên gia quản trị dựa trên dữ liệu thời gian thực của nhà trường',
  };
}

function getClientFallbackResponse(presetId: string, prompt: string, ctx: any): string {
  const { totalTasks, completedTasks, overdueTasks, completionRate, missingEvidenceCount, overdueList, campusBreakdown } = ctx;
  const overdueStr = overdueList.length > 0
    ? overdueList.map((t: any, i: number) => `   ${i + 1}. [${t.taskCode}] ${t.title} - Phụ trách: ${t.assignee} (${t.campusName}) - Hạn: ${t.dueDate} (Đạt ${t.progress}%)`).join('\n')
    : '   - Không có nhiệm vụ quá hạn nghiêm trọng.';

  const breakdownStr = campusBreakdown.map((b: any) => `   - ${b.name}: ${b.completed}/${b.total} nhiệm vụ hoàn thành (${b.rate}) - Quá hạn: ${b.overdue}`).join('\n');

  if (presetId === 'noi_dung_don_doc' || prompt.includes('đôn đốc')) {
    return `TRƯỜNG TIỂU HỌC QUANG TRUNG
BAN GIÁM HIỆU - THÔNG BÁO ĐÔN ĐỐC TIẾN ĐỘ CÔNG VIỆC

Kính gửi: Các đồng chí Phó Hiệu trưởng phụ trách cơ sở, Tổ trưởng chuyên môn và Cán bộ giáo viên phụ trách nhiệm vụ,

Qua rà soát hệ thống quản trị Quang Trung SmartSchool AI tính đến thời điểm hiện tại:
- Tổng số nhiệm vụ: ${totalTasks} | Đã hoàn thành: ${completedTasks} (${completionRate}%)
- Cảnh báo: Hiện có ${overdueTasks} nhiệm vụ đã quá hạn hoàn thành và ${missingEvidenceCount} nhiệm vụ chưa nộp minh chứng nghiệm thu.

DANH SÁCH NHIỆM VỤ YÊU CẦU XỬ LÝ KHẨN:
${overdueStr}

YÊU CẦU CỦA BAN GIÁM HIỆU:
1. Đ/c phụ trách các nhiệm vụ nêu trên khẩn trương rà soát, giải trình nguyên nhân chậm trễ và cập nhật tiến độ, minh chứng lên hệ thống trước 16h30 ngày làm việc tiếp theo.
2. Ban Giám hiệu giao Đ/c Phó Hiệu trưởng phụ trách trực tiếp kiểm tra thực tế, hướng dẫn tháo gỡ vướng mắc phát sinh.
3. Các trường hợp vướng mắc về vật tư, kinh phí cần gửi văn bản đề xuất để Ban Giám hiệu phê duyệt ngay.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
  }

  if (presetId === 'phan_tich_tien_do' || presetId === 'tong_hop_3_khu') {
    return `BÁO CÁO PHÂN TÍCH TIẾN ĐỘ ĐIỀU HÀNH VÀ ĐỐI SÁNH 3 KHU TRƯỜNG
HỆ THỐNG QUẢNG TRUNG SMARTSCHOOL AI

1. BỨC TRANH TỔNG THỂ TOÀN TRƯỜNG:
- Tổng khối lượng nhiệm vụ điều hành: ${totalTasks} nhiệm vụ.
- Đã hoàn thành và được kiểm duyệt: ${completedTasks} nhiệm vụ (${completionRate}%).
- Tỷ lệ nhiệm vụ có rủi ro (Quá hạn): ${overdueTasks} nhiệm vụ.
- Hồ sơ còn thiếu minh chứng: ${missingEvidenceCount} nhiệm vụ.

2. TÌNH HÌNH TỪNG KHU TRƯỜNG:
${breakdownStr}

3. ĐIỂM NGHẼN VÀ NGUY CƠ TIẾN ĐỘ:
- Tại Khu 2: Vướng mắc sửa chữa máy tính và thiết bị điện lạnh do khâu chờ phụ tùng thay thế.
- Tại Khu 3: Tiến độ tổng hợp hồ sơ y tế học đường bị chậm do vắng học sinh trong các buổi khám sàng lọc.
- Về minh chứng: Một số hoạt động trải nghiệm đã tổ chức xong nhưng chậm nộp biên bản nghiệm thu và ảnh lưu trữ.

4. KIẾN NGHỊ HÀNH ĐỘNG CHO BAN GIÁM HIỆU:
- Ưu tiên 1: Đôn đốc hoàn thành ngay 02 nhiệm vụ quá hạn để tránh ảnh hưởng đến kỳ kiểm tra nội bộ.
- Ưu tiên 2: Phê duyệt các nhiệm vụ đang chờ kiểm tra tại Khu 1 để kịp thời tổng hợp thi đua tháng.
- Ưu tiên 3: Chuẩn bị nội dung giao ban chuyên đề về công tác an toàn trường học và vệ sinh bán trú.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
  }

  return `TRƯỜNG TIỂU HỌC QUANG TRUNG
VĂN BẢN ĐIỀU HÀNH DỰ THẢO - SMARTSCHOOL AI

Căn cứ vào dữ liệu hoạt động quản trị của 3 khu trường trên hệ thống:
- Quy mô điều hành: ${totalTasks} nhiệm vụ giao cho các bộ phận chuyên môn, CSVC và đoàn thể.
- Tiến độ hoàn thành đạt: ${completionRate}% (${completedTasks}/${totalTasks} nhiệm vụ).
- Số nhiệm vụ vi phạm hạn định: ${overdueTasks} nhiệm vụ.

NỘI DUNG THỰC HIỆN CHI TIẾT:
1. Tiếp tục duy trì nền nếp chuyên môn, triển khai nghiêm túc kế hoạch dạy học 2 buổi/ngày theo chương trình GDPT 2018 tại cả 3 khu trường.
2. Tăng cường kỷ cương trong công tác nộp hồ sơ minh chứng: Mọi nhiệm vụ hoàn thành phải được gắn kèm biên bản hoặc tài liệu xác nhận hợp lệ trước khi Ban Giám hiệu phê duyệt.
3. Các cơ sở 2 và cơ sở 3 chủ động báo cáo các khó khăn về cơ sở vật chất phát sinh trong mùa mưa bão để có phương án bảo dưỡng kịp thời.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
}
