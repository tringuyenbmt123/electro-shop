# ===============================
# RUN DEV BACKEND (HOT RELOAD)
# ===============================

Write-Host "======================================="
Write-Host " Running Electro Backend (DEV - HOT) "
Write-Host "======================================="

# JAVA 11
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.29.7-hotspot"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

# SPRING PROFILE (QUAN TRỌNG)
$env:SPRING_PROFILES_ACTIVE="dev"

# ENV DEV
$env:ELECTRO_DB_USERNAME="electro_app"
$env:ELECTRO_DB_PASSWORD="AppStrong!2025"
$env:ELECTRO_JWT_SECRET="SUpErSecretJWTTOKENKeYForEleCTro"
$env:ELECTRO_GHN_TOKEN="cee52cd3-8a9d-11ed-9ccc-a2c11deda90c"
$env:ELECTRO_MAIL_USERNAME="electroshopnlu2022@gmail.com"
$env:ELECTRO_MAIL_PASSWORD="khbaelkdpcibkrcd"
$env:ELECTRO_PAYPAL_CLIENT_ID="ATg9Fx-qiFDopw6uZVdGQN2AOgx_vr0RsDNvrN5hViup8c2BZ6WaDYQPzkZd5DZGW-PsJic3scUdwqCd"
$env:ELECTRO_PAYPAL_SECRET="EGOakP0-AkdLfVx6r5vP9paSUggilXd2tAiuMrpKFU_59A9jzWiGnyY_J56Jcok9KVqzHFzwahZAq5XE"
$env:ELECTRO_KEYSTORE_PASSWORD="Quoctribmt123"
$env:ELECTRO_RECAPTCHA_SECRET="6LfYMzcsAAAAAEZpdtGdZV142G6mnTNMAaaIgz9c";

# RUN SPRING BOOT (HOT RELOAD)
.\mvnw.cmd spring-boot:run
