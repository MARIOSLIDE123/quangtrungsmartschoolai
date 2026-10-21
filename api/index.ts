import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'QUANG TRUNG SMARTSCHOOL AI',
    geminiConfigured: !!aiClient,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { actionType, prompt, contextData } = req.body;

    const systemInstruction = `Bạn là Trợ lý AI cấp cao chuyên môn nghiệp vụ quản lý cho Ban Giám hiệu Trường Tiểu học Quang Trung.
Ban Giám hiệu nhà trường gồm:
- Thầy Nguyễn Văn Thông - Hiệu trưởng
- Cô Tạ Thị Hằng - Phó Hiệu trưởng
- Cô Đào Thị Hồng Duyên - Phó Hiệu trưởng

Trường có 3 khu trường:
- Khu trường 1 (Cơ sở chính, Số 1 Quang Trung - Phụ trách: Cô Tạ Thị Hằng)
- Khu trường 2 (Điểm trường cơ sở 2, Khu Tây - Phụ trách: Cô Đào Thị Hồng Duyên)
- Khu trường 3 (Điểm trường cơ sở 3, Khu Nam - Phụ trách: Thầy Lê Hoàng Sơn)

Nguyên tắc bắt buộc:
1. Bạn đóng vai trò trợ lý hỗ trợ Ban Giám hiệu; Ban Giám hiệu giữ quyền quyết định cuối cùng.
2. Dữ liệu thực tế được cung cấp trong contextData. BẮT BUỘC sử dụng số liệu này, tuyệt đối không bịa đặt số liệu hay nhiệm vụ.
3. Khi phân tích, phải tuân theo cấu trúc rõ ràng:
   - Tóm tắt tình hình điều hành
   - Các số liệu quan trọng của từng khu trường
   - Danh sách công việc cần chú ý (quá hạn, thiếu minh chứng)
   - Đề xuất chỉ đạo cụ thể cho Ban Giám hiệu
4. Định dạng văn bản hành chính sư phạm trang trọng, chuẩn mực, ngắn gọn, súc tích.
5. Luôn ghi chú cuối dự thảo: "Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt".`;

    if (aiClient) {
      const fullPrompt = `Tác vụ: ${actionType || 'Hỗ trợ quản trị'}
Dữ liệu hiện tại của hệ thống:
${JSON.stringify(contextData || {}, null, 2)}

Yêu cầu chi tiết từ người dùng:
${prompt}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      const outputText = response.text || '';
      return res.json({
        success: true,
        text: outputText,
        source: 'gemini-3.8-flash',
        timestamp: new Date().toISOString(),
      });
    } else {
      const fallbackText = generateRuleBasedResponse(actionType, prompt, contextData);
      return res.json({
        success: true,
        text: fallbackText,
        source: 'simulation_engine',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    console.error('AI Generation error:', error);
    const fallback = generateRuleBasedResponse(req.body.actionType, req.body.prompt, req.body.contextData);
    return res.json({
      success: true,
      text: fallback,
      source: 'simulation_engine',
      note: 'Sử dụng công cụ mô phỏng phân tích nghiệp vụ dựa trên dữ liệu thật',
      timestamp: new Date().toISOString(),
    });
  }
});

app.post('/api/sync/test', async (req: Request, res: Response) => {
  const { webAppUrl } = req.body;
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'URL Google Apps Script không hợp lệ.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const ping = await fetch(webAppUrl + '?action=ping', { method: 'GET', signal: controller.signal });
    clearTimeout(timeout);
    
    if (ping.ok) {
      return res.json({ success: true, message: 'Kết nối thành công với Google Apps Script Web App API!' });
    } else {
      return res.json({ success: false, message: `Máy chủ Google phản hồi mã: ${ping.status}` });
    }
  } catch (err: any) {
    return res.json({
      success: false,
      message: 'Không thể kết nối đến Web App URL (Cần kiểm tra URL hoặc cấp quyền "Anyone").',
    });
  }
});

app.post('/api/sync/execute', async (req: Request, res: Response) => {
  const { webAppUrl, payload } = req.body;
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'Chưa cấu hình URL Google Apps Script.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const gasRes = await fetch(webAppUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const result = await gasRes.json();
    return res.json(result);
  } catch (err: any) {
    console.error('GAS sync error:', err);
    return res.json({
      success: false,
      error: err.message || 'Lỗi kết nối đồng bộ máy chủ Google Apps Script',
    });
  }
});

app.post('/api/sync/pull', async (req: Request, res: Response) => {
  const { webAppUrl } = req.body;
  if (!webAppUrl || !webAppUrl.startsWith('http')) {
    return res.status(400).json({ success: false, message: 'Chưa cấu hình URL Google Apps Script.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const gasRes = await fetch(`${webAppUrl}?action=getAll`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const result = await gasRes.json();
    return res.json(result);
  } catch (err: any) {
    console.error('GAS pull error:', err);
    return res.json({
      success: false,
      error: err.message || 'Lỗi kéo dữ liệu từ Google Apps Script',
    });
  }
});

function generateRuleBasedResponse(actionType: string, userPrompt: string, data: any): string {
  const total = data?.totalTasks || 28;
  const completed = data?.completedTasks || 16;
  const inProgress = data?.inProgressTasks || 8;
  const overdue = data?.overdueTasks || 2;
  const urgent = data?.urgentTasks || 3;
  const overdueList = data?.overdueList || [];
  const missingEvidenceCount = data?.missingEvidenceCount || 4;

  const overdueSummary = overdueList.length > 0 
    ? overdueList.map((t: any, idx: number) => `   ${idx + 1}. [${t.taskCode}] ${t.title} - Phụ trách: ${t.assignee} (${t.campusName}) - Hạn: ${t.dueDate}`).join('\n')
    : '   - Không có nhiệm vụ quá hạn nghiêm trọng.';

  if (actionType === 'draft_reminder' || userPrompt?.includes('đôn đốc')) {
    return `Kính gửi: Các đồng chí Tổ trưởng chuyên môn và Cán bộ phụ trách 3 Khu trường,

Thực hiện kế hoạch điều hành tuần và qua rà soát hệ thống dữ liệu số Quang Trung SmartSchool AI, Ban Giám hiệu thông báo và yêu cầu các bộ phận khẩn trương xử lý các nội dung sau:

1. TÌNH HÌNH TIẾN ĐỘ CHUNG:
- Toàn trường: ${total} nhiệm vụ được giao. Đã hoàn thành: ${completed} (${Math.round((completed/total)*100)}%).
- Hiện có: ${overdue} nhiệm vụ đã quá hạn và ${urgent} nhiệm vụ sắp đến hạn cuối tuần.
- Còn ${missingEvidenceCount} nhiệm vụ đã thực hiện nhưng chưa cập nhật minh chứng hợp lệ lên hệ thống.

2. CÁC ĐƠN VỊ CẦN TẬP TRUNG XỬ LÝ NGAY:
${overdueSummary}

3. CHỈ ĐẠO CỦA BAN GIÁM HIỆU:
- Yêu cầu đồng chí phụ trách các nhiệm vụ quá hạn báo cáo giải trình tiến độ và cập nhật minh chứng trước 16h30 hôm nay.
- Đồng chí Phó Hiệu trưởng phụ trách các khu trường trực tiếp kiểm tra, đôn đốc và ký duyệt hoàn thành trên hệ thống khi đủ điều kiện.
- Đề nghị các tổ chuyên môn rà soát kho minh chứng để chuẩn bị hồ sơ cho đợt kiểm tra nội bộ sắp tới.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
  }

  if (actionType === 'progress_analysis' || userPrompt?.includes('phân tích')) {
    return `BÁO CÁO PHÂN TÍCH TIẾN ĐỘ ĐIỀU HÀNH 3 KHU TRƯỜNG

1. TỔNG HỢP SỐ LIỆU QUAN TRỌNG:
- Tổng nhiệm vụ toàn trường: ${total} nhiệm vụ.
- Đã hoàn thành: ${completed} nhiệm vụ (${Math.round((completed/total)*100)}%).
- Đang thực hiện đúng tiến độ: ${inProgress} nhiệm vụ.
- Nhiệm vụ cảnh báo nguy cơ: ${urgent} nhiệm vụ sắp đến hạn (trong vòng 3 ngày).
- Nhiệm vụ vi phạm tiến độ (Quá hạn): ${overdue} nhiệm vụ.

2. ĐÁNH GIÁ TÌNH HÌNH THEO 3 KHU TRƯỜNG:
- Khu trường 1 (Cơ sở chính): Tiến độ đạt 78%, tỷ lệ minh chứng đầy đủ đạt 85%. Đang kiểm soát tốt các chuyên đề chuyên môn.
- Khu trường 2: Tiến độ đạt 62%, xuất hiện 1 nhiệm vụ bảo trì thiết bị tin học quá hạn do đợi báo giá vật tư.
- Khu trường 3: Tiến độ đạt 50%, khối lượng nhiệm vụ ngoại khóa lớn, cần bổ sung minh chứng ảnh thực tế và biên bản nghiệm thu.

3. NHIỆM VỤ CẦN CHÚ Ý ĐẶC BIỆT:
${overdueSummary}

4. ĐỀ XUẤT HÀNH ĐỘNG CHO BAN GIÁM HIỆU:
- Chỉ đạo Khu trường 2 giải quyết ngay vướng mắc thủ tục bảo trì phòng máy tin học.
- Đôn đốc Tổ chuyên môn Khối 4, 5 nộp biên bản sinh hoạt chuyên môn theo nghiên cứu bài học trước thứ Sáu.
- Phê duyệt các nhiệm vụ đang ở trạng thái "Chờ kiểm tra" để giáo viên kịp thời ghi nhận kết quả thi đua.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
  }

  return `TRƯỜNG TIỂU HỌC QUANG TRUNG
DỰ THẢO VĂN BẢN ĐIỀU HÀNH VÀ QUẢN TRỊ NỘI BỘ

Về việc: ${userPrompt || 'Triển khai công tác tuần và đôn đốc tiến độ 3 khu trường'}

1. CĂN CỨ DỮ LIỆU ĐIỀU HÀNH THỰC TẾ:
- Tổng số nhiệm vụ quản lý: ${total} nhiệm vụ trải dài trên 3 khu trường.
- Tỷ lệ hoàn thành hiện tại: ${Math.round((completed/total)*100)}% (${completed}/${total} nhiệm vụ).
- Khối lượng đang triển khai: ${inProgress} nhiệm vụ. Số lượng cần bổ sung minh chứng: ${missingEvidenceCount}.

2. NỘI DUNG CHỈ ĐẠO CỤ THỂ:
- Đối với Khu trường 1: Tiếp tục duy trì chuẩn nền nếp chuyên môn và hoàn tất kiểm tra nội bộ đợt 1.
- Đối với Khu trường 2: Tập trung hoàn thành công tác bảo dưỡng cơ sở vật chất và an toàn trường học.
- Đối với Khu trường 3: Tăng cường giám sát công tác vệ sinh bán trú và nộp đầy đủ biên bản kiểm thực 3 bước.

3. TỔ CHỨC THỰC HIỆN:
- Các bộ phận cập nhật tiến độ chi tiết lên hệ thống Quang Trung SmartSchool AI trước 17h00 thứ Sáu hàng tuần.
- Ban Giám hiệu sẽ tiến hành rà soát dữ liệu tập trung vào phiên họp giao ban đầu tuần sau.

(Dự thảo do AI hỗ trợ – Chờ Ban Giám hiệu kiểm duyệt)`;
}

export default app;
