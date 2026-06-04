Website sẽ được mở từ 1 ứng dụng mobile là VNPAY dưới dạng webview.
Trên màn hình home, hãy bổ sung logic để nhận dữ liệu truyền vào từ mobile app.

- Bạn hãy bổ sung 1 màn hình /login để thực hiện logic bên dưới
Quy định dữ liệu từ MobileBanking gọi sang WebView khi tích hợp trên ứng dụng Mobile.
https://externalservices.vnpaytest.vn/login?data=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Giải thích
data=AES({"mobile":"09xxxxxxxx","bankCode":"9704xx","bankName":"Agribank","token":"xxxxxxxxxxxxxx","fname":"nguyen van a"})
Các thông số AES:
CipherMode: CBC
PaddingMode: PKCS7Padding
KeyLength: 256
Key AES: Sẽ gửi sau
IV: sinh ngẫu nhiên 16 byte đầu
setEncodingMode: base64
mobile: 
Số điện thoại của user
fname:(nếu cần)
Tên khách hàng 
bankCode:
9704xx: Mã bankcode của bank tích hợp. Tham khảo bảng danh sách Ngân hàng
bankName:
Agribank: Tên bank tích hợp. Tham khảo bảng danh sách Ngân hàng
language:
Loại ngôn ngữ mà App đang sử dụng: VN, EN

token: Sinh ra ở server của VNPAY được ký privatekey, đối tác cần verify bằng public key
token=RSA(mobile+bankcode+bankname) 
Thuật toán ký:
RSA
Key RSA Size: 512
Key: Sẽ gửi sau
appVersion: version của app tích hợp
sdkVersion: version của sdk iframe
rawData: Any(String, JSON ….) (optional) dữ liệu động theo từng dự án

- màn hình login không có giao diện cụ thể, chỉ có dòng chữ loading và icon Loading ở center (icon loading sử dụng logo với 1 animation đơn giản để nhận biết là đang loading.)
- tối đa màn hình này sẽ xử lý trong 3 giây. nếu xử lý xong sớm, thì phải đợi đủ 3 giây mới được chuyển qua màn hình kế tiếp.
- Sau 3 giây nếu logic xử lý thông tin chưa xong thì sẽ hiển thị thông báo ở giữa màn hình với nội dung là "Tải dữ liệu thất bại. Vui lòng liên hệ CSKH để được hỗ trợ". 
- Thông tin sẽ được lưu xuống localstorage. tên và số điện thoại sẽ được hiển thị lên màn hình consent
- Bổ sung cả parameter cho cả khi mã hoá và không mã hoá. 
- Các dữ liệu mẫu mà VNPAY mobile app sẽ truyền vào cũng lưu vào comment trực tiếp trên code để khi đọc thì nhớ cho các việc lần sau.
- Phần xử lý này nên tách thành 1 trang mới, không sử trên trang /login cũ mà hãy tách thành trang /vnpay/login
- Logo để hiển thị loading là VNPAY.png theo parameter "logo=VNPAY", không hiển thị icon loading mặc định của reactjs. khi không tìm thấy file thì mới hiển thị logo.png
- Các ENV cần thiết thì hãy đặt giá trị mặc định và tên ENV kèm chữ "VNPAY" theo sau "REACT_APP_". Ví dụ: REACT_APP_VNPAY_AES_KEY

