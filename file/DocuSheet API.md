# 🎯 مستندات جامع و راهنمای فنی وب‌سرویس DocuSheet API (نسخه دوطرفه ۶۶ ستونه)

## ۱. معرفی و اهداف کلان سامانه (System Overview)

پروژه **DocuSheet API & Metadata Hub** یک سیستم جامع، مدرن و دوطرفه (Bidirectional Sync) برای ثبت، اعتبارسنجی، تحلیل و مدیریت متادیتای تفصیلی فیلم‌های مستند در جشنواره مردمی فیلم عمار است. این سامانه به عنوان واسط هوشمند میان اپراتورهای ثبت، یک پایگاه داده بر بستر ابری **Google Sheets** و یک وب‌داشبورد پیشرفته عمل می‌کند.

تمامی ارتباطات و ساختار داده‌های این سامانه بر اساس فایل مرجع `تست 1.xlsx` و شیت `کلیدهای_اصلی_JSON` شامل **۶۶ ستون استاندارد انگلیسی** سازمان‌دهی شده است.

---

## ۲. جریان تبادل داده (Dual-Cycle Operational Workflow)

تبادل اطلاعات در این سامانه در دو چرخه مستقل و خودکار پیاده‌سازی شده است:

```
[ اپراتور / فایل JSON ] 
         │
         ▼
[ داشبورد وب (فرانت‌اند) ] ── (POST) ──► [ سرور Express / ولیدیشن ] ── (POST) ──► [ Google Apps Script ] ──► [ Google Sheets (۶۶ ستون) ]
         ▲                                                                                 │
         └────────────────────────────────── (GET زنده / همگام‌سازی) ───────────────────────┘
```

### الف) فرآیند ثبت و نگارش داده‌ها (Write / POST Process)
1. **بارگذاری فایل:** اپراتور، فایل JSON استخراج‌شده را در کامپوننت `JsonUploaderModal` آپلود می‌کند.
2. **اعتبارسنجی اسکیما:** ساختار فایل بر اساس اعتبارسنجی دقیق ۶۶ ستونه بررسی شده و در صورت انطباق، پیش‌نمایش آن تولید می‌شود.
3. **بررسی کد اثر تکراری (Duplicate Detection):** سیستم وجود کد اثر را در پایگاه داده بررسی می‌کند. در صورت تکرار، ۵ حق انتخاب هوشمند در اختیار اپراتور قرار می‌گیرد:
   - **به‌روزرسانی و جایگزینی ردیف موجود (Update):** بازنویسی سطر قبلی در گوگل‌شیت.
   - **ثبت به عنوان ردیف جدید با حفظ شناسه (Force Append):** درج یک ردیف جدید در انتهای شیت.
   - **تولید خودکار شناسه جدید (نسخه‌گذاری):** ایجاد شناسه مستقل مانند `1504595-v2` یا `1504595-rev1`.
   - **مشاهده و مقایسه تفاوت‌ها (Side-by-Side Diff):** بررسی تطبیقی دو ستونه تغییرات.
   - **انصراف و لغو عملیات (Cancel).**
4. **تبدیل به ۶۶ ستون فلت:** اطلاعات درختواره‌ای JSON به آرایه ۶۶ مقداری متناظر با هدرهای شیت تبدیل می‌شود:
   - ۲۵ نقش عوامل در ستون‌های `crew.*`
   - ۳ ویژگی تصاویر آرشیوی در ستون‌های `archival_footage_log.*`
   - لیست مصاحبه‌شوندگان با جداکننده `||` و مشخصه‌های `|`
   - لیست نشانه‌های موسیقی با جداکننده `||` و مشخصه‌های `|`
   - آرایه‌های مکانی، تگ‌ها و کلیدواژه‌ها با کامای فارسی `، `
5. **ارسال به وب‌اپلیکیشن Google Apps Script:** داده با متد `POST` و اکشن مربوطه ارسال و در شیت ثبت می‌شود.

### ب) فرآیند فراخوانی و همگام‌سازی داده‌ها (Read / GET Process)
1. **فراخوانی اولیه و دوره‌ای:** با باز شدن داشبورد یا کلیک کاربر روی دکمه «همگام‌سازی»، درخواست `GET` به سمت وب‌اپلیکیشن گوگل ارسال می‌شود.
2. **بازسازی شیء استاندارد JSON:** کدهای Apps Script تمامی ۶۶ ستون سطرها را خوانده و با معکوس‌سازی جداکننده‌ها، اشیاء تو در تو و آرایه‌ها را بازسازی می‌کنند.
3. **رندر جدول و شاخص‌های کلیدی (KPIs):** جدول داده‌ها، فیلترهای چندمعیاره، سیستم جستجوی لحظه‌ای با تاخیر ۳۰۰ میلی‌ثانیه و کارت‌های آمار بالای صفحه به‌صورت پویا به‌روزرسانی می‌شوند.

---

## ۳. مشخصات کامل رفرنس ۶۶ ستون استاندارد

