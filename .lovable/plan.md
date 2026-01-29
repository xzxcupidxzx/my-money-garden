
# Kế hoạch Tích hợp DeepSeek AI vào Finance Tracker

## Tổng quan

Thay thế regex parser hiện tại bằng API DeepSeek thực sự từ Cloudflare Worker của bạn, đồng thời giữ lại các tính năng hay từ code cũ như:
- Hệ thống note queue (pending → processing → success/failed)  
- Tự học category từ lịch sử
- Cho phép chỉnh sửa note trước khi xử lý

---

## Chi tiết kỹ thuật

### Bước 1: Tạo Edge Function proxy

Tạo edge function `parse-note` để gọi Cloudflare Worker, tránh CORS và bảo mật endpoint.

**File**: `supabase/functions/parse-note/index.ts`

```text
Flow:
Frontend → Edge Function → Cloudflare Worker (deepseek) → Response
```

Edge function sẽ:
- Nhận text + categories + accounts từ frontend
- Gọi `https://deepseek.hoangthaison2812.workers.dev`
- Xử lý response và trả về cho frontend

### Bước 2: Tạo hooks mới

**File**: `src/hooks/useAiNotes.ts`

- Quản lý state notes với status: pending | processing | success | failed
- Lưu vào database `ai_notes` thay vì localStorage
- Hàm `processNote()` gọi edge function
- Hàm `learnCategoryFromHistory()` copy từ code cũ

### Bước 3: Cập nhật Database Schema

Sửa table `ai_notes` để hỗ trợ workflow mới:

```sql
ALTER TABLE ai_notes
  ADD COLUMN IF NOT EXISTS error_message text;
```

### Bước 4: Cập nhật UI (AiNote.tsx)

Redesign UI theo flow mới:

```text
┌─────────────────────────────────────────┐
│  📝 Nhập ghi chú                        │
│  ┌─────────────────────────────────────┐│
│  │ ăn sáng 50k, taxi grab 100k        ││
│  └─────────────────────────────────────┘│
│  [💾 Lưu Ghi Chú] [⚡ Xử lý tất cả]    │
├─────────────────────────────────────────┤
│  📋 Danh sách ghi chú                   │
├─────────────────────────────────────────┤
│  🕐 Pending                             │
│  ┌─────────────────────────────────────┐│
│  │ "ăn sáng 50k"  [✏️] [🔮] [🗑️]     ││
│  └─────────────────────────────────────┘│
│  ✅ Đã xử lý                            │
│  ┌─────────────────────────────────────┐│
│  │ Ăn uống: -50,000 ✓                 ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Tính năng UI mới:**
- Nút Lưu: Chỉ lưu note vào queue (pending)
- Nút Xử lý AI: Gọi DeepSeek và tạo giao dịch
- Nút Sửa: Đưa text lên input để chỉnh sửa
- Status badges: pending/processing/success/failed

### Bước 5: Tính năng Tự học Category

Port logic `learnCategoryFromHistory` vào hook:

```typescript
// Tìm category phổ biến nhất từ các giao dịch cũ có mô tả tương tự
const learnCategoryFromHistory = (
  description: string, 
  aiSuggestedCategory: string,
  type: 'income' | 'expense',
  transactions: Transaction[]
) => {
  // Match keywords trong description với history
  // Trả về category có score cao nhất
}
```

---

## Cấu trúc Files

```text
supabase/functions/
  └── parse-note/
      └── index.ts          # Edge function gọi DeepSeek

src/
  ├── hooks/
  │   └── useAiNotes.ts     # Hook quản lý AI notes
  └── pages/
      └── AiNote.tsx        # UI cập nhật
```

---

## Response Format từ DeepSeek

```typescript
interface DeepSeekTransaction {
  type: 'Thu' | 'Chi' | 'Transfer';
  amount: number;
  category: string;        // Tên category (string)
  account: string;         // Tên account (string)  
  description: string;
  datetime?: string;       // ISO format
  toAccount?: string;      // Nếu Transfer
}
```

**Lưu ý mapping**: 
- `"Thu"` → `"income"`
- `"Chi"` → `"expense"`
- Category/Account name → lookup ID từ database

---

## Ưu điểm phương án này

1. **Tận dụng AI thật**: DeepSeek hiểu ngữ cảnh tốt hơn regex
2. **Giữ code đã chạy tốt**: Không đổi Cloudflare Worker
3. **Tự học**: Category ngày càng chính xác
4. **Linh hoạt**: Cho sửa/xóa note trước khi xử lý
5. **Không cần API key**: Worker public, không tốn chi phí AI
6. **Bảo mật**: Edge function proxy, không expose endpoint trực tiếp

---

## Rủi ro và Mitigation

| Rủi ro | Giải pháp |
|--------|-----------|
| Worker down | Fallback về regex parser hiện tại |
| Response không đúng format | Validate + error handling |
| CORS | Edge function làm proxy |
| Rate limit | Debounce + queue processing |
