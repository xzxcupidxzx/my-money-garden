# 🏠 Self-Host Finance App on NAS

## Yêu cầu

- **NAS** với Docker & Docker Compose
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Storage**: 10GB+ cho database và volumes
- **Cloudflare Zero Trust** đã cấu hình

## Cài đặt

### 1. Clone Repository

```bash
# SSH vào NAS
ssh user@your-nas-ip

# Clone repo
git clone https://github.com/your-username/finance-app.git
cd finance-app
```

### 2. Cấu hình Environment

```bash
# Copy file .env mẫu
cp docs/self-host/.env.example .env

# Chỉnh sửa .env
nano .env
```

### 3. Generate JWT Secret & API Keys

```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate API Keys - sử dụng tool online hoặc script
# https://supabase.com/docs/guides/self-hosting#api-keys
```

### 4. Khởi động Services

```bash
# Di chuyển docker-compose.yml đến thư mục root
cp docs/self-host/docker-compose.yml ./

# Khởi động
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f
```

### 5. Cấu hình Cloudflare Zero Trust

1. Vào Cloudflare Dashboard → Zero Trust
2. Thêm Application mới:
   - **Type**: Self-hosted
   - **Application domain**: finance.your-domain.com
   - **Origin URL**: http://your-nas-internal-ip:3000
3. Thêm Access Policy cho các thành viên

### 6. Export Data từ Lovable Cloud

```sql
-- Chạy trong Lovable Cloud → Run SQL
-- Export transactions
SELECT * FROM transactions;
-- Export categories
SELECT * FROM categories;
-- ... (export các bảng khác)
```

Sau đó import vào self-hosted database.

## Ports

| Service | Port | Mô tả |
|---------|------|-------|
| Frontend | 3000 | Web App |
| Supabase API | 8000 | API Gateway |
| Studio | 3001 | Database Admin |
| PostgreSQL | 5432 | Database |

## Backup

```bash
# Backup database
docker exec finance-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i finance-db psql -U postgres postgres < backup_20240101.sql
```

## Troubleshooting

### Lỗi kết nối database
```bash
docker-compose logs db
docker exec -it finance-db psql -U postgres
```

### Lỗi auth
```bash
docker-compose logs auth
```

### Restart services
```bash
docker-compose restart
```

## Cấu trúc thư mục

```
your-nas/
├── finance-app/
│   ├── docker-compose.yml
│   ├── .env
│   ├── Dockerfile
│   └── volumes/
│       ├── db/data/          # PostgreSQL data
│       └── storage/          # File storage
```

## Về Authentication với Cloudflare Zero Trust

Vì Cloudflare Zero Trust đã xử lý authentication ở tầng network, bạn có thể:

1. **Giữ nguyên Supabase Auth**: Mỗi người trong gia đình có tài khoản riêng → data riêng biệt
2. **Bỏ Supabase Auth**: Tạo một user chung cho cả nhà (đơn giản hơn nhưng không phân biệt user)

**Khuyến nghị**: Giữ Supabase Auth vì app đang dùng RLS dựa trên `user_id` để phân biệt data của từng người.
