#!/bin/sh

# Đường dẫn tới các file index.html
INDEX_HTML_PATH="/usr/share/nginx/html/index.html"

# Kiểm tra biến môi trường từ CapRover
echo "APP_ENVIRONMENT: $APP_ENVIRONMENT"

# Chọn SDK URL dựa trên môi trường
if [ "$APP_ENVIRONMENT" = "production" ]; then
  SDK_URL="https://mp.zalopay.vn/v1/mp/sdk/js-sdk.js?platform=iframe"
else
  SDK_URL="https://qcmp.zalopay.vn/v1/mp/sdk/js-sdk.js?platform=iframe"
fi

# Nội dung cần replace
REPLACEMENT="<script src=\"$SDK_URL\"></script>"
echo "Sử dụng SDK URL: $SDK_URL"

# Hàm replace nội dung trong file
replace_sdk() {
  FILE=$1
  if [ -f "$FILE" ]; then
    echo "🔄 Đang cập nhật SDK trong: $FILE"
    sed -i "s|<script src=\"https://qcmp.zalopay.vn/v1/mp/sdk/js-sdk.js?platform=iframe\"></script>|${REPLACEMENT//\//\\/}|g" "$FILE"
    echo "Đã cập nhật SDK trong: $FILE"
  else
    echo "Không tìm thấy file: $FILE"
  fi
}

# Gọi hàm replace cho từng file
replace_sdk "$INDEX_HTML_PATH"

echo "Hoàn tất cập nhật SDK!"

# Sau khi xong thì start nginx
exec "$@"
