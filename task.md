Task: Gắn API thật cho màn TaxCDS Tra cứu mã số thuế, thay mock hiện tại

Context:
Project FE hiện có module TaxCDS tại:
- src/page/TaxCDS/TaxLookupMst/index.js
- src/page/TaxCDS/TaxLookupMst/components/MstResultList/index.js
- src/page/TaxCDS/components/TaxSearchForm/index.js
- src/page/TaxCDS/mock/taxMstMock.js
- src/page/TaxCDS/constants/taxLookup.js
- src/services/request.js

Hiện tại màn /tax/tra-cuu-mst đang dùng mock TAX_MST_MOCK_RESULTS để hiển thị kết quả tra cứu MST/CCCD. Cần thay bằng API thật.

Yêu cầu:
1. Tạo service mới cho TaxCDS:
   File đề xuất:
   src/services/taxCdsService.js

2. Trong service tạo function:
   lookupTaxCode(payload)

   Endpoint:
   POST /TaxCDS/user/lookup-tax-code

   Request body:
   {
     "searchType": "MST" | "CCCD",
     "keyword": "string"
   }

   Response expected:
   {
     "statusCode": 200,
     "data": [
       {
         "taxCode": "0317545179",
         "name": "Công ty ABC",
         "address": "Địa chỉ",
         "serviceName": "Thuê Trợ lý thuế thông minh",
         "actionText": "Đăng ký",
         "isRegistered": false,
         "subscriptionId": null
       }
     ]
   }

3. Sửa src/page/TaxCDS/TaxLookupMst/index.js:
   - Remove import/use TAX_MST_MOCK_RESULTS.
   - Khi user submit form thì gọi lookupTaxCode({
       searchType: selectedSearchType,
       keyword: searchValue
     })
   - Giữ lại logic validate MST/CCCD hiện có.
   - Giữ loading state hiện có.
   - Nếu API trả data rỗng thì hiển thị TaxEmptyResult.
   - Nếu API lỗi thì hiển thị empty/error message phù hợp, không crash app.
   - Sau khi tra cứu thành công vẫn lưu lịch sử tìm kiếm localStorage như hiện tại.

4. Mapping response:
   FE component MstResultList đang cần các field:
   - taxCode
   - name
   - address
   - serviceName
   - actionText
   - isRegistered

   Nếu BE trả khác tên field thì map lại về đúng format trên trước khi setResults.

5. Giữ nguyên API banner hiện tại:
   - getBannerBySectionCache(TAX_BANNER_SECTION)
   - TAX_BANNER_SECTION = "2001"
   Không sửa phần này.

6. Giữ nguyên API HomePageConfig hiện tại cho:
   - Đơn vị hỗ trợ
   - Tiện ích
   Không sửa phần này.

7. Xử lý nút Đăng ký / Quản lý:
   Hiện handleRegister mới console.log. Tạm thời giữ logic ở mức TODO:
   - Nếu item.isRegistered === true:
       TODO: navigate sang màn quản lý gói khi có route/API.
   - Nếu item.isRegistered === false:
       TODO: navigate sang màn đăng ký Trợ lý thuế thông minh khi có route/API.
   - Không tự tạo route mới.
   - Không tự build flow payment nếu chưa có thiết kế/source.

8. Không thay đổi UI/SCSS nếu không cần.
9. Không đổi logic validate form nếu đang chạy ổn.
10. Sau khi sửa, kiểm tra:
   - Search MST 10 số
   - Search MST 13 số
   - Search CCCD 12 số
   - Empty result
   - API error
   - Loading state
   - Lịch sử tìm kiếm

Deliverables:
- src/services/taxCdsService.js
- Updated src/page/TaxCDS/TaxLookupMst/index.js
- Nếu cần, cập nhật constants route/TODO cho nút Đăng ký/Quản lý
- Không để lại import mock taxMstMock trong màn tra cứu


Lưu ý: Chỉ gắn API cho phần đã có FE hiện tại. Không tự build thêm các màn TaxCDS khác trong WBS như nghĩa vụ thuế, quyết toán thuế, hoàn thuế, lệ phí môn bài. Các màn đó để task sau.