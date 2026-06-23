# CLAUDE.md — iTaxEasy App Developer Guidelines & Commands

Welcome to the development guide for **itaxeasy-app**. This file serves as a reference for any AI coding assistants (including Antigravity, Claude, etc.) to understand the project structure, build commands, and coding guidelines.

---

## ✨ Recently Implemented Features
1. **Simplified Trial Balance Redesign**:
   - Refactored `TrialBalanceScreen.tsx` to render a **flat, direct list of Ledger Accounts** (with their parent Group/Category shown as secondary text labels) instead of nested folder structures (e.g. intermediate "Current Assets" folders).
   - Cleaned up Grand Totals calculation and aligned the PDF, CSV, and Excel exports to follow this flat listing model.
2. **"From Contacts" Quick Party Creation**:
   - Built a beautiful, searchable, and filterable **in-app Contact Picker modal** on the **New Party Creation Screen** (`PartyCreateScreen.tsx`).
   - Supports searching by name, phone, or email and automatically populates relevant input fields upon selection.
3. **Smart, Non-Settings Redirecting Permission Flow**:
   - Implemented an elegant, double-guarded Contacts permission flow.
   - Shows an in-app confirmation alert first ("Allow Contacts Access?").
   - If accepted, natively requests `expo-contacts` permissions. If denied or blocked, it alerts the user but **never automatically forces them to the system settings page** (`Linking.openSettings()` was removed from the "Allow" callback).
4. **Backend Port Isolation & Reliability**:
   - Configured and running the Node API backend server on isolated port `8001` to resolve local port conflicts and keep database syncing functional.

---

## 🛠️ Command Reference

* **Start Metro Bundler**:
  ```bash
  npm start
  ```
* **Run on Connected Android Phone (Local compilation & deploy)**:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk && npm run android
  ```
* **Build Shareable Testing (Debug) APK locally**:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  cd android && ./gradlew assembleDebug
  # Output file is: android/app/build/outputs/apk/debug/app-debug.apk
  ```
* **Build Production (Release) APK locally**:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  cd android && ./gradlew assembleRelease
  # Output file is: android/app/build/outputs/apk/release/app-release.apk
  ```
* **Bypass ADB USB Install limits (Push APK directly to downloads folder)**:
  ```bash
  $HOME/Library/Android/sdk/platform-tools/adb push android/app/build/outputs/apk/debug/app-debug.apk /sdcard/Download/itaxeasy-app.apk
  ```

---

## 📌 Coding Guidelines & Architecture

### 1. Offline-First Accounting Calculations
All financial report calculations (Trial Balance, Balance Sheet, Profit & Loss) are computed **on-device** using local SQLite, not retrieved dynamically from the API.
* **Calculation Engine**: `src/features/accounting/local/engine.ts`
  * `trialBalance(companyId, asOf)`: Calculates net ledger balances, separating debit/credit.
  * `balanceSheet(companyId, asOf)`: Combines asset/liability totals and net profit.
  * `profitAndLoss(companyId, from, to)`: Computes Trading/Gross Profit and Net Profit.
* **UI Interface**: `src/features/accounting/services/billshieldUiService.ts` wraps the engine methods.

### 2. Device Permission Flows
* **Contacts Import**: In-app permission prompts must be handled gracefully:
  - Present a custom confirm alert inside the app first.
  - Request native permissions via `expo-contacts`.
  - **Do NOT automatically redirect or open the system settings page** on denial or failure (avoid calling `Linking.openSettings()` automatically). Keep the experience local to the screen.

### 3. Native Integration Fallbacks
* Always wrap native imports (like `expo-contacts`) in safe `try/catch` require blocks to prevent app crashes in environments where native modules might not be fully compiled yet.
