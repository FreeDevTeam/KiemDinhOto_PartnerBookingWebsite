B. Quy định dữ liệu trả ra cho App khi chuyển sang bước thanh toán.
Khi khách hàng tạo xong đơn hàng trên site của đối tác. Site redirect sang url này. Ứng dụng sẽ bắt theo “/payment?data=” và đọc trường data và giải mã.
https://externalservices.vnpaytest.vn/payment?data=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Giải thích:
data = AES({"paymentcode":"abc","amount":"200,000","transactionid":"200,000"...})
paymentcode: là mã thanh toán của đơn hàng được tạo ra
amount: là giá trị của đơn hàng
transactionid: là mã giao dịch
Các trường bắt buộc là: paymentcode Và  amount. Lưu ý: amount là số tiền chỉ để hiển thị nếu cần, số tiền hạch toán phải dựa trên giá trị hệ thống (billing) trả ra. 
Các tham số khác nếu có phụ thuộc vào nghiệp vụ từng dịch vụ

Chuẩn payment json mới (nếu dự án yêu cầu): https://vnpay.gitbook.io/coresdk/mo-ta-thong-tin-thanh-toan/cac-dich-vu-khac

# Các dịch vụ khác

### Mô tả thông tin thanh toán

```
paymentCode: mã thanh toán
amount: số tiền thanh toán
providerCode: mã định danh nhà cung cấp
serviceCode: mã định danh dịch vụ
expireDate: thời hạn thannh toán
transactionId: mã giao dịch
```

Dữ liệu demo

{% code overflow="wrap" %}

```json
{
  "payment": {
    "amount": "70000.0",
    "hotline": "*6789",
    "description": "Thanh toán đơn hàng đặt vé xem phim",
    "expireDate": "2024-02-24 11:59:59",
    "paymentCode": "MB2024022356825811571",
    "transactionId": "132470201",
    "serviceCode": "805901",
    "providerCode": "805900",
    "allowInvoice": "false"
  },
  "orderInfo": [
    {
      "title": "Nội dung giao dịch",
      "type": "GROUP",
      "values": [
        {
          "title": "Dịch vụ",
          "type": "TITLE_VALUE",
          "value": "Đặt vé xem phim"
        },
        {
          "value": "MB2024022356825811571",
          "title": "Mã thanh toán",
          "detail": {
            "title": "Chi tiết đơn hàng",
            "type": "GROUP",
            "values": [
              {
                "title": "Chi tiết giá",
                "type": "GROUP",
                "values": [
                  {
                    "title": "Tiền vé (VND)",
                    "type": "TITLE_VALUE",
                    "value": "70.000"
                  },
                  {
                    "title": "Giảm giá (VND)",
                    "type": "TITLE_VALUE",
                    "value": "0"
                  },
                  {
                    "title": "Tổng tiền (VND)",
                    "type": "TITLE_VALUE",
                    "value": "70.000"
                  }
                ]
              }
            ]
          },
          "type": "DETAIL"
        }
      ]
    },
    {
      "title": "Lưu ý",
      "type": "NOTE",
      "value": "Trường hợp Sau 30 phút bạn không nhận được thông tin mã đặt chỗ gửi vào email/SMS vui lòng liên hệ: <a href='tel:*6789'>*6789 </a> để được hỗ trợ"
    }
  ]
}
```

{% endcode %}
