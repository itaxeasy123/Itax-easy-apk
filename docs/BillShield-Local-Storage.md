# BillShield — Local (On-Device) Storage Proposal

**Prepared for:** Management review
**Module:** BillShield (Accounting) inside the ItaxEasy app
**Date:** 17 Jun 2026

---

## 1. Objective

Make the **BillShield accounting module store all of its data on the user's own device only** — not on our server.

- When a user installs the APK, all their accounting data lives **inside their phone**.
- Nothing accounting-related is written to our backend database.
- If the user uninstalls/deletes the app, **their accounting data is gone with it** (like a self-contained offline app).
- Rationale: this data is not needed by us centrally, so we avoid storing it server-side.

> **Current status:** ❌ Not implemented. Today BillShield sends everything to our server (Postgres). This document lists exactly what would move to local-only storage so it can be approved before we build it.

---

## 2. Data to be stored LOCALLY (BillShield-only)

These tables are used **only** by BillShield. Moving them to the device does **not** affect any other feature of the app. This is the safe, self-contained set.

| # | Data (entity) | What it holds |
|---|---------------|---------------|
| 1 | **Company** | The business profile — name, GSTIN, PAN, state code, financial-year start month, books-begin date |
| 2 | **CompanyUser** | Which device-user owns/accesses the company + role (Owner, etc.) |
| 3 | **FiscalYear** | Each financial year — label, start/end dates, open/closed status |
| 4 | **AccountGroup** | The Chart of Accounts groups (Assets, Liabilities, Income, Expenses…) and sub-groups |
| 5 | **LedgerAccount** | Individual ledgers — name, opening balance (Dr/Cr), bank details, party link |
| 6 | **VoucherType** | Voucher categories — Sales, Purchase, Payment, Receipt, Journal, Contra |
| 7 | **VoucherSequence** | The auto-increment numbering per voucher type per year |
| 8 | **Voucher** | Transaction header — date, number, narration, party, status (Draft/Posted), reversal link |
| 9 | **VoucherLine** | The debit/credit lines of each voucher (the double-entry rows) |
| 10 | **VoucherGstLine** | Per-voucher GST breakup — taxable value, CGST, SGST, IGST, Cess, HSN/SAC |
| 11 | **BankReconciliation** | Cheque/instrument no., cleared date, statement reference for bank lines |
| 12 | **AuditLog** | Change history (who changed what, before/after) — *optional locally* |

**Derived reports** (not stored, computed on-device from the data above): Trial Balance, Profit & Loss, Balance Sheet, Day Book, Cash Book, Bank Book.

---

## 3. Shared data — DECISION NEEDED ⚠️

These appear on the BillShield dashboard (Parties, Items, Invoices, Bills), **but they are also used by other parts of the app** (GST returns, e-invoice, invoice generator). They are **not** BillShield-only.

| Data (entity) | Also used by |
|---------------|--------------|
| **Party** (customers/suppliers) | GST module, Invoice generator, e-invoice |
| **Item** (products/services) | Invoice generator, GST |
| **Invoice / InvoiceItem** | Invoice generator, e-invoice, GST returns |
| **BillPayable / BillReceivable** | Bills tracking |

**The question for management:** Should these stay on the server (because other features need them), or also go local?

- If they go **local**, those other features (GST, e-invoice) would lose access to them or need their own copies — bigger change, higher risk.
- **Recommendation:** Keep Parties/Items/Invoices on the server for now, and make **only the pure BillShield set (Section 2) local**. This gives a clean, self-contained local ledger without breaking GST/e-invoice.

---

## 4. What changes technically (summary)

- Add an **on-device database** (`expo-sqlite`) holding the Section-2 tables.
- Port the accounting engine that currently runs on our server (~1,400 lines: voucher posting with debit=credit rules, chart-of-accounts seeding, and the report calculations) to run **inside the app**.
- Switch the app's accounting data layer from "call server" to "read/write local DB" — the screens themselves don't change.

## 5. Implications to acknowledge

- ✅ Data is private to the device; we store nothing accounting-related.
- ✅ Works fully offline.
- ⚠️ **No server backup.** If the phone is lost or the app is uninstalled, the data cannot be recovered by us (this is the intended behaviour).
- ⚠️ No multi-device sync (data does not follow the user to another phone) unless we later add an optional export/backup.

---

*Please confirm: (a) approve making the Section-2 BillShield data local-only, and (b) decide on the Section-3 shared data (recommended: keep on server).*
