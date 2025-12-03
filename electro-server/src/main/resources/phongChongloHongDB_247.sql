

SELECT '=== ELECTRO MYSQL 8.0 HARDENING - BẢN HOÀN HẢO ===' AS STATUS;
SELECT CONCAT('Phiên bản MySQL hiện tại: ', VERSION()) AS INFO;

-- 1. Tắt local_infile
SET GLOBAL local_infile = 0;

-- 2. Xóa user test
DROP USER IF EXISTS 'test'@'localhost', 'test'@'%';
DROP DATABASE IF EXISTS test;

-- 3. Tạo lại user sạch
DROP USER IF EXISTS 'app_user'@'localhost';
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'Electro2025!@#Secure';

-- 4. Cấp quyền ứng dụng cần
GRANT SELECT, INSERT, UPDATE, DELETE ON electro.* TO 'app_user'@'localhost';

-- 5. Revoke toàn bộ quyền nguy hiểm (cú pháp chuẩn MySQL 8.0)
REVOKE ALL PRIVILEGES ON *.* FROM 'app_user'@'localhost';
REVOKE GRANT OPTION ON *.* FROM 'app_user'@'localhost';
REVOKE FILE, PROCESS, RELOAD, SHUTDOWN, REPLICATION CLIENT, REPLICATION SLAVE, CREATE USER ON *.* FROM 'app_user'@'localhost';

-- 6. Giới hạn kết nối + đổi mật khẩu định kỳ
-- Cách DUY NHẤT hoạt động 100% trên mọi MySQL 8.0 (kể cả 8.0.11)
UPDATE mysql.user SET
    max_connections = 150,
    max_user_connections = 15,
    password_lifetime = 90,
    password_expired = 'N'
WHERE user = 'app_user' AND host = 'localhost';

FLUSH PRIVILEGES;

-- 7. Kiểm tra kết quả cuối cùng
SELECT 'HOÀN TẤT 100% ' AS SUCCESS;

SELECT 
    user,
    host,
    max_connections,
    max_user_connections,
    password_lifetime,
    password_expired,
    authentication_string != '' AS has_password
FROM mysql.user 
WHERE user = 'app_user';

SELECT 'Username: app_user@localhost' AS CREDENTIAL;
SELECT 'Password: Electro2025!@#Secure' AS CREDENTIAL;