ستون‌های جدول در گوگل‌شیت دقیقاً مطابق با لیست زیر شماره‌گذاری و مرتب شده‌اند:
1. `asset_id`
2. `title_extracted`
3. `title_finglish`
4. `international_title`
5. `is_series`
6. `episode_number`
7. `logline`
8. `short_synopsis`
9. `long_synopsis`
10. `technical_judicial_notes`
11. `format_category`
12. `main_topic`
13. `sub_topic`
14. `time_category`
15. `duration_exact`
16. `documentary_mode`
17. `temporal_era`
18. `symbols_and_motifs`
19. `geographical_locations`
20. `main_protagonist_subject`
21. `core_message`
22. `subject_profession`
23. `keyframe_timestamps_5frames`
24. `crew.director`
25. `crew.producer_individual`
26. `crew.legal_producer_entity`
27. `crew.executive_producer`
28. `crew.screenwriter`
29. `crew.researcher`
30. `crew.cinematographer`
31. `crew.camera_operator`
32. `crew.sound_recordist`
33. `crew.sound_designer`
34. `crew.editor`
35. `crew.music_composer`
36. `crew.music_arranger`
37. `crew.narrator`
38. `crew.actors`
39. `crew.production_manager`
40. `crew.set_and_costume_designer`
41. `crew.vfx_designer`
42. `crew.title_and_graphic_designer`
43. `crew.still_photographer`
44. `crew.poet_lyricist`
45. `crew.singer_vocalist`
46. `crew.choral_group`
47. `crew.animator`
48. `crew.reporter`
49. `interviewees_with_timecodes`
50. `archival_footage_log.status`
51. `archival_footage_log.timecodes`
52. `archival_footage_log.source_evidence`
53. `music_cues`
54. `thematic_tags`
55. `semantic_keywords`
56. `languages_and_dialects`
57. `visual_qc`
58. `audio_style`
59. `content_advisory_and_warnings`
60. `recommended_age_rating`
61. `ammar_discourse_score`
62. `ammar_discourse_reasons`
63. `subtitles_srt`
64. `confidence_score`
65. `human_verification_status`
66. `system_review_flags`

---

## ۴. مستندات کامل نقاط دسترسی سرور (Express REST API)

### ۱. بررسی سلامت سامانه (Health Check)
* **آدرس:** `GET /api/v1/health`
* **پاسخ:** وضعیت سرور، مدت زمان آپ‌تایم، تعداد رکوردهای فعال و وضعیت دسترسی به وب‌اپلیکیشن گوگل (تضمین تاخیر زیر ۲ ثانیه).

### ۲. واکشی لیست مستندها با فیلتر و صفحه‌بندی
* **آدرس:** `GET /api/v1/documentaries`
* **پارامترهای جستجو و فیلتر:**
  * `page` (پیش‌فرض: ۱)
  * `limit` (پیش‌فرض: ۱۰، حداکثر: ۱۰۰)
  * `q` یا `search` (جستجوی متنی همزمان در عنوان، خلاصه، عوامل و کلیدواژه‌ها)
  * `topic` (فیلتر بر اساس کلان‌موضوع با نرمال‌سازی کسره و اعراب فارسی)
  * `format` (قالب مستند)
  * `temporal_era` (مقطع زمانی)
  * `verification` (وضعیت بررسی ناظران)
  * `is_series` (مجموعه‌ای یا تک‌قسمتی)
  * `time_category` (دسته‌بندی زمانی)
  * `sortBy` (مرتب‌سازی بر اساس ستون‌های مختلف)
  * `order` (`asc` یا `desc`)
* **خروجی:** شامل آبجکت `pagination`، آرایه `data`، شاخص‌های `kpis` و متریک‌های سیستمی `metrics`.

### ۳. دریافت متادیتای تکی اثر
* **آدرس:** `GET /api/v1/documentaries/:id`
* **خروجی:** شیء کامل JSON رکورد مستند مورد نظر منطبق بر اسکیما.

### ۴. ثبت و ذخیره‌سازی مستند جدید یا به‌روزرسانی
* **آدرس:** `POST /api/v1/documentaries`
* **بدنه درخواست:**
  ```json
  {
    "jsonContent": { ... },
    "duplicateAction": "update" // یا "append"
  }
  ```

### ۵. همگام‌سازی زنده با گوگل شیت
* **آدرس:** `POST /api/v1/sync`
* **بدنه اختیاری:** `{ "webAppUrl": "https://script.google.com/...", "mode": "live" }`

### ۶. تنظیمات اتصال و استخراج کد اسکریپت
* `GET /api/v1/config` و `POST /api/v1/config` (مدیریت URL و وضعیت اتصال)
* `GET /api/v1/google-apps-script` (ارائه سورس‌کد جهت کپی مستقیم در Google Sheet)
* `POST /api/v1/validate` (اعتبارسنجی هرگونه JSON دلخواه)

---

## ۵. راهنمای راه‌اندازی و استقرار در Google Apps Script

1. در فایل گوگل شیت خود وارد منوی **Extensions > Apps Script** شوید.
2. محتوای فایل `script.google.com code.txt` را در ویرایشگر اسکریپت کپی کنید.
3. دکمه **Deploy > New deployment** را بزنید.
4. نوع استقرار را روی **Web app** بگذارید:
   - **Execute as:** Me (`your-email@gmail.com`)
   - **Who has access:** Anyone
5. شناسه URL تولید شده را کپی کرده و در بخش تنظیمات داشبورد وارد نمایید.
