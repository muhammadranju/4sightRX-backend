# 🏥 4sightRX API Documentation

### সহজ বাংলা গাইড (Step-by-Step Flow)

আপনার অ্যাপের সম্পূর্ণ সিস্টেমটি একটি **চেইনের মতো কাজ করে**।  
একটি API-এর আউটপুট পরবর্তী API-এর ইনপুট হিসেবে ব্যবহৃত হয়।

এই ডকুমেন্টে পুরো প্রসেসটি সহজ ভাষায় ব্যাখ্যা করা হয়েছে।

---

# 🟢 ধাপ ০: প্রস্তুতি (Setup Phase)

মূল প্রসেস শুরু করার আগে ডেটাবেজে কিছু বেসিক ডেটা থাকতে হবে:

- **Facility** → হাসপাতাল বা মেডিকেল সেন্টার
- **Patient** → যার জন্য প্রেসক্রিপশন চেক করা হবে
- **Therapeutics & Rules** → কোন ওষুধের পরিবর্তে কী দেওয়া যাবে এবং হাসপাতালের নিয়ম

---

# 🔄 সম্পূর্ণ API ফ্লো (The Chain)

নীচে ৫টি ধাপে পুরো সিস্টেমটি দেখানো হলো:

---

# 📌 Step 1: OCR Phase

### ছবি থেকে ওষুধ বের করা

ইউজার প্রেসক্রিপশনের ছবি আপলোড করলে এই API কল হয়।

### 🔹 API

```

POST /medications/extract-text

```

### 🔹 Input

- Image File (Multipart Form Data)

### 🔹 কাজ

- ছবি থেকে ওষুধের নাম, শক্তি (Strength), ডোজ বের করা

### 🔹 Output

```json
[
  {
    "name": "Atorvastatin",
    "strength": "20mg",
    "dosage": "1 tablet"
  }
]
```

### 🔹 পরবর্তী ধাপ

এই লিস্ট ইউজারকে দেখানো হবে।
ইউজার এডিট/কনফার্ম করলে Step 2-তে যাবে।

---

# 📌 Step 2: Save Phase

### ওষুধ ডেটাবেজে সেভ করা

ইউজার Confirm করলে ওষুধগুলো ডেটাবেজে সেভ করা হয়।

### 🔹 API

```
POST /medications/bulk
```

### 🔹 Input

```json
{
  "patientId": "PAT-001",
  "sessionId": "SESSION-123",
  "medications": [...]
}
```

### 🔹 কাজ

- নির্দিষ্ট sessionId-এর অধীনে সব ওষুধ সেভ করা

### 🔹 Output

```json
[
  {
    "_id": "ID-123",
    "name": "Atorvastatin",
    "strength": "20mg"
  }
]
```

### 🔹 গুরুত্বপূর্ণ

এই `_id` গুলো Step 3-তে প্রয়োজন হবে।

---

# 📌 Step 3: AI Analysis Phase

### বিকল্প ওষুধ চেক করা

ইউজার "Continue Formula Check" চাপলে এই API কল হয়।

### 🔹 API

```
POST /formulary-comparison/analyze
```

### 🔹 Input

```json
{
  "medicationIds": ["ID-123"],
  "facilityId": "FAC-001",
  "sessionId": "SESSION-123"
}
```

### 🔹 কাজ

- AI (Gemini) চেক করবে সাশ্রয়ী বিকল্প আছে কিনা

### 🔹 Output

```json
{
  "original": "Atorvastatin",
  "alternative": "Simvastatin",
  "reason": "Lower cost alternative available",
  "estimatedSavings": 450
}
```

### 🔹 UI Flow

Side-by-Side কম্পারিজন স্ক্রিনে দেখানো হবে।

---

# 📌 Step 4: Decision Phase

### ইউজারের সিদ্ধান্ত সেভ করা

প্রতিটি ওষুধের পাশে ৩টি অপশন থাকবে:

- Accept
- Decline
- Discontinue

### 🔹 API

```
PATCH /formulary-comparison/:id/action
```

### 🔹 Input

```json
{
  "action": "accepted",
  "note": "Verified"
}
```

### 🔹 কাজ

- ইউজারের সিদ্ধান্ত ডেটাবেজে সেভ করা

---

# 📌 Step 5: Summary Phase

### ফাইনাল রিপোর্ট দেখানো

সব সিদ্ধান্ত নেওয়া হয়ে গেলে ফাইনাল রিপোর্ট দেখা যাবে।

### 🔹 API

```
GET /formulary-comparison/summary?sessionId=SESSION-123
```

### 🔹 Output

```json
{
  "changed": [...],
  "continued": [...],
  "discontinued": [...],
  "totalSavings": 450
}
```

---

# 📊 Visual Flow Diagram

```
Capture Image
      ↓
POST /medications/extract-text
      ↓
User Confirmation
      ↓
POST /medications/bulk
      ↓
Continue Formula Check
      ↓
POST /formulary-comparison/analyze
      ↓
User Decision (Accept / Decline)
      ↓
PATCH /formulary-comparison/:id/action
      ↓
GET /formulary-comparison/summary
      ↓
Final Report Display
```

---

# 💡 Real-Life Example

ধরা যাক প্রেসক্রিপশনে আছে:

```
Atorvastatin 20mg
```

### ✅ Step 1 (OCR)

Response:

```
Atorvastatin, 20mg, 1 tablet
```

### ✅ Step 2 (Save)

Database থেকে পেলেন:

```
ID-123
```

### ✅ Step 3 (Analyze)

AI বললো:

```
Simvastatin ব্যবহার করুন
Savings: 450 TK
```

### ✅ Step 4 (Decision)

User → Accept
Note → "Verified"

### ✅ Step 5 (Summary)

```
Changed Medications:
Atorvastatin → Simvastatin
Saved 450 TK
```

---

# 🔐 গুরুত্বপূর্ণ বিষয়

পুরো প্রসেসে একটি `sessionId` শুরু থেকে শেষ পর্যন্ত মেইনটেইন করতে হবে।
এটাই পুরো চেইনকে এক সুতোয় গেঁথে রাখবে।

---

# ✅ System Philosophy

✔ API Chain Based Architecture
✔ Session Driven Workflow
✔ AI Assisted Decision Support
✔ Cost Optimization Focused

---

**Prepared for:** 4sightRX System
**Version:** 1.0
