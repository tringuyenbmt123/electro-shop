# Security Fixes Summary - Quick Reference

## ✅ Đã sửa xong (Completed)

### 1. SQL Injection / RSQL Query Injection
- ✅ SearchUtils.java - Chuyển sang JPA Criteria API
- ✅ OrderRepository, ReviewRepository, WishRepository, PreorderRepository, NotificationRepository
- ✅ Escape LIKE wildcards, giới hạn độ dài input

### 2. Authentication & Authorization (IDOR)
- ✅ WebSecurityConfig - Loại bỏ permitAll("/**"), secure by default
- ✅ ClientCartController - Check ownership
- ✅ ClientReviewController - Check ownership + dùng authenticated user
- ✅ ClientWishController - Check ownership + dùng authenticated user  
- ✅ ClientPreorderController - Check ownership + dùng authenticated user
- ✅ ClientNotificationController - Check ownership

### 3. Token Security
- ✅ Verification token: 4 số → 6 số với SecureRandom
- ✅ Reset password token: 10 ký tự → 40 ký tự
- ✅ Reset password token expiry: 15 phút
- ✅ One-time use token (clear sau khi dùng)

### 4. Forgot/Reset Password
- ✅ Đổi từ GET sang POST (không lộ email trên URL)
- ✅ Consistent response (không lộ email enumeration)

## 🚀 Hướng dẫn nhanh

### Bước 1: Run Migration SQL
```bash
mysql -u root -p electro_db < src/main/resources/migration_add_reset_password_expiry.sql
```

### Bước 2: Build & Run
```powershell
$env:JAVA_HOME="D:\JDK11"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

cd electro-server
mvn clean package -DskipTests

java -Dspring.profiles.active=dev -jar target\electro-0.0.1-SNAPSHOT.jar
```

## ⚠️ Breaking Changes cho Frontend

### 1. Forgot Password API thay đổi
```typescript
// CŨ
GET /api/auth/forgot-password?email=xxx

// MỚI
POST /api/auth/forgot-password
Body: { "email": "xxx" }
```

### 2. Reset Password API thay đổi
```typescript
// CŨ
PUT /api/auth/reset-password

// MỚI  
POST /api/auth/reset-password
```

### 3. Cart/Review/Wish/Preorder Request Body
```typescript
// CŨ - Gửi userId
{ userId: 1, productId: 100, ... }

// MỚI - KHÔNG gửi userId (server tự lấy từ token)
{ productId: 100, ... }
```

## 📊 Testing Checklist

- [ ] Test SQL injection với search: `'; DROP TABLE--`
- [ ] Test IDOR: User A không xem được data của User B
- [ ] Test forgot password: không lộ email có tồn tại
- [ ] Test reset token: expire sau 15 phút và chỉ dùng 1 lần
- [ ] Test admin API: yêu cầu role ADMIN/EMPLOYEE
- [ ] Test client API: yêu cầu role CUSTOMER

## 📖 Chi tiết đầy đủ

Xem file: [BAO_CAO_SUA_LOI_BAO_MAT.md](./BAO_CAO_SUA_LOI_BAO_MAT.md)
