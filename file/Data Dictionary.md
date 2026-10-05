# 📑 مستندات فنی و واژه‌نامه جامع داده‌ها (Data Dictionary) - نسخه نهایی ۶۶ ستونه

این سند به عنوان **واژه‌نامه رسمی و استاندارد مرجع داده‌ها (Authoritative Data Dictionary)** در سامانه یکپارچه مدیریت متادیتای مستندها (**DocuSheet API & Metadata Hub**) تدوین شده است. ساختار ستون‌های بانک اطلاعاتی در **Google Sheets**، کدهای واسط در **Google Apps Script** و کلیه ماژول‌های فرانت‌اند و بک‌اند، منطبق دقیق بر فایل مرجع `تست 1.xlsx` و شیت `کلیدهای_اصلی_JSON` شامل ۶۶ ستون استاندارد انگلیسی مهندسی شده‌اند.

---

## ۱. جدول مرجع ۶۶ ستون استاندارد گوگل شیت (مبتنی بر شیت «کلیدهای_اصلی_JSON»)

در جدول زیر، تمامی ۶۶ ستون به ترتیب دقیق ستون‌بندی فایل مرجع اکسل (ستون ۱ تا ۶۶) به همراه مسیر متناظر در شیء JSON، نوع داده و شیوه ذخیره‌سازی تشریح شده است:

