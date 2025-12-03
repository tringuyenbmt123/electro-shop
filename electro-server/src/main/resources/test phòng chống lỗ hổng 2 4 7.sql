-- Chọn database electro
USE electro;

-- 1. Test SELECT (nên thành công)
SELECT * FROM user LIMIT 1;

-- 2. Test INSERT (nên thành công)
INSERT INTO category (created_at, updated_at, name, slug, status)
VALUES (NOW(), NOW(), 'Test Category', 'test-category', 1);

-- 3. Test UPDATE (nên thành công)
UPDATE category SET name = 'Test Category Updated' WHERE slug = 'test-category';

-- 4. Test DELETE (nên thành công)
DELETE FROM category WHERE slug = 'test-category';

-- 5. Test SQL Injection (nên không bị lỗi, không trả về dữ liệu bất thường)
-- (Giả lập, vì nếu app đã dùng Prepared Statement thì không bị ảnh hưởng)
SELECT * FROM user WHERE username = '' OR 1=1;

-- 6. Test quyền quản trị (nên bị từ chối)
CREATE USER 'hacker'@'localhost' IDENTIFIED BY '123';
DROP DATABASE electro;
GRANT ALL PRIVILEGES ON *.* TO 'app_user'@'localhost';
CREATE TABLE test_table (id INT);

-- 7. Test truy cập hệ thống (nên bị từ chối)
SELECT * FROM mysql.user;
SHOW DATABASES;
SHOW DATABASES LIKE 'mysql';

-- 8. Test tính năng nguy hiểm (nên bị từ chối)
LOAD DATA LOCAL INFILE 'abc.txt' INTO TABLE user;

-- 9. Test truy cập ngoài DB electro (nên bị từ chối hoặc không thấy)
SELECT * FROM information_schema.tables WHERE table_schema = 'mysql';

-- 10. Test quyền trên bảng hợp lệ (nên thành công)
SELECT * FROM category LIMIT 1;

-- 11. Test truy cập thông tin user (nên bị từ chối)
SELECT user, max_connections, max_user_connections, password_lifetime FROM mysql.user WHERE user='app_user';

-- 12. Test SHOW GRANTS (nên chỉ thấy quyền tối thiểu)
SHOW GRANTS FOR 'app_user'@'localhost';

-- 13. Test truy cập bảng không tồn tại (nên báo lỗi không tồn tại, không phải permission)
SELECT * FROM not_exist_table;

-- 14. Test INSERT với dữ liệu không hợp lệ (nên báo lỗi ràng buộc, không phải permission)
INSERT INTO category (created_at, updated_at, name, slug, status)
VALUES (NOW(), NOW(), NULL, NULL, NULL);

-- Kết thúc kiểm thử