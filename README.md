# KiemDinhOto_PartnerBookingWebsite 

# Build source lên Zalo Test

## 1. Tạo ứng dụng zalo - Không cần tạo OA

- Truy cập https://developers.zalo.me/apps để tạo ứng dụng Zalo test. Copy OD ứng dụng để lấy token ở bước 3
- Vào link này để tạo mini-app: https://miniapp.zaloplatforms.com/developers. Sau khi đã tạo mini-app copy ID của mini-app
- Để tiện quản lý build-version có thể tải extension "Zalo Mini App" trên extension VSCode. Ở phần trang chủ paste ID mini-app vào

## 2. Install package zmp

`npm install -g zmp`

- Tiến hành login zalo.
  `zpm login`

## 3. Thay token ở biến ZALO_USER_TOKEN trong env

- Vào link, thay ID ứng dụng bằng ID đã tạo ở bước 1: https://developers.zalo.me/tools/explorer/ID_ứng_dụng. Click lấy access token => Cấp quyền => Copy access token.
- Thêm vào trong biến ZALO_USER_TOKEN

## 4. Build source và push lên zalo test.

`npm run deploy-zalo-app`

## 5. Quét mã và test ứng dụng.