| ردیف | نام ستون در گوگل‌شیت (Header) | مسیر در ساختار JSON | نوع داده | موقعیت در رابط کاربری (UI) | شیوه ذخیره‌سازی و الزامات اعتبارسنجی |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **۱** | `asset_id` | `asset_id` | String | جدول اصلی، هدر مودال، جستجو | شناسه یکتای اثر (Primary Key)؛ مبنای تشخیص تکرار |
| **۲** | `title_extracted` | `title_extracted` | String | جدول اصلی، عنوان مودال | عنوان رسمی مستند استخراج‌شده از تیتراژ اثر |
| **۳** | `title_finglish` | `title_finglish` | String | تب شناسنامه در مودال | عنوان اثر به نگارش فینگلیش استاندارد |
| **۴** | `international_title` | `international_title` | String | تب شناسنامه در مودال | عنوان رسمی بین‌المللی مستند (انگلیسی) |
| **۵** | `is_series` | `is_series` | String | فیلترها و جدول اصلی | نرمال‌شده به «بله» یا «خیر» (مجموعه‌ای یا تک‌قسمتی) |
| **۶** | `episode_number` | `episode_number` | String | تب شناسنامه در مودال | شماره قسمت (در صورت مجموعه‌ای بودن اثر) |
| **۷** | `logline` | `logline` | String | پیش‌نمایش جدول و کارت‌ها | لاگ‌لاین جذاب تک‌خطی (خلاصه زیر ۳۰ کلمه) |
| **۸** | `short_synopsis` | `short_synopsis` | String | تب روایت در مودال | خلاصه کوتاه مناسب کاتالوگ جشنواره (۵۰ تا ۸۰ کلمه) |
| **۹** | `long_synopsis` | `long_synopsis` | String | تب روایت در مودال | خلاصه روایی تفصیلی و داستان کامل (۳۰۰ تا ۵۰۰ کلمه) |
| **۱۰** | `technical_judicial_notes` | `technical_judicial_notes` | String | تب داوری در مودال | نکات و ملاحظات فنی و نظارتی هیئت انتخاب و داوران |
| **۱۱** | `format_category` | `format_category` | String | جدول و فیلترهای اصلی | قالب تولیدی مستند (فیلم مستند، مستند داستانی، نماهنگ) |
| **۱۲** | `main_topic` | `main_topic` | String | جدول، فیلترها و آمار | کلان‌موضوع اصلی اثر (بر اساس سرفصل‌های موضوعی جشنواره) |
| **۱۳** | `sub_topic` | `sub_topic` | String | تب متادیتا در مودال | ریزموضوع تخصصی و گفتمانی مستند |
| **۱۴** | `time_category` | `time_category` | String | فیلتر دسته‌بندی زمانی | دسته‌بندی اثر (کوتاه، نیمه‌بلند، بلند) |
| **۱۵** | `duration_exact` | `duration_exact` | String | جدول اصلی، کارت KPI زمان | مدت زمان دقیق (HH:MM:SS یا MM:SS)؛ مبنای محاسبات زمان |
| **۱۶** | `documentary_mode` | `documentary_mode` | String | فیلتر پیشرفته، تب روایت | فرم و گونه روایی نیکولز (اکسپوزیتوری، مشاهده‌گر، تعاملی و...) |
| **۱۷** | `temporal_era` | `temporal_era` | String | فیلتر دوره زمانی و مودال | مقطع زمانی و دوره تاریخی وقایع مستند (مثلاً دهه ۱۳۹۰) |
| **۱۸** | `symbols_and_motifs` | `symbols_and_motifs` | String | تب نشانه‌شناسی در مودال | نمادها، المان‌های نشانه‌شناختی و موتیف‌های کلیدی |
| **۱۹** | `geographical_locations` | `geographical_locations` | Array | تگ‌های جدول و مودال | آرایه نام مکان‌ها؛ ذخیره با کامای فارسی (`، `) در شیت |
| **۲۰** | `main_protagonist_subject` | `main_protagonist_subject` | String | جدول اصلی و سرچ | قهرمان محوری، شخصیت یا سوژه اصلی اثر |
| **۲۱** | `core_message` | `core_message` | String | تب پیام اثر در مودال | پیام بنیادین، جان‌مایه فکری و ایدئولوژیک مستند |
| **۲۲** | `subject_profession` | `subject_profession` | String | تب متادیتا در مودال | شغل، حرفه یا جایگاه اجتماعی سوژه اثر |
| **۲۳** | `keyframe_timestamps_5frames` | `keyframe_timestamps_5frames` | String | تب تصاویر در مودال | تایم‌کدهای ۵ فریم شاخص مستند جهت تولید پوستر و اسکرین‌شات |
| **۲۴** | `crew.director` | `crew.director` | String | جدول اصلی، تب عوامل | کارگردان اثر (Director) |
| **۲۵** | `crew.producer_individual` | `crew.producer_individual` | String | تب عوامل تولید | تهیه‌کننده حقیقی اثر |
| **۲۶** | `crew.legal_producer_entity` | `crew.legal_producer_entity` | String | تب عوامل تولید | تهیه‌کننده حقوقی / سازمان سازنده مستند |
| **۲۷** | `crew.executive_producer` | `crew.executive_producer` | String | تب عوامل تولید | مجری طرح اثر |
| **۲۸** | `crew.screenwriter` | `crew.screenwriter` | String | تب عوامل تولید | نویسنده یا فیلمنامه‌نویس مستند |
| **۲۹** | `crew.researcher` | `crew.researcher` | String | تب عوامل تولید | محقق و پژوهشگر مستند |
| **۳۰** | `crew.cinematographer` | `crew.cinematographer` | String | تب عوامل تولید | مدیر فیلمبرداری یا تصویربردار اصلی |
| **۳۱** | `crew.camera_operator` | `crew.camera_operator` | String | تب عوامل تولید | تصویربردار دوم / اپراتور دوربین |
| **۳۲** | `crew.sound_recordist` | `crew.sound_recordist` | String | تب عوامل تولید | صدابردار صحنه |
| **۳۳** | `crew.sound_designer` | `crew.sound_designer` | String | تب عوامل تولید | صداگذار و طراح باند صوتی |
| **۳۴** | `crew.editor` | `crew.editor` | String | تب عوامل تولید | تدوینگر اثر |
| **۳۵** | `crew.music_composer` | `crew.music_composer` | String | تب عوامل تولید | آهنگساز و سازنده موسیقی متن |
| **۳۶** | `crew.music_arranger` | `crew.music_arranger` | String | تب عوامل تولید | تنظیم‌کننده موسیقی |
| **۳۷** | `crew.narrator` | `crew.narrator` | String | تب عوامل تولید | گوینده گفتار متن / نریتور |
| **۳۸** | `crew.actors` | `crew.actors` | String | تب عوامل تولید | بازیگران یا چهره‌های بازسازی نمایشی |
| **۳۹** | `crew.production_manager` | `crew.production_manager` | String | تب عوامل تولید | مدیر تولید |
| **۴۰** | `crew.set_and_costume_designer` | `crew.set_and_costume_designer` | String | تب عوامل تولید | طراح صحنه و لباس |
| **۴۱** | `crew.vfx_designer` | `crew.vfx_designer` | String | تب عوامل تولید | طراح جلوه‌های ویژه بصری (VFX) |
| **۴۲** | `crew.title_and_graphic_designer` | `crew.title_and_graphic_designer` | String | تب عوامل تولید | طراح تیتراژ و گرافیک تصویری |
| **۴۳** | `crew.still_photographer` | `crew.still_photographer` | String | تب عوامل تولید | عکاس صحنه و پشت صحنه |
| **۴۴** | `crew.poet_lyricist` | `crew.poet_lyricist` | String | تب عوامل تولید | شاعر یا ترانه‌سرا |
| **۴۵** | `crew.singer_vocalist` | `crew.singer_vocalist` | String | تب عوامل تولید | خواننده |
| **۴۶** | `crew.choral_group` | `crew.choral_group` | String | تب عوامل تولید | گروه همسرایان / گروه سرود و کر |
| **۴۷** | `crew.animator` | `crew.animator` | String | تب عوامل تولید | پویانما و طراح موشن‌گرافیک |
| **۴۸** | `crew.reporter` | `crew.reporter` | String | تب عوامل تولید | خبرنگار یا گزارشگر میدانی |
| **۴۹** | `interviewees_with_timecodes` | `interviewees_with_timecodes` | Array of Obj | مینی‌جدول مصاحبه‌ها | فرمت‌بندی با جداکننده `\|\|` بین مصاحبه‌ها و `\|` بین فیلدها |
| **۵۰** | `archival_footage_log.status` | `archival_footage_log.status` | String | تب آرشیو در مودال | وضعیت فوتیج آرشیوی (دارد / فوتیج شناسایی نشد) |
| **۵۱** | `archival_footage_log.timecodes` | `archival_footage_log.timecodes` | String | تب آرشیو در مودال | بازه‌های زمانی استفاده از راش‌های آرشیوی |
| **۵۲** | `archival_footage_log.source_evidence` | `archival_footage_log.source_evidence` | String | تب آرشیو در مودال | سازمان یا منبع تامین‌کننده تصاویر آرشیوی |
| **۵۳** | `music_cues` | `music_cues` | Array of Obj | خط زمان موسیقی | فرمت‌بندی با جداکننده `\|\|` بین قطعات و `\|` بین فیلدها |
| **۵۴** | `thematic_tags` | `thematic_tags` | Array | بج‌ها و برچسب‌های رنگی | برچسب‌های موضوعی؛ ذخیره با کامای فارسی (`، `) در شیت |
| **۵۵** | `semantic_keywords` | `semantic_keywords` | Array | برچسب‌های کلیدواژه | کلمات کلیدی معنایی؛ ذخیره با کامای فارسی (`، `) در شیت |
| **۵۶** | `languages_and_dialects` | `languages_and_dialects` | Array | برچسب‌های زبانی | زبان‌ها و لهجه‌ها؛ ذخیره با کامای فارسی (`، `) در شیت |
| **۵۷** | `visual_qc` | `visual_qc` | String | تب ارزیابی فنی در مودال | وضعیت کنترل کیفیت تصویر و وضوح بصری |
| **۵8** | `audio_style` | `audio_style` | String | تب ارزیابی فنی در مودال | تحلیل بافت صوتی و کیفیت میکس و مسترینگ |
| **۵۹** | `content_advisory_and_warnings` | `content_advisory_and_warnings` | String | تب هشدارهای اخلاقی | تذکرات و هشدارهای محتوایی (فاقد مورد یا رده‌بندی) |
| **۶۰** | `recommended_age_rating` | `recommended_age_rating` | String | فیلتر سنی و کارت اثر | رده‌بندی سنی پیشنهادی (عمومی، +۱۲، +۱۵ و...) |
| **۶۱** | `ammar_discourse_score` | `ammar_discourse_score` | Number | کارت KPI، جدول اصلی | امتیاز گفتمانی عمار از ۰.۰ تا ۱۰.۰ |
| **۶۲** | `ammar_discourse_reasons` | `ammar_discourse_reasons` | String | تب ارزیابی گفتمانی | دلایل، براهین و مؤلفه‌های کسب امتیاز گفتمانی |
| **۶۳** | `subtitles_srt` | `subtitles_srt` | String | تب زیرنویس در مودال | محتوا یا وضعیت فایل زیرنویس با فرمت استاندارد SRT |
| **۶۴** | `confidence_score` | `confidence_score` | Number | تولتیپ اعتبارسنجی سیستم | ضریب اطمینان استخراج هوش مصنوعی (از ۰.۰ تا ۱.۰) |
| **۶۵** | `human_verification_status` | `human_verification_status` | String | فیلتر وضعیت و کارت KPI | وضعیت ارزیابی انسانی (در انتظار بررسی داوران / تایید شده) |
| **۶۶** | `system_review_flags` | `system_review_flags` | String | هشدارهای سیستمی ادمین | مغایرت‌های احتمالی متن تیتراژ با محتوای فیلم |

