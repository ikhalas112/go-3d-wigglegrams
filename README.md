# SiamDispo - Wiggle Maker

เว็บแอปพลิเคชันสำหรับสร้างวิดีโอ Wiggle 3D จากภาพนิ่ง

## การติดตั้ง

### สิ่งที่ต้องมี

- Node.js
- Go
- FFmpeg
- Docker (ถ้าต้องการรันด้วย Docker) (แนะนำ)

#### การติดตั้งด้วย Docker

1. ติดตั้ง Docker

   - Windows: ดาวน์โหลดและติดตั้ง Docker Desktop จาก [Docker Hub](https://hub.docker.com/editions/community/docker-ce-desktop-windows)
   - macOS: ดาวน์โหลดและติดตั้ง Docker Desktop จาก [Docker Hub](https://hub.docker.com/editions/community/docker-ce-desktop-mac)
   - Linux: รันคำสั่งต่อไปนี้:
     ```bash
     curl -fsSL https://get.docker.com -o get-docker.sh
     sudo sh get-docker.sh
     ```

2. ติดตั้ง Docker Compose

   - Windows/macOS: Docker Compose จะถูกติดตั้งมาพร้อมกับ Docker Desktop
   - Linux: รันคำสั่งต่อไปนี้:
     ```bash
     sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
     sudo chmod +x /usr/local/bin/docker-compose
     ```

3. ตรวจสอบการติดตั้ง

   ```bash
   docker --version
   docker-compose --version
   ```

4. รันแอปพลิเคชัน

   ```bash
   docker-compose up -d
   ```

   เว็บแอปพลิเคชันจะทำงานที่ http://localhost:9999

   #### ที่ตั้งของ frontend

   ```
   /frontend
   ```

   - `/frontend/src` - โค้ด React
   - `/frontend/public` - ไฟล์ static
   - `/frontend/dist` - โฟลเดอร์สำหรับ build

   #### ที่ตั้งของ backend

   ```
   /backend
   ```

   - `/backend/cmd` - จุดเริ่มต้นของแอปพลิเคชัน
   - `/backend/internal` - โค้ดหลักสำหรับการ generate วิดีโอ
   - `/backend/pkg` - แพคเกจที่ใช้ร่วมกัน
