<img width="518" height="165" alt="image" src="https://github.com/user-attachments/assets/1e063056-7d51-4820-a225-87fd33394f44" />> Cân nhắc! Project này có sử dụng một số kỹ thuật mang tính hacking như lớp GenericMappingRegister vì yêu cầu tiến độ, do đó chỉ nên tham khảo, không nên áp dụng trong thực tế. Ngoài ra, còn một số vấn đề chưa giải quyết như việc một số controller có inject repository, hướng dẫn cài đặt, và nhiều lỗi khác.

# Giới thiệu

Công ty Electro là doanh nghiệp kinh doanh thiết bị điện tử. Hiện nay, công ty có nhu cầu mở rộng kênh bán hàng, hướng đến triển khai một website thương mại điện tử cho riêng công ty.

Nhằm đáp ứng nhu cầu của quý công ty, dự án Electro ra đời để xây dựng một website thương mại điện tử như ý định của quý công ty.

# Thiết kế hệ thống

## Actors

Hệ thống được thiết kế để phục vụ nhu cầu sử dụng của 3 actor chính: khách hàng (customer), người quản trị (admin) và nhân viên (employee). Trong đó, actor khách hàng có thể là một khách hàng vãng lai (anonymous customer), hoặc là một khách hàng đã đãng ký tài khoản trong hệ thống (registered customer).

Ngoài ra, hệ thống còn có sự tham gia của 2 actor phụ là dịch vụ của Giao Hàng Nhanh và PayPal để phục vụ các chức năng giao hàng và thanh toán.

<p align="center">
  <img src="https://user-images.githubusercontent.com/60851390/228576160-33dfc714-c568-4674-b98e-3aa35a8d33f2.png" alt="Actors" width="650" />
  <br>
  <em>Actors</em>
</p>

## Use Case Diagram

Hệ thống được xây dựng để giải quyết nhu cầu bán hàng trực tuyến cho một công ty kinh doanh thiết bị điện tử, cũng như điều phối một số công việc nội bộ của công ty này.

Yêu cầu của công ty là phải có một website phía khách hàng để họ có thể tương tác với hệ thống, thực hiện những chức năng cơ bản của thương mại điện tử như thêm sản phẩm vào giỏ hàng, đăng ký tài khoản, cập nhật hồ sơ cá nhân, v.v.; đồng thời cũng phải có một website quản trị để điều phối hoạt động của công ty một cách toàn diện, từ việc quản lý nhân viên, khách hàng, đến quản lý sản phẩm, sự lưu thông hàng hóa ở kho bãi, đơn hàng, vận đơn, kiểm duyệt đánh giá, thiết lập các chương trình khuyến mãi, v.v.

<p align="center">
  <img src="https://user-images.githubusercontent.com/60851390/228576829-684e6c1d-7192-4c68-af0c-0ce17be33059.png" alt="Use Case Diagram" width="750" />
  <br>
  <em>Use Case Diagram</em>
</p>

## Class Diagram

Hệ thống gồm có 57 lớp chính, được chia thành 13 nhóm.

<p align="center" style="background-color: white;">
  <img src="https://user-images.githubusercontent.com/60851390/228512903-b45a45e3-7aa1-4a2b-911e-ad46a9ddb96e.svg" alt="Use Case Diagram" width="600" />
  <br>
  <em>Class Diagram</em>
</p>

| (1)                                                                                                                                                                 | (2)                                                                                                                                                                  | (3)                                                                   # Hướng dẫn chạy dự án 
## Chạy client ( react ) - chạy tại https://localhost:3000 - đã bật https
```bash
cd electro-client
$env:HTTPS="true"; 
npm install
npm start
```

## Chạy Server (Spring Boot) - nếu đã cấu hình https rồi, chưa thì xem tiếp phía dưới
```bash
cd electro-server
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.29.7-hotspot"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run

truy cập : https://localhost:8443/ để xác nhận chữ kí --> reload lại giao diện 
```
## Cấu hình HTTPS cho backend
1. Mở terminal tại thư mục `electro-server/src/main/resources`.
2. Tạo file keystore bằng lệnh:
   ```bash
   keytool -genkeypair -alias electro -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore electro-keystore.p12 -validity 3650
   ```
3. Thêm cấu hình sau vào `application.properties`:
   ```properties
   server.port=8443
   server.ssl.enabled=true
   server.ssl.key-store=classpath:electro-keystore.p12
   server.ssl.key-store-password=<mật khẩu bạn đã nhập>
   server.ssl.key-store-type=PKCS12
   server.ssl.key-alias=electro
   ```
4. Khởi động lại backend.
| (1)                                                                                                                                                                 | (2)                                                                                                                                                                  | (3)                                                                                                                                        OK

## Lưu ý
Nếu dùng chứng chỉ tự ký, trình duyệt sẽ cảnh báo "Not secure" khi truy cập local, nhưng dữ liệu vẫn được mã hóa.                                                                     OK