---

## ۲. قواعد سریال‌سازی و پارس ساختارهای پیچیده

### الف) ساختار ۲۵ گانه عوامل تولید (`crew.*`)
تمامی کلیدهای آبجکت `crew` به صورت ستون‌های مستقل با پیشوند `crew.` در گوگل‌شیت ذخیره می‌شوند (ستون‌های ۲۴ تا ۴۸). در بازسازی JSON، تمامی این ستون‌ها مجدداً درون شیء یکپارچه `crew` قرار می‌گیرند.

### ب) لیست مصاحبه‌شوندگان (`interviewees_with_timecodes`)
در ستون شماره ۴۹، تمامی مصاحبه‌شوندگان به صورت یک رشته ساختاریافته ذخیره می‌شوند:
* **جداکننده بین اشخاص مختلف:** دو خط عمودی (` || `)
* **جداکننده ویژگی‌های هر شخص:** تک خط عمودی (` | `)
* **نمونه فرمت خروجی:**
  ```text
  name: علی رضایی | role: مدیر خیریه | timecode_in: 00:01:13 | timecode_out: 00:01:31 | topic: نحوه مواجهه || name: مریم سلیمانی | role: پژوهشگر | timecode_in: 00:04:10 | timecode_out: 00:05:20 | topic: وضعیت محرومیت
  ```

