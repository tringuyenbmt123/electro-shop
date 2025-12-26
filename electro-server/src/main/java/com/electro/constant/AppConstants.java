package com.electro.constant;

public interface AppConstants {
    String DEFAULT_PAGE_NUMBER = "1";
    String DEFAULT_PAGE_SIZE = "5";
    String DEFAULT_SORT = "id,desc";

    // Giữ lại để các controller không lỗi
    String FRONTEND_HOST = "http://localhost:3000";

    // (Tuỳ chọn) thêm cho IP nếu cần ở nơi khác
    String FRONTEND_HOST_IP = "http://192.168.240.1:3000";

    String BACKEND_HOST = "https://localhost:8443";
    double DEFAULT_TAX = 0.1;
}
