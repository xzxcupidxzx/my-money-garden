# 🚀 Hướng Dẫn Chi Tiết Self-Host Finance App Trên NAS

## Mục Lục
1. [Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
2. [Kết Nối GitHub](#2-kết-nối-github)
3. [Clone Repo Về NAS](#3-clone-repo-về-nas)
4. [Tạo JWT Secret & API Keys](#4-tạo-jwt-secret--api-keys)
5. [Cấu Hình Environment](#5-cấu-hình-environment)
6. [Export Data Từ Lovable Cloud](#6-export-data-từ-lovable-cloud)
7. [Khởi Động Docker](#7-khởi-động-docker)
8. [Import Data Vào Database](#8-import-data-vào-database)
9. [Cấu Hình Cloudflare Zero Trust](#9-cấu-hình-cloudflare-zero-trust)
10. [Kiểm Tra & Xử Lý Lỗi](#10-kiểm-tra--xử-lý-lỗi)
11. [Backup & Maintenance](#11-backup--maintenance)

---

## 1. Yêu Cầu Hệ Thống

### Phần Cứng NAS
| Yêu cầu | Tối thiểu | Khuyến nghị |
|---------|-----------|-------------|
| RAM | 4GB | 8GB+ |
| Storage | 10GB | 50GB+ |
| CPU | 2 cores | 4 cores |

### Phần Mềm
- Docker & Docker Compose đã cài đặt
- Git đã cài đặt
- SSH access vào NAS
- Cloudflare Zero Trust đã có tài khoản

### Kiểm tra Docker
```bash
# SSH vào NAS
ssh user@your-nas-ip

# Kiểm tra Docker
docker --version
docker-compose --version
```

---

## 2. Kết Nối GitHub

### Bước 2.1: Kết nối Lovable với GitHub
1. Trong Lovable Editor, click vào **Project Settings** (⚙️ góc trên phải)
2. Chọn tab **GitHub**
3. Click **Connect to GitHub**
4. Authorize Lovable GitHub App
5. Chọn tài khoản GitHub của bạn
6. Click **Create Repository** để tạo repo mới

### Bước 2.2: Lấy URL Repository
Sau khi tạo xong, bạn sẽ có URL dạng:
```
https://github.com/your-username/finance-app.git
```

---

## 3. Clone Repo Về NAS

### Bước 3.1: SSH vào NAS
```bash
ssh user@your-nas-ip
```

### Bước 3.2: Tạo thư mục và clone
```bash
# Tạo thư mục cho app
mkdir -p ~/apps
cd ~/apps

# Clone repository
git clone https://github.com/your-username/finance-app.git
cd finance-app
```

### Bước 3.3: Tạo cấu trúc thư mục data
```bash
# Tạo folder .data để lưu trữ
mkdir -p .data/db
mkdir -p .data/storage
mkdir -p .data/backups

# Set permissions
chmod -R 755 .data
```

### Bước 3.4: Copy files cần thiết
```bash
# Copy docker-compose.yml ra root
cp docs/self-host/docker-compose.yml ./

# Copy Dockerfile ra root
cp docs/self-host/Dockerfile ./

# Copy backup script
cp docs/self-host/backup.sh ./
chmod +x backup.sh
```

---

## 4. Tạo JWT Secret & API Keys

### Bước 4.1: Tạo JWT Secret
```bash
# Chạy lệnh này để tạo JWT Secret (32+ ký tự)
openssl rand -base64 32
```
**Kết quả ví dụ:** `K9xH2mN4pR7tY0wZ3aB6cD8eF1gH4iJ7`

**Lưu lại giá trị này!**

### Bước 4.2: Tạo API Keys

Bạn cần tạo 2 keys: **ANON_KEY** và **SERVICE_ROLE_KEY**

#### Cách 1: Sử dụng tool online (đơn giản)
1. Truy cập: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys
2. Nhập JWT Secret vừa tạo
3. Copy ANON_KEY và SERVICE_ROLE_KEY

#### Cách 2: Sử dụng script (nâng cao)
```bash
# Cài đặt jwt-cli nếu chưa có
npm install -g jwt-cli

# Thay YOUR_JWT_SECRET bằng secret vừa tạo
JWT_SECRET="YOUR_JWT_SECRET"

# Tạo ANON_KEY
jwt encode --secret "$JWT_SECRET" '{"role":"anon","iss":"supabase","iat":1735689600,"exp":2051222400}'

# Tạo SERVICE_ROLE_KEY
jwt encode --secret "$JWT_SECRET" '{"role":"service_role","iss":"supabase","iat":1735689600,"exp":2051222400}'
```

### Bước 4.3: Lưu lại các giá trị
Tạo file tạm để lưu (sẽ xóa sau):
```bash
cat > ~/my-secrets.txt << EOF
JWT_SECRET=your-jwt-secret-here
ANON_KEY=your-anon-key-here
SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

---

## 5. Cấu Hình Environment

### Bước 5.1: Tạo file .env
```bash
cd ~/apps/finance-app

# Copy template
cp docs/self-host/.env.example .env

# Mở file để chỉnh sửa
nano .env
```

### Bước 5.2: Điền các giá trị

```env
# =============================================
# POSTGRES DATABASE
# =============================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-super-secure-database-password-here
POSTGRES_DB=postgres

# =============================================
# SUPABASE SECRETS (từ bước 4)
# =============================================
JWT_SECRET=your-jwt-secret-from-step-4
ANON_KEY=your-anon-key-from-step-4
SERVICE_ROLE_KEY=your-service-role-key-from-step-4

# =============================================
# URLs - Thay your-nas-ip bằng IP thực của NAS
# =============================================
API_EXTERNAL_URL=http://192.168.1.100:8000
SUPABASE_PUBLIC_URL=http://192.168.1.100:8000
SITE_URL=http://192.168.1.100:3000
ADDITIONAL_REDIRECT_URLS=http://192.168.1.100:3000

# =============================================
# SMTP (Tùy chọn - cho email verification)
# =============================================
# Nếu không cần gửi email, có thể bỏ qua phần này
# GOTRUE_MAILER_AUTOCONFIRM=true sẽ tự động confirm
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_ADMIN_EMAIL=your-email@gmail.com

# =============================================
# DASHBOARD (cho Supabase Studio)
# =============================================
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=your-studio-password

# =============================================
# SIGNUP SETTINGS
# =============================================
# Set true nếu muốn tắt đăng ký mới (vì đã có Cloudflare Zero Trust)
DISABLE_SIGNUP=false
```

### Bước 5.3: Lưu và đóng file
- Nhấn `Ctrl + X`
- Nhấn `Y` để confirm
- Nhấn `Enter` để lưu

### Bước 5.4: Xóa file secrets tạm
```bash
rm ~/my-secrets.txt
```

---

## 6. Export Data Từ Lovable Cloud

### Bước 6.1: Truy cập Cloud Dashboard
Trong Lovable Editor, mở Cloud Dashboard để chạy SQL queries.

### Bước 6.2: Export từng bảng

Chạy các query sau và lưu kết quả:

#### Export Profiles
```sql
SELECT * FROM profiles;
```

#### Export Accounts
```sql
SELECT * FROM accounts;
```

#### Export Categories
```sql
SELECT * FROM categories;
```

#### Export Transactions
```sql
SELECT * FROM transactions;
```

#### Export Budgets
```sql
SELECT * FROM budgets;
```

#### Export Recurring Transactions
```sql
SELECT * FROM recurring_transactions;
```

#### Export Installments
```sql
SELECT * FROM installments;
```

#### Export Tenants (nếu có)
```sql
SELECT * FROM tenants;
```

#### Export Utility Meters (nếu có)
```sql
SELECT * FROM utility_meters;
```

#### Export Utility Bills (nếu có)
```sql
SELECT * FROM utility_bills;
```

### Bước 6.3: Lưu kết quả
Lưu mỗi kết quả thành file JSON hoặc CSV. Bạn có thể dùng tính năng Export trong app hoặc copy kết quả query.

---

## 7. Khởi Động Docker

### Bước 7.1: Kiểm tra cấu trúc thư mục
```bash
cd ~/apps/finance-app
ls -la
```

Đảm bảo có các files:
```
.
├── .data/
│   ├── db/
│   ├── storage/
│   └── backups/
├── .env
├── docker-compose.yml
├── Dockerfile
├── docs/
│   └── self-host/
│       ├── 01-database-schema.sql
│       ├── kong.yml
│       └── nginx.conf
└── ... (source code)
```

### Bước 7.2: Build và khởi động
```bash
# Build images
docker-compose build

# Khởi động tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f
```

### Bước 7.3: Chờ services khởi động
Quá trình khởi động mất khoảng 2-5 phút. Xem logs để đảm bảo không có lỗi.

```bash
# Kiểm tra trạng thái containers
docker-compose ps
```

Kết quả mong đợi:
```
NAME              STATUS    PORTS
finance-app       Up        0.0.0.0:3000->80/tcp
finance-auth      Up        9999/tcp
finance-db        Up        0.0.0.0:5432->5432/tcp
finance-kong      Up        0.0.0.0:8000->8000/tcp
finance-meta      Up        8080/tcp
finance-realtime  Up        4000/tcp
finance-rest      Up        3000/tcp
finance-storage   Up        5000/tcp
finance-studio    Up        0.0.0.0:3001->3000/tcp
```

### Bước 7.4: Kiểm tra nhanh
```bash
# Test API
curl http://localhost:8000/rest/v1/

# Test Frontend
curl http://localhost:3000
```

---

## 8. Import Data Vào Database

### Bước 8.1: Kết nối vào database
```bash
docker exec -it finance-db psql -U postgres
```

### Bước 8.2: Import data

#### Tạo user mới (thay thế user từ Lovable Cloud)
```sql
-- Tạo user trong auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'your-email@example.com',
  crypt('your-password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Your Name"}'::jsonb
);

-- Lấy user_id vừa tạo
SELECT id FROM auth.users WHERE email = 'your-email@example.com';
```

#### Import Profiles
```sql
-- Thay YOUR_USER_ID bằng id từ query trên
INSERT INTO public.profiles (user_id, full_name, default_currency)
VALUES ('YOUR_USER_ID', 'Your Name', 'VND');
```

#### Import Accounts
```sql
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES 
  ('YOUR_USER_ID', 'Tiền mặt', 'cash', 1000000, 'VND', '#22c55e', 'Wallet'),
  ('YOUR_USER_ID', 'Ngân hàng', 'bank', 5000000, 'VND', '#3b82f6', 'Building');
```

#### Import Categories
```sql
INSERT INTO public.categories (user_id, name, type, icon, color)
VALUES 
  ('YOUR_USER_ID', 'Ăn uống', 'expense', 'Utensils', '#ef4444'),
  ('YOUR_USER_ID', 'Di chuyển', 'expense', 'Car', '#f97316'),
  ('YOUR_USER_ID', 'Lương', 'income', 'Briefcase', '#22c55e');
```

#### Import Transactions (ví dụ)
```sql
INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description, date)
VALUES 
  ('YOUR_USER_ID', 'ACCOUNT_ID', 'CATEGORY_ID', 'expense', 50000, 'Ăn sáng', '2024-01-15');
```

### Bước 8.3: Thoát khỏi psql
```sql
\q
```

---

## 9. Cấu Hình Cloudflare Zero Trust

### Bước 9.1: Đăng nhập Cloudflare Dashboard
1. Truy cập: https://one.dash.cloudflare.com
2. Chọn **Zero Trust**

### Bước 9.2: Thêm Application
1. Vào **Access** → **Applications**
2. Click **Add an application**
3. Chọn **Self-hosted**

### Bước 9.3: Cấu hình Application

| Field | Value |
|-------|-------|
| Application name | Finance App |
| Session Duration | 24 hours |
| Application domain | finance.your-domain.com |

### Bước 9.4: Cấu hình Origin
1. Vào **Tunnels** → Tạo tunnel mới hoặc dùng tunnel có sẵn
2. Public hostname: `finance.your-domain.com`
3. Service: `http://your-nas-internal-ip:3000`

### Bước 9.5: Thêm Access Policy
1. Vào **Access** → **Applications** → Finance App → **Policies**
2. Click **Add a policy**

| Field | Value |
|-------|-------|
| Policy name | Family Members |
| Action | Allow |
| Include | Emails ending in @your-family-domain.com |

Hoặc:
| Field | Value |
|-------|-------|
| Policy name | Specific Users |
| Action | Allow |
| Include | Emails: user1@gmail.com, user2@gmail.com |

### Bước 9.6: Test truy cập
1. Truy cập `https://finance.your-domain.com`
2. Đăng nhập qua Cloudflare
3. Sau đó đăng nhập app với tài khoản đã tạo ở bước 8

---

## 10. Kiểm Tra & Xử Lý Lỗi

### Kiểm tra logs
```bash
# Tất cả logs
docker-compose logs -f

# Chỉ database
docker-compose logs -f db

# Chỉ auth
docker-compose logs -f auth

# Chỉ frontend
docker-compose logs -f frontend
```

### Lỗi thường gặp

#### ❌ Database connection refused
```bash
# Kiểm tra db đã chạy chưa
docker-compose ps db

# Restart db
docker-compose restart db
```

#### ❌ Auth service lỗi
```bash
# Kiểm tra logs auth
docker-compose logs auth

# Thường do JWT_SECRET sai
# Kiểm tra lại .env file
```

#### ❌ Frontend không load
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

#### ❌ CORS errors
```bash
# Kiểm tra SITE_URL trong .env
# Đảm bảo khớp với URL truy cập
```

### Restart toàn bộ
```bash
docker-compose down
docker-compose up -d
```

### Reset hoàn toàn (XÓA DATA)
```bash
docker-compose down -v
rm -rf .data/db/*
docker-compose up -d
```

---

## 11. Backup & Maintenance

### Backup tự động hàng ngày
```bash
# Setup cron job
crontab -e

# Thêm dòng này (backup lúc 2:00 AM)
0 2 * * * cd /path/to/finance-app && ./backup.sh >> .data/backups/backup.log 2>&1
```

### Backup thủ công
```bash
cd ~/apps/finance-app

# Backup database
docker exec finance-db pg_dump -U postgres postgres > .data/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup toàn bộ .data folder
tar -czvf finance-backup-$(date +%Y%m%d).tar.gz .data/
```

### Restore từ backup
```bash
# Restore database
docker exec -i finance-db psql -U postgres postgres < .data/backups/backup_20240115.sql
```

### Update app từ GitHub
```bash
cd ~/apps/finance-app

# Pull changes
git pull origin main

# Rebuild và restart
docker-compose build
docker-compose up -d
```

### Xem disk usage
```bash
du -sh .data/*
```

---

## 📋 Checklist Hoàn Thành

- [ ] Docker & Docker Compose đã cài trên NAS
- [ ] Repo đã clone về NAS
- [ ] Folder .data/ đã tạo với đúng permissions
- [ ] JWT Secret và API Keys đã tạo
- [ ] File .env đã cấu hình đầy đủ
- [ ] Docker services đang chạy (docker-compose ps)
- [ ] Database đã có data
- [ ] Cloudflare Tunnel đã cấu hình
- [ ] Access Policy cho family members đã thêm
- [ ] Test truy cập từ internet thành công
- [ ] Cron job backup đã setup

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs -f`
2. Verify .env configuration
3. Check Cloudflare Tunnel status
4. Ensure all ports are not blocked by firewall

### Ports cần mở trên NAS (internal network)
| Port | Service |
|------|---------|
| 3000 | Frontend |
| 3001 | Supabase Studio |
| 5432 | PostgreSQL |
| 8000 | API Gateway |

**Lưu ý:** Không cần mở ports này ra internet vì đã dùng Cloudflare Tunnel.
