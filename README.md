# DADING Store — GitHub Edition

## 1. Google Apps Script API
Create a Google Apps Script project and paste `Code.gs`.
Deploy as Web App:
- Execute as: Me
- Who has access: choose the access level you need
Copy the `/exec` URL.

## 2. GitHub Pages
Open `index.html` and replace:
`YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`
with your Apps Script `/exec` URL.

Then upload `index.html` to GitHub and enable GitHub Pages.

## Google Sheet mapping
Sheet1: A NAME, B CODE, C Variant/Size, D Sale, F Category, K linkphoto, M Stock, N updatestock date, O Cost Price
Invoices: A Invoice Number, B date, C guest name, D phone number, E sale man, F total $, G Discount, H Shipping, I Payment Status
Customers: A Name, B Phone, C Address
InvoiceDetails: A Invoice Number, B Date, C Product Code, D Product Name, E Qty, F PriceTotal

## Important
Google Sheet is the database. GitHub Pages only serves the frontend.