### ج) لیست نشانه‌های موسیقی (`music_cues`)
در ستون شماره ۵۳، نشانه‌های موسیقی به صورت ساختاریافته ذخیره می‌شوند:
* **جداکننده بین قطعات مختلف:** دو خط عمودی (` || `)
* **جداکننده ویژگی‌ها:** تک خط عمودی (` | `)
* **نمونه فرمت خروجی:**
  ```text
  timecode_in: 00:00:10 | timecode_out: 00:01:00 | type: موسیقی پیانو ملایم || timecode_in: 00:03:00 | timecode_out: 00:04:20 | type: موسیقی ارکسترال حماسی
  ```

### د) آرایه‌های متنی ساده (Flat Arrays)
ستون‌های ۱۹ (`geographical_locations`)، ۵۴ (`thematic_tags`)، ۵۵ (`semantic_keywords`) و ۵۶ (`languages_and_dialects`) با استفاده از کامای فارسی (`، `) به یکدیگر متصل و در شیت ذخیره می‌شوند و در زمان بازخوانی با رجکس `/[،,]/` مجدداً به آرایه کلاینت تبدیل می‌شوند.

---

## ۳. سیاست‌ها و ۵ حق انتخاب کاربر در زمان برخورد با کد اثر تکراری (Duplicate Asset ID)

هنگامی که اپراتور فایلی با شناسه `asset_id` که پیش‌تر در پایگاه داده گوگل شیت وجود دارد آپلود می‌کند، سامانه به جای خطای مسدودکننده، یک هاب تصمیم‌گیری هوشمند با ۵ حق انتخاب کامل در اختیار وی قرار می‌دهد:

1. **به‌روزرسانی و جایگزینی ردیف موجود (Update Existing Row):**
   * سطر قبلی متناظر با این کد اثر در گوگل‌شیت پیدا شده و تمامی ۶۶ ستون آن با مقادیر فایل جدید بازنویسی می‌گردد (`duplicateAction: 'update'`).
2. **ثبت به عنوان ردیف جدید با حفظ شناسه (Force Append):**
   * بدون هیچ تغییری در شناسه، رکورد جدید در یک سطر تازه در انتهای گوگل‌شیت درج می‌شود (`duplicateAction: 'append'`).
3. **تولید خودکار شناسه جدید / نسخه جدید (Auto Versioning):**
   * سیستم یک شناسه بدون تداخل مانند `[asset_id]-v2` یا `[asset_id]-rev1` پیشنهاد می‌دهد (با امکان ویرایش دلخواه کاربر) و رکورد به صورت مستقل و امن درج می‌شود.
4. **مشاهده و مقایسه تفاوت‌ها (Side-by-Side Diff Modal):**
   * باز شدن پنجره مقایسه تطبیقی دو ستونه بین داده‌های فایل جدید و داده‌های موجود در سیستم با مشخص کردن تفاوت‌ها و قابلیت تصمیم‌گیری مستقیم درون پنجره مقایسه.
5. **انصراف و لغو عملیات (Cancel):**
   * لغو بارگذاری و پاک‌سازی وضعیت فایل بدون دستکاری داده‌های پایگاه داده.

---

## ۴. فرمول محاسباتی کارت‌های شاخص کلیدی عملکرد (KPIs)

1. **تعداد کل مستندات:** شمارش تعداد ردیف‌های با `asset_id` معتبر (`documentaryStore.length`).
2. **مجموع زمان مستندها:** جمع عددی ثانیه‌های به دست آمده از پارس `duration_exact` تمام سطرها و نمایش در قالب متنی `X ساعت و Y دقیقه`.
3. **میانگین امتیاز گفتمان عمار:** میانگین حسابی مقادیر عددی `ammar_discourse_score` سطرهایی که دارای نمره مثبت هستند.
4. **درصد بررسی ناظران:** نسبت آثاری که وضعیت `human_verification_status` آن‌ها شامل عبارت «تایید» یا «verified» است به کل مستندات ضرب در ۱۰۰.
