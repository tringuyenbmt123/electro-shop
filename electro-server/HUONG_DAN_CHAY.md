# 🚀 HƯỚNG DẪN CHẠY ELECTRO SHOP SERVER

## Đã fix xong! Giờ bạn chạy như sau:

### Cách 1: Dùng script tự động (KHUYẾN NGHỊ) ⭐

```powershell
# Chạy trực tiếp script
.\run-dev.ps1
```

Script này sẽ:
- ✅ Tự động set JAVA_HOME
- ✅ Tự động load tất cả biến từ file .env
- ✅ Chạy ứng dụng với profile dev

---

### Cách 2: Set biến môi trường thủ công (như bạn đang làm)

**QUAN TRỌNG:** Tất cả biến phải có prefix `ELECTRO_`

```powershell
$env:JAVA_HOME="D:\JDK11"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

# Set biến môi trường (CHÚ Ý: có prefix ELECTRO_)
$env:ELECTRO_DB_USERNAME="root"
$env:ELECTRO_DB_PASSWORD="Thienvip10@"
$env:ELECTRO_JWT_SECRET="SUpErSecretJWTTOKENKeYForEleCTro"
$env:ELECTRO_GHN_TOKEN="cee52cd3-8a9d-11ed-9ccc-a2c11deda90c"
$env:ELECTRO_MAIL_USERNAME="electroshopnlu2022@gmail.com"
$env:ELECTRO_MAIL_PASSWORD="khbaelkdpcibkrcd"
$env:ELECTRO_PAYPAL_CLIENT_ID="ATg9Fx-qiFDopw6uZVdGQN2AOgx_vr0RsDNvrN5hViup8c2BZ6WaDYQPzkZd5DZGW-PsJic3scUdwqCd"
$env:ELECTRO_PAYPAL_SECRET="EGOakP0-AkdLfVx6r5vP9paSUggilXd2tAiuMrpKFU_59A9jzWiGnyY_J56Jcok9KVqzHFzwahZAq5XE"
$env:ELECTRO_KEYSTORE_PASSWORD="Quoctribmt123"

# Chạy
java "-Dspring.profiles.active=dev" -jar target\electro-0.0.1-SNAPSHOT.jar
```

---

### Cách 3: Sửa file .env (ĐƠN GIẢN NHẤT) 🎯

File `.env` đã được tạo sẵn với đúng tên biến. Bạn chỉ cần:

1. Kiểm tra file `.env` có đúng giá trị không
2. Chạy: `.\run-dev.ps1`

**Nội dung file .env:**
```dotenv
ELECTRO_DB_USERNAME=root
ELECTRO_DB_PASSWORD=Thienvip10@
ELECTRO_JWT_SECRET=SuperSecretKeyThatIsAtLeaharactersLongForJWTSigningPurposes1234
ELECTRO_GHN_TOKEN=cee52cd3-8a9d-11ed-9ccc-a2c11deda90c
ELECTRO_MAIL_USERNAME=electroshopnlu2022@gmail.com
ELECTRO_MAIL_PASSWORD=khbaelkdpcibkrcd
ELECTRO_PAYPAL_CLIENT_ID=ATg9Fx-qiFDopw6uZVdGQN2AOgx_vr0RsDNvrN5hViup8c2BZ6WaDYQPzkZd5DZGW-PsJic3scUdwqCd
ELECTRO_PAYPAL_SECRET=EGOakP0-AkdLfVx6r5vP9paSUggilXd2tAiuMrpKFU_59A9jzWiGnyY_J56Jcok9KVqzHFzwahZAq5XE
ELECTRO_KEYSTORE_PASSWORD=Quoctribmt123
```

---

## ✅ Đã sửa gì?

### Trước đây (SAI):
```properties
# application.properties
electro.app.jwtSecret = ${JWT_SECRET}
```

Bạn set: `$env:ELECTRO_JWT_SECRET` → Không khớp!

### Bây giờ (ĐÚNG):
```properties
# application.properties
electro.app.jwtSecret = ${ELECTRO_JWT_SECRET}
```

Bạn set: `$env:ELECTRO_JWT_SECRET` → Khớp! ✅

---

## 🔧 Nếu vẫn bị lỗi

### Lỗi: "Could not resolve placeholder 'ELECTRO_XXX'"

**Nguyên nhân:** Biến môi trường không được load

**Giải pháp:**

1. **Kiểm tra tên biến:**
   ```powershell
   # Xem tất cả biến ELECTRO_*
   Get-ChildItem Env: | Where-Object { $_.Name -like "ELECTRO_*" }
   ```

2. **Set lại biến:**
   ```powershell
   # Đảm bảo có prefix ELECTRO_
   $env:ELECTRO_JWT_SECRET="YourSecretHere"
   ```

3. **Hoặc dùng script run-dev.ps1:**
   ```powershell
   .\run-dev.ps1
   ```

---

## 📝 Danh sách biến môi trường CẦN THIẾT

| Biến | Mô tả | Bắt buộc |
|------|-------|----------|
| `ELECTRO_DB_PASSWORD` | Mật khẩu MySQL | ✅ |
| `ELECTRO_JWT_SECRET` | Secret key cho JWT | ✅ |
| `ELECTRO_GHN_TOKEN` | Token Giao Hàng Nhanh | ✅ |
| `ELECTRO_MAIL_USERNAME` | Email Gmail | ✅ |
| `ELECTRO_MAIL_PASSWORD` | Gmail App Password | ✅ |
| `ELECTRO_PAYPAL_CLIENT_ID` | PayPal Client ID | ✅ |
| `ELECTRO_PAYPAL_SECRET` | PayPal Secret | ✅ |
| `ELECTRO_KEYSTORE_PASSWORD` | Keystore password | ✅ |

---

## 🎯 Build lại nếu cần

```powershell
# Clean và build
mvn clean package -DskipTests

# Sau đó chạy
.\run-dev.ps1
```

---

## ⚠️ LƯU Ý BẢO MẬT

1. **KHÔNG commit file .env** lên git (đã thêm vào .gitignore)
2. **Rotate secrets** sau khi đã bị lộ (trong code cũ)
3. **Dùng secrets khác nhau** cho dev/staging/production
4. **JWT_SECRET nên dài ít nhất 64 ký tự**

---

**✅ Bây giờ chạy lệnh này:**
```powershell
.\run-dev.ps1
```
