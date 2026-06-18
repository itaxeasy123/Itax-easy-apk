# ItaxEasy App — Data Storage Map

Where every feature's data is stored today.

**Legend:** 🔵 Online = our server DB (Postgres) · 🟢 Local = user's device only · 🟡 Both = entered/cached on device **and** sent to server · ⚪ None = processed only, nothing saved

| Module | Feature / Component | Data it handles | Stored |
|--------|--------------------|-----------------|--------|
| Auth | Sign up / Login / OTP verify | User account, password (hashed), OTP | 🔵 Online |
| Auth | Login session | JWT token, refresh token, cached user | 🟢 Local |
| Profile | My profile / settings | Name, email, phone, gender, avatar | 🔵 Online |
| Profile | PAN scan (settings) | Scanned PAN result | 🟢 Local |
| **BillShield** | Companies / Company profile | Name, GSTIN, PAN, state, books-begin | 🔵 Online |
| **BillShield** | Chart of Accounts (groups) | Account groups & sub-groups | 🔵 Online |
| **BillShield** | Ledgers / Accounts | Ledger name, opening balance, bank info | 🔵 Online |
| **BillShield** | Vouchers (Sales, Purchase, Payment, Receipt, Journal, Contra) | Voucher header + debit/credit lines + GST lines | 🔵 Online |
| **BillShield** | Parties (customers / suppliers) | Name, GSTIN, contact, bank details | 🔵 Online |
| **BillShield** | Items (products / services) | Name, price, stock, HSN, tax rates | 🔵 Online |
| **BillShield** | Invoices | Invoice + line items, totals, GST | 🔵 Online |
| **BillShield** | Bills payable / receivable | Bill amounts, due dates, party | 🔵 Online |
| **BillShield** | Bank accounts / reconciliation | Bank ledger, cleared cheques, statement ref | 🔵 Online |
| **BillShield** | Fiscal year | Year label, dates, open/closed | 🔵 Online |
| **BillShield** | Reports (Trial Balance, P&L, Balance Sheet, Day/Cash/Bank book) | Calculated from vouchers | ⚪ None (computed) |
| **BillShield** | Credit / Debit notes, Payments, Receipts | Note/payment records | 🔵 Online |
| Accounting OCR | Invoice OCR | Scanned invoice → extracted data | 🟡 Both (OCR online, cache 🟢 local) |
| Accounting OCR | GST OCR | Scanned GST doc → extracted data | 🟡 Both (OCR online, cache 🟢 local) |
| Accounting OCR | Bank statement OCR | Scanned statement → transactions | 🟡 Both (OCR online, cache 🟢 local) |
| Accounting OCR | Driving licence OCR | Scanned DL → extracted data | 🟡 Both (OCR online, cache 🟢 local) |
| GST | GSTR-1 (B2B, B2C large/others, Exports, CDNR, CDNUR, Nil-rated, HSN, Advances, Tax liability, Amendments) | Return entry records | 🟢 Local |
| GST | GSTR-2A / 2B | Fetched supplier data (view) | ⚪ None (fetched, viewed) |
| GST | GSTR-3B | Summary return | 🟢 Local |
| GST | GST business profile | GSTIN profile | 🔵 Online |
| GST | GSTIN auto-fill / lookup | Public GSTIN search | ⚪ None (3rd-party API) |
| ITR | ITR data entry (Salary, House property, Capital gains, Deductions, Exemptions, Other sources, TDS, etc.) | Full ITR working data | 🟢 Local |
| ITR | Form-16 extraction | Uploaded Form-16 → extracted figures | 🟡 Both (OCR online, data 🟢 local) |
| ITR | File ITR / inquiry | ITR filing inquiry | 🔵 Online |
| Calculators | EMI, SIP, FD, HRA, Compound/Simple interest, Advance tax, TDS, GST calc, Depreciation, Capital gain, all loan calculators | Inputs & results | ⚪ None (compute only) |
| Tax | Income-tax calculator | Inputs & results | ⚪ None (compute only) |
| PDF Tools | Merge PDF, Split PDF, Image→PDF, CSV, Excel | Files being processed | ⚪ None (on-device files) |
| Content | Blogs / Library, About, Help & Support, Privacy policy | Articles, info pages | 🔵 Online |
| Payments | Razorpay / Easebuzz | Payment & subscription records | 🔵 Online |
| Backend-only | Services, Subscriptions, Cart, Orders, Careers, Insurance, Loans, Contact | Exist in our DB but not yet exposed as app screens | 🔵 Online |
| Reference | Cost inflation index, Gold/Silver rates, Country codes, Tax slabs, HSN/SAC | Lookup data used by calculators | 🔵 Online |

---

### Summary

- **Stored on our server (🔵):** all BillShield accounting (companies, ledgers, vouchers, parties, items, invoices, bills, banks), user accounts, GST business profile, content pages, payments, reference data.
- **Stored only on the device (🟢):** login session, GST return entries (GSTR-1/3B), full ITR working data, OCR scan results.
- **Both (🟡):** OCR scans & Form-16 (image is processed online, extracted result kept on device).
- **Not stored (⚪):** every calculator, PDF tools, report views, GSTR-2A/2B and GSTIN lookups.

> Note: BillShield accounting is currently **🔵 Online**. The separate proposal is to move it to **🟢 Local** — see `BillShield-Local-Storage.md`.
