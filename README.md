# DADING Store — GitHub Edition

## 1. Setup Google Apps Script
1. បើក Google Sheets របស់អ្នក
2. ចូលទៅកាន់ `Extensions` -> `Apps Script`
3. Copy កូដក្នុង `Code.gs` ទៅបិទភ្ជាប់
4. ចុច `Deploy` -> `New deployment`
5. ជ្រើសរើសប្រភេទ `Web app`[cite: 3]:
   - **Execute as:** Me[cite: 3]
   - **Who has access:** Anyone (ឬតាមការកំណត់របស់អ្នក)[cite: 3]
6. ចុច `Deploy` រួច Copy យក Web App `/exec` URL[cite: 3]

## 2. Setup GitHub Pages
1. បើកไฟล์ `index.html`[cite: 3]
2. ជំនួស `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` ជាមួយនឹង Web App URL ដែលទទួលបាន[cite: 3]
3. Upload ឯកសារ `index.html` ចូលទៅកាន់ GitHub Repository របស់អ្នក[cite: 3]
4. បើក **GitHub Pages** នៅក្នុង Settings របស់ Repository[cite: 3]

## 3. Google Sheet Database Mapping Structure
- **Sheet1**: A: NAME, B: CODE, C: Variant/Size, D: Sale, F: Category, K: linkphoto, M: Stock, N: updatestock date, O: Cost Price[cite: 3]
- **Invoices**: A: Invoice Number, B: date, C: guest name, D: phone number, E: sale man, F: total $, G: Discount, H: Shipping, I: Payment Status[cite: 3]
- **Customers**: A: Name, B: Phone, C: Address[cite: 3]
- **InvoiceDetails**: A: Invoice Number, B: Date, C: Product Code, D: Product Name, E: Qty, F: PriceTotal[cite: 3]
