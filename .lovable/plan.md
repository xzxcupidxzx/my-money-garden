

# Hoàn Thiện Docker Self-Host Cho Synology NAS (LAN Only)

## Tổng quan
Cập nhật cấu hình Docker để tối ưu cho Synology NAS, chạy trong mạng LAN nội bộ. Đơn giản hóa setup vì không cần Cloudflare Tunnel.

## Những gì đã có sẵn
- `docs/self-host/docker-compose.yml` - Full stack (DB, Auth, REST, Kong, Frontend)
- `docs/self-host/Dockerfile` - Multi-stage build cho frontend
- `docs/self-host/.env.example` - Template biến môi trường
- `docs/self-host/01-database-schema.sql` - Schema database đầy đủ
- `docs/self-host/kong.yml` - API Gateway config
- `docs/self-host/nginx.conf` - Nginx config cho frontend
- `docs/self-host/backup.sh` - Script backup tự động
- `docs/self-host/GUIDE-COMPLETE.md` - Hướng dẫn chi tiết

## Cần bổ sung / cải thiện

### 1. Tạo script setup tự động cho Synology
File mới: `docs/self-host/synology-setup.sh`

Script tự động hóa toàn bộ quá trình:
- Tạo thư mục `.data/db`, `.data/storage`, `.data/backups`
- Generate JWT Secret tự động
- Generate ANON_KEY và SERVICE_ROLE_KEY bằng Node.js
- Tạo file `.env` với các giá trị đã fill sẵn (IP NAS tự detect)
- Copy `docker-compose.yml` và `Dockerfile` ra root
- Hiển thị hướng dẫn tiếp theo

### 2. Cập nhật docker-compose.yml cho Synology
Sửa file: `docs/self-host/docker-compose.yml`

Thay đổi:
- Thêm `mem_limit` cho từng service (Synology thường RAM hạn chế)
- Bỏ expose port 5432 ra ngoài (chỉ internal network, bảo mật hơn)
- Thêm `logging` driver với size limit (tránh đầy ổ cứng)
- Thêm Docker network riêng cho stack
- Thêm health check cho frontend

### 3. Cập nhật Dockerfile
Sửa file: `docs/self-host/Dockerfile`

Thay đổi:
- Build args truyền đúng từ docker-compose
- Thêm `.dockerignore` content trong comment

### 4. Tạo file .dockerignore
File mới: `docs/self-host/.dockerignore`

Bỏ qua: `node_modules`, `.data`, `.git`, `docs` (trừ self-host), `*.md`

### 5. Cập nhật Hướng dẫn Synology-specific
File mới: `docs/self-host/SYNOLOGY-QUICKSTART.md`

Hướng dẫn ngắn gọn cho Synology:
- SSH vào Synology (bật SSH trong Control Panel)
- Clone repo, chạy setup script
- `docker-compose up -d`
- Mở trình duyệt → `http://[IP-NAS]:3000`
- Tạo tài khoản đầu tiên
- Done!

### 6. Fix Single-User Mode cho LAN
Sửa file: `src/hooks/useAuth.tsx`

Hiện tại `isSelfHosted()` chỉ check domain, nhưng khi chạy LAN với IP (192.168.x.x) thì đã đúng rồi. Cần đảm bảo logic check chính xác hơn:
- `localhost` hoặc `127.0.0.1` -> self-host
- Private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x) -> self-host
- Không chứa `lovable.app` hoặc `lovableproject.com` -> self-host

---

## Chi tiết kỹ thuật

### synology-setup.sh (script chính)
```text
#!/bin/bash
# 1. Detect NAS IP
# 2. Create .data directories
# 3. Generate JWT_SECRET (openssl rand -base64 32)
# 4. Prompt user for password
# 5. Generate ANON_KEY & SERVICE_ROLE_KEY (jwt encode)
# 6. Write .env file
# 7. Copy docker-compose.yml & Dockerfile to root
# 8. Print instructions
```

### Docker Compose cải tiến
```text
services:
  db:
    mem_limit: 512m
    logging:
      driver: "json-file"
      options: { max-size: "10m", max-file: "3" }
    # Không expose port 5432 ra ngoài

  auth:
    mem_limit: 256m
    ...

  kong:
    mem_limit: 256m
    ...

  frontend:
    mem_limit: 128m
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
    ...

networks:
  finance-net:
    driver: bridge
```

### useAuth.tsx - Cải thiện self-host detection
```text
const isSelfHosted = () => {
  const hostname = window.location.hostname;
  // Lovable domains
  if (hostname.includes('lovable.app') || hostname.includes('lovableproject.com')) return false;
  // Private IPs & localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(hostname)) return true;
  // Any other domain = self-host
  return true;
};
```

---

## Cấu trúc files cuối cùng
```text
docs/self-host/
  ├── .dockerignore              # [MỚI]
  ├── .env.example               # [CẬP NHẬT]
  ├── 01-database-schema.sql     # [GIỮ NGUYÊN]
  ├── backup.sh                  # [GIỮ NGUYÊN]
  ├── docker-compose.yml         # [CẬP NHẬT]
  ├── Dockerfile                 # [GIỮ NGUYÊN]
  ├── GUIDE-COMPLETE.md          # [GIỮ NGUYÊN]
  ├── kong.yml                   # [GIỮ NGUYÊN]
  ├── nginx.conf                 # [GIỮ NGUYÊN]
  ├── README.md                  # [GIỮ NGUYÊN]
  ├── synology-setup.sh          # [MỚI]
  └── SYNOLOGY-QUICKSTART.md     # [MỚI]

src/hooks/useAuth.tsx            # [CẬP NHẬT]
```

---

## Kết quả sau khi hoàn thành
1. Chạy 1 script duy nhất để setup mọi thứ trên Synology
2. `docker-compose up -d` là xong
3. Truy cập `http://[IP-NAS]:3000` từ bất kỳ thiết bị nào trong LAN
4. App tự bật Single-User Mode, không cần đăng nhập
5. Data backup tự động hàng ngày
6. RAM tối ưu cho Synology (tổng khoảng 1.5-2GB)

