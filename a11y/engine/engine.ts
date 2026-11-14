// 3Shamrocks a11y engine: deterministic static-HTML checks (WCAG 2.2 A/AA oriented).
// Pure: takes a parsed Document (deno-dom) and returns findings. No network.
// deno-lint-ignore-file no-explicit-any

export const ENGINE_VERSION = "1.0.0";

type L = { he: string; en: string };
export type Severity = "critical" | "serious" | "moderate" | "minor";
export interface CheckDef {
  id: string;
  wcag: string;
  level: string;
  sev: Severity;
  title: L;
  why: L;
  fix: L;
  code: string;
}
export interface Finding {
  id: string;
  wcag: string;
  level: string;
  severity: Severity;
  count: number;
  examples: { selector: string; snippet: string }[];
  title: string;
  why: string;
  fix?: string;
  code?: string;
}

export const WEIGHTS: Record<Severity, number> = { critical: 10, serious: 6, moderate: 3, minor: 1 };

// ---------- check catalogue ----------
const C = (id: string, wcag: string, level: string, sev: Severity, title: L, why: L, fix: L, code: string): CheckDef => ({ id, wcag, level, sev, title, why, fix, code });

export const CHECKS: CheckDef[] = [
  C(
    "html-lang",
    "3.1.1",
    "A",
    "serious",
    { he: "לעמוד אין שפה מוגדרת (lang) או שהיא לא תקינה", en: "Page language (lang) is missing or invalid" },
    {
      he: "קורא מסך משתמש בשפת העמוד כדי לבחור קול והגייה. בלי lang תקין, טקסט בעברית עלול להיקרא במבטא אנגלי ולא להיות מובן.",
      en: "Screen readers use the page language to pick a voice and pronunciation. Without a valid lang, text can be read with the wrong accent and become unintelligible.",
    },
    { he: "הוסיפו lang תקני לתגית html (למשל he לעברית, en לאנגלית).", en: "Add a valid lang attribute to the html element (e.g. he for Hebrew, en for English)." },
    `<html lang="he" dir="rtl">`,
  ),
  C(
    "html-lang-mismatch",
    "3.1.1",
    "A",
    "serious",
    { he: "רוב התוכן בעברית, אבל שפת העמוד מוגדרת אחרת", en: "Most content is Hebrew but the page language says otherwise" },
    { he: "קורא המסך יקרא את העברית לפי כללי הגייה של שפה אחרת, והתוכן ייצא משובש.", en: "Screen readers will pronounce the Hebrew text with another language's rules, garbling the content." },
    { he: "עדכנו את lang בתגית html ל-he. אם חלק מהתוכן בשפה אחרת, סמנו רק אותו ב-lang משלו.", en: 'Set lang="he" on the html element. Mark any passages in another language with their own lang.' },
    `<html lang="he" dir="rtl">\n  ...\n  <p lang="en">English quote</p>`,
  ),
  C("html-dir", "1.3.2", "A", "minor", { he: 'תוכן בעברית בלי כיווניות dir="rtl"', en: 'Hebrew content without dir="rtl"' }, {
    he: "בלי כיווניות מוגדרת, סדר הקריאה של סימני פיסוק, מספרים וטקסט מעורב עלול להשתבש, גם לקוראי מסך וגם בתצוגה.",
    en: "Without a declared direction, punctuation, numbers and mixed text can be read and shown in the wrong order.",
  }, {
    he: 'הוסיפו dir="rtl" לתגית html (או body). אם הכיווניות מוגדרת רק ב-CSS, מומלץ להגדיר אותה גם ב-HTML.',
    en: 'Add dir="rtl" to the html (or body) element. If direction is only set in CSS, also declare it in HTML.',
  }, `<html lang="he" dir="rtl">`),
  C(
    "page-title",
    "2.4.2",
    "A",
    "serious",
    { he: "לעמוד אין כותרת (title)", en: "Page has no title" },
    { he: "הכותרת היא הדבר הראשון שקורא מסך מקריא, והיא מבדילה בין לשוניות פתוחות.", en: "The title is the first thing a screen reader announces and how people tell open tabs apart." },
    { he: "הוסיפו title קצר ותיאורי בתוך head.", en: "Add a short, descriptive title inside head." },
    `<title>חנות נעליים | דגמי ריצה</title>`,
  ),
  C(
    "meta-viewport",
    "1.4.4",
    "AA",
    "serious",
    { he: "העמוד חוסם הגדלה במובייל (user-scalable / maximum-scale)", en: "Page blocks pinch-zoom on mobile (user-scalable / maximum-scale)" },
    {
      he: "אנשים עם ראייה ירודה מגדילים את המסך כדי לקרוא. חסימת זום משאירה אותם בלי דרך לקרוא את הטקסט.",
      en: "People with low vision zoom in to read. Blocking zoom leaves them no way to read the text.",
    },
    { he: "הסירו user-scalable=no ו-maximum-scale מתגית ה-viewport.", en: "Remove user-scalable=no and maximum-scale from the viewport meta tag." },
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  ),
  C(
    "meta-refresh",
    "2.2.1",
    "A",
    "serious",
    { he: "העמוד מתרענן או מעביר אוטומטית אחרי זמן קצוב", en: "Page refreshes or redirects automatically after a delay" },
    { he: "רענון אוטומטי קוטע קריאה, מחזיר קורא מסך לתחילת העמוד, ולא נותן זמן מספיק.", en: "Timed refresh interrupts reading, sends screen readers back to the top and does not give enough time." },
    { he: "הסירו את meta refresh. להעברה קבועה השתמשו בהפניית שרת (301).", en: "Remove the meta refresh. For permanent moves use a server redirect (301)." },
    `<!-- remove: <meta http-equiv="refresh" content="30"> -->`,
  ),
  C(
    "img-alt",
    "1.1.1",
    "A",
    "critical",
    { he: "תמונות בלי טקסט חלופי (alt)", en: "Images without alternative text (alt)" },
    {
      he: "קורא מסך לא רואה תמונה. בלי alt הוא מקריא את שם הקובץ או מדלג, ומידע או קישור הולכים לאיבוד.",
      en: "Screen readers cannot see images. Without alt they read the file name or skip it, and information or links are lost.",
    },
    { he: 'לתמונה עם מידע: alt שמתאר אותו. לתמונה דקורטיבית: alt="" ריק.', en: 'Informative image: alt that conveys it. Decorative image: an empty alt="".' },
    `<img src="shoe.jpg" alt="נעל ריצה כחולה, מבט מהצד">\n<img src="divider.svg" alt="">`,
  ),
  C(
    "img-alt-suspicious",
    "1.1.1",
    "A",
    "minor",
    { he: 'טקסט חלופי שלא מתאר את התמונה (שם קובץ, "תמונה", "image")', en: 'Alt text that doesn\'t describe the image (file name, "image", "photo")' },
    { he: 'alt כמו "IMG_2031.jpg" או "תמונה" לא אומר למשתמש מה רואים.', en: 'Alt like "IMG_2031.jpg" or "image" tells the user nothing about what is shown.' },
    { he: 'כתבו מה התמונה מראה או עושה, בלי "תמונה של". אם היא דקורטיבית, השאירו alt ריק.', en: 'Describe what the image shows or does, without "image of". If decorative, leave alt empty.' },
    `<img src="IMG_2031.jpg" alt="צוות החנות בכניסה לסניף בתל אביב">`,
  ),
  C(
    "input-image-alt",
    "1.1.1",
    "A",
    "critical",
    { he: "כפתור תמונה (input type=image) בלי alt", en: "Image button (input type=image) without alt" },
    { he: "זה כפתור שאי אפשר לדעת מה הוא עושה בלי לראות אותו.", en: "It is a button nobody can identify without seeing it." },
    { he: "הוסיפו alt שמתאר את הפעולה.", en: "Add an alt that names the action." },
    `<input type="image" src="search.png" alt="חיפוש">`,
  ),
  C(
    "svg-img-name",
    "1.1.1",
    "A",
    "serious",
    { he: "גרפיקת SVG עם role=img בלי שם נגיש", en: "SVG with role=img has no accessible name" },
    { he: 'הוגדר שזו תמונה, אבל אין לה תיאור, אז קורא המסך מכריז "תמונה" בלי פרטים.', en: 'It is declared as an image but has no description, so it is announced as just "image".' },
    { he: "הוסיפו aria-label או רכיב title ראשון בתוך ה-SVG.", en: "Add aria-label or a first-child title element inside the SVG." },
    `<svg role="img" aria-label="דירוג 4 מתוך 5">...</svg>`,
  ),
  C("form-label", "1.3.1, 4.1.2", "A", "critical", { he: "שדות טופס בלי תווית (label)", en: "Form fields without a label" }, {
    he: 'בלי תווית, משתמש קורא מסך שומע רק "שדה עריכה" ולא יודע מה להקליד, ולכן לא יכול להשלים הרשמה, הזמנה או פנייה.',
    en: "Without a label a screen reader user hears only \"edit text\" and can't tell what to type, so they can't finish a sign-up, order or contact form.",
  }, {
    he: "חברו label לכל שדה עם for/id, או עטפו את השדה ב-label. אם אין מקום לתווית גלויה, השתמשו ב-aria-label.",
    en: "Link a label to each field with for/id, or wrap the field in a label. If there's no room for a visible label, use aria-label.",
  }, `<label for="email">אימייל</label>\n<input id="email" type="email" autocomplete="email">`),
  C(
    "label-placeholder-only",
    "3.3.2",
    "A",
    "moderate",
    { he: "שדות שהתווית היחידה שלהם היא placeholder", en: "Fields whose only label is a placeholder" },
    {
      he: "ה-placeholder נעלם כשמתחילים להקליד, בדרך כלל בניגודיות נמוכה, וחלק מקוראי המסך לא מקריאים אותו.",
      en: "Placeholders vanish while typing, are usually low contrast, and some screen readers skip them.",
    },
    { he: "הוסיפו label גלוי. אפשר להשאיר placeholder כדוגמה לפורמט.", en: "Add a visible label. Keep the placeholder only as a format hint." },
    `<label for="phone">טלפון</label>\n<input id="phone" type="tel" placeholder="050-0000000">`,
  ),
  C(
    "select-name",
    "4.1.2",
    "A",
    "critical",
    { he: "רשימות בחירה (select) בלי תווית", en: "Select menus without a label" },
    { he: "המשתמש לא יודע מה בוחרים ברשימה (מידה? צבע? עיר?).", en: "Users can't tell what the menu is for (size? colour? city?)." },
    { he: "חברו label עם for/id או aria-label.", en: "Link a label with for/id, or use aria-label." },
    `<label for="size">מידה</label>\n<select id="size">...</select>`,
  ),
  C(
    "button-name",
    "4.1.2",
    "A",
    "critical",
    { he: "כפתורים בלי שם נגיש", en: "Buttons without an accessible name" },
    {
      he: 'כפתור אייקון (סל, תפריט, חיפוש, סגירה) בלי שם מוכרז רק כ"כפתור". המשתמש לא יודע מה יקרה בלחיצה.',
      en: 'Icon buttons (cart, menu, search, close) with no name are announced as just "button". Users can\'t know what it does.',
    },
    { he: "הוסיפו טקסט לכפתור, או aria-label שמתאר את הפעולה, וסמנו את האייקון aria-hidden.", en: "Add text, or an aria-label that names the action, and mark the icon aria-hidden." },
    `<button type="button" aria-label="פתיחת תפריט">\n  <svg aria-hidden="true" focusable="false">...</svg>\n</button>`,
  ),
  C(
    "link-name",
    "2.4.4, 4.1.2",
    "A",
    "serious",
    { he: "קישורים בלי שם נגיש", en: "Links without an accessible name" },
    {
      he: 'קישור ריק (למשל אייקון רשת חברתית בלי טקסט) מוקרא רק כ"קישור" או ככתובת, ואי אפשר לדעת לאן הוא מוביל.',
      en: 'Empty links (e.g. a social icon with no text) are read as just "link" or a URL, so nobody knows where it goes.',
    },
    { he: "הוסיפו טקסט, alt לתמונה שבתוך הקישור, או aria-label.", en: "Add text, alt on the image inside the link, or aria-label." },
    `<a href="https://instagram.com/shop" aria-label="אינסטגרם של החנות">\n  <svg aria-hidden="true">...</svg>\n</a>`,
  ),
  C(
    "link-vague",
    "2.4.4",
    "A",
    "minor",
    { he: 'קישורים עמומים ("לחצו כאן", "קרא עוד")', en: 'Vague link text ("click here", "read more")' },
    { he: 'משתמשי קורא מסך עוברים על רשימת קישורים. עשרה קישורי "קרא עוד" נשמעים זהים.', en: 'Screen reader users scan a list of links. Ten "read more" links sound identical.' },
    { he: "כתבו לאן הקישור מוביל, או הוסיפו aria-label מלא.", en: "Say where the link goes, or add a full aria-label." },
    `<a href="/blog/returns">מדיניות ההחזרות שלנו</a>`,
  ),
  C(
    "nested-interactive",
    "4.1.2",
    "A",
    "serious",
    { he: "רכיבים לחיצים בתוך רכיבים לחיצים (קישור בתוך כפתור וכו')", en: "Interactive elements nested inside each other (link inside button, etc.)" },
    { he: "קוראי מסך ומקלדת לא יודעים לאיזה רכיב להתייחס, ואחד מהם הופך לבלתי נגיש.", en: "Screen readers and keyboards can't tell which control is meant; one becomes unreachable." },
    { he: "השאירו רכיב לחיץ אחד בלבד; הוציאו את הפנימי החוצה.", en: "Keep a single interactive element; move the inner one out." },
    `<a href="/product/1" class="card">...</a>\n<button type="button">הוספה לסל</button>`,
  ),
  C(
    "empty-heading",
    "1.3.1, 2.4.6",
    "AA",
    "moderate",
    { he: "כותרות ריקות", en: "Empty headings" },
    { he: "משתמשי קורא מסך מנווטים לפי כותרות. כותרת ריקה מוכרזת בלי תוכן ומבלבלת.", en: "Screen reader users navigate by headings. An empty heading is announced with nothing in it." },
    { he: "מלאו את הכותרת בטקסט, או החליפו אותה ברכיב שאינו כותרת.", en: "Put text in the heading, or change it to a non-heading element." },
    `<h2>מוצרים חדשים</h2>`,
  ),
  C(
    "heading-order",
    "1.3.1",
    "A",
    "moderate",
    { he: "דילוג ברמות הכותרות (למשל h2 ואז h4)", en: "Skipped heading levels (e.g. h2 then h4)" },
    { he: "מבנה הכותרות הוא תוכן העניינים של העמוד. דילוג גורם למשתמש לחשוב שחסר חלק.", en: "Headings are the page's table of contents. A skipped level makes users think a section is missing." },
    { he: "השתמשו ברמות ברצף לפי מבנה התוכן, ועצבו את הגודל ב-CSS.", en: "Use levels in sequence by structure; set the size with CSS." },
    `<h2>קטגוריות</h2>\n  <h3>נעליים</h3>`,
  ),
  C(
    "missing-h1",
    "2.4.6",
    "AA",
    "moderate",
    { he: "אין כותרת ראשית (h1)", en: "No main heading (h1)" },
    { he: "קוראי מסך מקפיצים ל-h1 כדי להגיע לתוכן העיקרי. בלי h1 קשה להבין על מה העמוד.", en: "Screen reader users jump to the h1 to find the main content. Without it the page's topic is unclear." },
    { he: "הוסיפו h1 אחד שמתאר את העמוד.", en: "Add one h1 that describes the page." },
    `<h1>נעלי ריצה לנשים</h1>`,
  ),
  C(
    "landmark-main",
    "1.3.1, 2.4.1",
    "A",
    "moderate",
    { he: "אין אזור תוכן ראשי (main)", en: "No main content landmark (main)" },
    { he: "main מאפשר לקורא מסך לקפוץ ישר לתוכן בלי לעבור על כל התפריט בכל עמוד.", en: "main lets screen reader users jump straight to the content instead of the whole menu on every page." },
    { he: "עטפו את התוכן העיקרי ב-main אחד.", en: "Wrap the main content in a single main element." },
    `<main id="main">...</main>`,
  ),
  C(
    "landmark-nav",
    "1.3.1",
    "A",
    "minor",
    { he: "תפריט הניווט לא מסומן כ-nav", en: "Navigation is not marked up as nav" },
    { he: "בלי nav, קוראי מסך לא יכולים לזהות ולדלג על אזור הניווט.", en: "Without nav, screen readers can't identify or skip the navigation block." },
    { he: "עטפו את התפריט הראשי ב-nav עם aria-label.", en: "Wrap the main menu in nav with an aria-label." },
    `<nav aria-label="ראשי">\n  <ul>...</ul>\n</nav>`,
  ),
  C(
    "skip-link",
    "2.4.1",
    "A",
    "minor",
    { he: 'אין קישור "דלג לתוכן"', en: 'No "skip to content" link' },
    { he: "משתמשי מקלדת צריכים לעבור עם Tab על כל התפריט בכל עמוד. קישור דילוג חוסך את זה.", en: "Keyboard users must Tab through the whole menu on every page. A skip link saves that." },
    { he: "הוסיפו קישור ראשון בעמוד שמוביל ל-main, שמופיע בפוקוס.", en: "Add a first link that targets main and becomes visible on focus." },
    `<a class="skip" href="#main">דלג לתוכן הראשי</a>\n<style>.skip{position:absolute;inset-inline-start:-999px}.skip:focus{inset-inline-start:8px;top:8px}</style>`,
  ),
  C(
    "duplicate-id-ref",
    "1.3.1, 4.1.2",
    "A",
    "moderate",
    { he: "מזהים (id) כפולים שמשמשים לתוויות או ל-ARIA", en: "Duplicate ids used by labels or ARIA" },
    {
      he: "כשתווית או aria מצביעים על id שקיים פעמיים, הדפדפן מחבר לראשון בלבד, והשדה השני נשאר בלי שם.",
      en: "When a label or ARIA points at an id that exists twice, only the first is used, leaving the other unnamed.",
    },
    { he: "ודאו שכל id ייחודי בעמוד.", en: "Make every id unique on the page." },
    `<label for="email-footer">אימייל</label>\n<input id="email-footer" type="email">`,
  ),
  C(
    "aria-ref-missing",
    "1.3.1, 4.1.2",
    "A",
    "moderate",
    { he: "aria-labelledby / aria-describedby שמצביעים על id שלא קיים", en: "aria-labelledby / aria-describedby point at ids that don't exist" },
    { he: "השם או התיאור שאמורים להיות מוקראים פשוט לא קיימים.", en: "The name or description that should be announced simply doesn't exist." },
    { he: "תקנו את ה-id או הסירו את ההפניה.", en: "Fix the id or remove the reference." },
    `<h2 id="cart-title">סל קניות</h2>\n<section aria-labelledby="cart-title">...</section>`,
  ),
  C(
    "tabindex-positive",
    "2.4.3",
    "A",
    "moderate",
    { he: "tabindex חיובי משבש את סדר המעבר במקלדת", en: "Positive tabindex breaks keyboard order" },
    { he: "tabindex גדול מ-0 קופץ לפני כל השאר, וסדר ה-Tab כבר לא תואם את מה שרואים.", en: "tabindex above 0 jumps ahead of everything else, so Tab order no longer matches what is seen." },
    { he: "השתמשו רק ב-0 או -1, וסדרו את ה-HTML לפי סדר הקריאה.", en: "Use only 0 or -1, and order the HTML by reading order." },
    `<button tabindex="0">...</button>`,
  ),
  C(
    "frame-title",
    "4.1.2",
    "A",
    "serious",
    { he: "iframe (מפה, וידאו, צ'אט) בלי title", en: "iframe (map, video, chat) without a title" },
    { he: 'קורא מסך מכריז "מסגרת" בלי לומר מה בתוכה.', en: 'Screen readers announce "frame" without saying what is inside.' },
    { he: "הוסיפו title שמתאר את התוכן.", en: "Add a title that describes the content." },
    `<iframe src="https://www.youtube.com/embed/..." title="סרטון: איך מודדים מידה"></iframe>`,
  ),
  C(
    "autoplay-audio",
    "1.4.2",
    "A",
    "serious",
    { he: "וידאו/אודיו שמתנגן אוטומטית עם קול", en: "Video/audio autoplays with sound" },
    { he: "קול אוטומטי מתנגש בקורא המסך ומונע מהמשתמש לשמוע את העמוד.", en: "Autoplaying sound talks over the screen reader so users can't hear the page." },
    { he: "הסירו autoplay, או הוסיפו muted וכפתור עצירה.", en: "Remove autoplay, or add muted plus a visible pause control." },
    `<video src="promo.mp4" autoplay muted loop playsinline controls></video>`,
  ),
  C(
    "autoplay-no-pause",
    "2.2.2",
    "A",
    "minor",
    { he: "וידאו מתנגן בלולאה בלי כפתור עצירה", en: "Looping autoplay video with no pause control" },
    {
      he: "תנועה מתמשכת מסיחה את הדעת ויכולה להזיק לאנשים עם קשב או רגישות לתנועה. צריך דרך לעצור.",
      en: "Continuous motion distracts and can harm people with attention or motion sensitivity. There must be a way to stop it.",
    },
    { he: "הוסיפו controls או כפתור עצירה משלכם (אם כפתור כזה מוזרק בקוד JS, זה בסדר).", en: "Add controls or your own pause button (fine if your JS adds one)." },
    `<video src="hero.mp4" autoplay muted loop playsinline controls></video>`,
  ),
  C(
    "video-captions",
    "1.2.2",
    "A",
    "moderate",
    { he: "וידאו עם קול בלי כתוביות (track)", en: "Video with sound and no captions (track)" },
    { he: "אנשים חירשים וכבדי שמיעה לא מקבלים את המידע שנאמר בסרטון.", en: "Deaf and hard-of-hearing people miss everything that is said." },
    { he: "הוסיפו קובץ כתוביות (VTT) ב-track, או כתוביות צרובות.", en: "Add a captions file (VTT) with track, or burnt-in captions." },
    `<video controls>\n  <source src="how-to.mp4">\n  <track kind="captions" src="how-to.he.vtt" srclang="he" label="עברית" default>\n</video>`,
  ),
  C(
    "blink-marquee",
    "2.2.2",
    "A",
    "serious",
    { he: "שימוש ב-marquee או blink", en: "Uses marquee or blink" },
    { he: "טקסט זז או מהבהב בלי שליטה קשה לקריאה ומסיח.", en: "Moving or blinking text with no control is hard to read and distracting." },
    { he: "החליפו בטקסט סטטי.", en: "Replace with static text." },
    `<p>מבצע: משלוח חינם מעל 200 ₪</p>`,
  ),
  C(
    "table-headers",
    "1.3.1",
    "A",
    "moderate",
    { he: "טבלאות נתונים בלי כותרות (th)", en: "Data tables without header cells (th)" },
    { he: "בלי th, קורא מסך מקריא מספרים בלי לומר לאיזו עמודה הם שייכים (למשל טבלת מידות).", en: "Without th, numbers are read without their column (e.g. a size chart)." },
    { he: 'סמנו כותרות ב-th עם scope. אם זו טבלת עימוד ולא נתונים, הוסיפו role="presentation".', en: 'Mark headers as th with scope. If it is a layout table, add role="presentation".' },
    `<tr><th scope="col">מידה</th><th scope="col">אורך כף רגל</th></tr>`,
  ),
  C(
    "list-structure",
    "1.3.1",
    "A",
    "minor",
    { he: "מבנה רשימות שגוי (li מחוץ ל-ul/ol)", en: "Broken list markup (li outside ul/ol)" },
    { he: "קורא מסך לא מכריז כמה פריטים יש ברשימה ואיפה היא נגמרת.", en: "Screen readers can't announce how many items there are or where the list ends." },
    { he: "ודאו ש-li נמצא ישירות בתוך ul או ol.", en: "Keep li elements directly inside ul or ol." },
    `<ul>\n  <li>משלוח חינם</li>\n</ul>`,
  ),
  C(
    "aria-hidden-focus",
    "4.1.2",
    "A",
    "serious",
    { he: "רכיבים לחיצים בתוך אזור aria-hidden", en: "Focusable elements inside aria-hidden" },
    {
      he: 'המקלדת מגיעה לרכיב, אבל קורא המסך "לא רואה" אותו. המשתמש נתקע על משהו שקט. (אם האזור מוסתר גם ב-display:none בזמן שהוא סגור, זה תקין.)',
      en: "The keyboard lands on it but the screen reader can't see it. Users get stuck on something silent. (Fine if the area is also display:none whenever it is closed.)",
    },
    { he: 'הסירו aria-hidden, או הוסיפו tabindex="-1" / inert לרכיבים שבפנים.', en: 'Remove aria-hidden, or add tabindex="-1" / inert to the controls inside.' },
    `<div class="drawer" inert>...</div>`,
  ),
  C(
    "aria-role-invalid",
    "4.1.2",
    "A",
    "serious",
    { he: "ערכי role לא קיימים", en: "Invalid role values" },
    { he: "role לא מוכר מתעלמים ממנו, והרכיב לא מתנהג כמו שהמפתח התכוון.", en: "Unknown roles are ignored, so the element isn't exposed the way the developer intended." },
    { he: "השתמשו בערך role תקני (button, dialog, navigation...) או ברכיב HTML מתאים.", en: "Use a valid role (button, dialog, navigation...) or the matching HTML element." },
    `<div role="dialog" aria-modal="true" aria-labelledby="t">...</div>`,
  ),
  C(
    "aria-attr-invalid",
    "4.1.2",
    "A",
    "moderate",
    { he: "תכונות aria-* שלא קיימות (שגיאות כתיב)", en: "aria-* attributes that don't exist (typos)" },
    { he: "תכונת ARIA עם שגיאת כתיב לא עושה כלום, והמידע שהיה אמור לעבור הולך לאיבוד.", en: "A misspelled ARIA attribute does nothing; the information it should carry is lost." },
    { he: "תקנו את שם התכונה לפי מפרט WAI-ARIA.", en: "Fix the attribute name per the WAI-ARIA spec." },
    `<button aria-expanded="false" aria-controls="menu">...</button>`,
  ),
  C(
    "new-window",
    "3.2.5",
    "AAA",
    "minor",
    { he: "קישורים שנפתחים בחלון חדש בלי אזהרה", en: "Links open a new window without warning" },
    {
      he: 'פתיחת חלון חדש בלי הודעה מבלבלת משתמשי קורא מסך ומשתמשים עם קשיים קוגניטיביים, כי כפתור "חזור" מפסיק לעבוד. (המלצה; התקן הישראלי וההנחיות מעודדים להודיע.)',
      en: "Opening a new window without notice disorients screen reader users and people with cognitive disabilities, as Back stops working. (Advisory, WCAG technique G201.)",
    },
    { he: 'הוסיפו לטקסט הקישור "(נפתח בחלון חדש)", גלוי או מוסתר ויזואלית.', en: 'Add "(opens in a new tab)" to the link text, visible or visually hidden.' },
    `<a href="https://wa.me/972..." target="_blank" rel="noopener">וואטסאפ <span class="sr-only">(נפתח בחלון חדש)</span></a>`,
  ),
  C(
    "small-text",
    "1.4.4",
    "AA",
    "minor",
    { he: "טקסט קטן מאוד מוגדר בסגנון inline", en: "Very small text set with inline styles" },
    {
      he: "טקסט מתחת ל-12px קשה לקריאה לרבים, במיוחד במובייל. (WCAG לא קובע גודל מינימלי, אבל זה סימן אזהרה.)",
      en: "Text under 12px is hard for many people to read, especially on mobile. (WCAG sets no minimum, but it is a warning sign.)",
    },
    { he: "השתמשו לפחות ב-14px לטקסט רץ וביחידות rem.", en: "Use at least 14px for body text, in rem units." },
    `<p style="font-size:0.875rem">...</p>`,
  ),
  C(
    "color-contrast",
    "1.4.3",
    "AA",
    "serious",
    { he: "ניגודיות צבעים נמוכה (בצבעים שמוגדרים inline)", en: "Low colour contrast (in inline-styled colours)" },
    {
      he: "טקסט בהיר על רקע בהיר לא קריא לאנשים עם ראייה ירודה, לקויות ראיית צבע, או בשמש. הנדרש: 4.5:1 (3:1 לטקסט גדול).",
      en: "Light text on a light background is unreadable with low vision, colour blindness or in sunlight. Required: 4.5:1 (3:1 for large text).",
    },
    { he: "החשיכו את הטקסט או את הרקע עד יחס 4.5:1 לפחות.", en: "Darken the text or background to reach at least 4.5:1." },
    `<p style="color:#595959;background:#ffffff">...</p> <!-- 7.0:1 -->`,
  ),
  C(
    "focus-outline",
    "2.4.7",
    "AA",
    "moderate",
    { he: "מסגרת הפוקוס מוסרת ב-CSS בלי תחליף", en: "Focus outline removed in CSS without a replacement" },
    { he: "משתמשי מקלדת לא רואים איפה הם נמצאים בעמוד.", en: "Keyboard users can't see where they are on the page." },
    { he: "אל תסירו outline, או הגדירו :focus-visible בולט במקומו.", en: "Don't remove outline, or define a clear :focus-visible style instead." },
    `:focus-visible{outline:3px solid #1a5fd0;outline-offset:2px}`,
  ),
  C(
    "required-indicator",
    "3.3.2",
    "A",
    "minor",
    { he: "שדות חובה מסומנים רק בכוכבית", en: "Required fields marked only with an asterisk" },
    { he: "כוכבית לא תמיד מוקראת, והשדה לא מוכרז כחובה, אז השגיאה מתגלה רק בשליחה.", en: "An asterisk isn't always announced and the field isn't exposed as required, so errors only show on submit." },
    { he: 'הוסיפו required (או aria-required="true") והסבירו מה הכוכבית אומרת.', en: 'Add required (or aria-required="true") and explain what the asterisk means.' },
    `<label for="n">שם מלא <span aria-hidden="true">*</span></label>\n<input id="n" required>`,
  ),
  C("form-errors", "3.3.1, 4.1.3", "A", "minor", { he: "הודעות שגיאה בטפסים שלא מוכרזות לקורא מסך", en: "Form error messages not announced to screen readers" }, {
    he: "הודעת שגיאה שמופיעה בלי aria-live / role=alert נראית אבל לא נשמעת. בדיקה סטטית מזהה רק את התבנית; צריך לבדוק ידנית.",
    en: "An error shown without aria-live / role=alert is seen but not heard. Static checks only spot the pattern; confirm manually.",
  }, {
    he: 'חברו את ההודעה לשדה עם aria-describedby, סמנו aria-invalid, ותנו לאזור ההודעות role="alert".',
    en: 'Link the message with aria-describedby, set aria-invalid, and give the message area role="alert".',
  }, `<input id="e" aria-invalid="true" aria-describedby="e-err">\n<p id="e-err" role="alert">כתובת האימייל חסרה @</p>`),
  C(
    "autocomplete-valid",
    "1.3.5",
    "AA",
    "moderate",
    { he: "ערכי autocomplete לא תקינים", en: "Invalid autocomplete values" },
    {
      he: "autocomplete נכון מאפשר מילוי אוטומטי של שם, טלפון וכתובת, וחוסך הקלדה לאנשים עם מוגבלות מוטורית או קוגניטיבית.",
      en: "Correct autocomplete lets browsers fill name, phone and address, saving typing for people with motor or cognitive disabilities.",
    },
    { he: "השתמשו בערכים התקניים (name, email, tel, street-address...).", en: "Use the standard tokens (name, email, tel, street-address...)." },
    `<input type="tel" autocomplete="tel">`,
  ),
  C("a11y-statement", "IL reg. 35 / EAA", "LAW", "serious", { he: "לא נמצא קישור להצהרת נגישות", en: "No link to an accessibility statement found" }, {
    he: "בישראל, אתר שמספק שירות לציבור נדרש לפרסם הצהרת נגישות. גם חוק הנגישות האירופי (EAA) מחייב מידע על נגישות השירות. (בדקנו רק קישורים שקיימים ב-HTML; קישור שמוזרק ב-JS לא נראה כאן.)",
    en:
      "In Israel, sites serving the public must publish an accessibility statement. The EU Accessibility Act also requires accessibility information. (Only links present in the HTML were checked; a link injected by JS isn't visible here.)",
  }, {
    he: "פרסמו עמוד הצהרת נגישות וקשרו אליו מהפוטר בכל עמוד. הדוח המלא כולל טיוטה מוכנה.",
    en: "Publish an accessibility statement page and link it from the footer of every page. The full report includes a ready draft.",
  }, `<footer><a href="/accessibility">הצהרת נגישות</a></footer>`),
];

export const CHECK_BY_ID: Record<string, CheckDef> = Object.fromEntries(CHECKS.map((c) => [c.id, c]));

// ---------- reference data ----------
const ROLES = new Set(
  ("alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox comment complementary contentinfo definition deletion dialog directory document emphasis feed figure form generic grid gridcell group heading img image insertion link list listbox listitem log main mark marquee math menu menubar menuitem menuitemcheckbox menuitemradio meter navigation none note option paragraph presentation progressbar radio radiogroup region row rowgroup rowheader scrollbar search searchbox section sectionhead separator slider spinbutton status strong subscript suggestion superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree treegrid treeitem graphics-document graphics-object graphics-symbol")
    .split(" "),
);
const ARIA_ATTRS = new Set(
  ("activedescendant atomic autocomplete braillelabel brailleroledescription busy checked colcount colindex colindextext colspan controls current describedby description details disabled dropeffect errormessage expanded flowto grabbed haspopup hidden invalid keyshortcuts label labelledby level live modal multiline multiselectable orientation owns placeholder posinset pressed readonly relevant required roledescription rowcount rowindex rowindextext rowspan selected setsize sort valuemax valuemin valuenow valuetext actions")
    .split(" ").map((a) => "aria-" + a),
);
const AUTOCOMPLETE = new Set(
  ("on off name honorific-prefix given-name additional-name family-name honorific-suffix nickname email username new-password current-password one-time-code organization-title organization street-address address-line1 address-line2 address-line3 address-level4 address-level3 address-level2 address-level1 country country-name postal-code cc-name cc-given-name cc-additional-name cc-family-name cc-number cc-exp cc-exp-month cc-exp-year cc-csc cc-type transaction-currency transaction-amount language bday bday-day bday-month bday-year sex url photo tel tel-country-code tel-national tel-area-code tel-local tel-local-prefix tel-local-suffix tel-extension impp webauthn shipping billing home work mobile fax pager")
    .split(" "),
);

export const OVERLAYS: { name: string; re: RegExp }[] = [
  { name: "accessiBe", re: /acsbapp\.com|accessibe\.com|acsbap\.com/i },
  { name: "UserWay", re: /userway\.org/i },
  { name: "EqualWeb", re: /equalweb\.com|window\.interdeal|interdeal\s*=/i },
  { name: "Enable (נגיש בקליק)", re: /enable\.co\.il|nagishbeclick|negishbeclick/i },
  { name: "Nagich", re: /nagich\.co\.il|nagich\.com|nagich-/i },
  { name: "NagishLi", re: /nagishli/i },
  { name: "AudioEye", re: /audioeye\.com/i },
  { name: "AllyAble", re: /allyable\.com/i },
  { name: "Accessibly", re: /accessibly\.(?:app|onthemapmarketing)/i },
  { name: "TruAbilities", re: /truabilities\.com/i },
  { name: "Recite Me", re: /reciteme\.com/i },
  { name: "Max Access", re: /maxaccess\.io/i },
  { name: "SkynetTechnologies (All in One Accessibility)", re: /skynettechnologies\.com/i },
  { name: "Sienna", re: /accessibility-widget\/sienna|sienna-accessibility/i },
];

// ---------- DOM helpers (deno-dom compatible: no :scope, no computed style) ----------
const tag = (el: any) => (el.tagName || "").toLowerCase();
const attr = (el: any, n: string) => el.getAttribute?.(n);
const has = (el: any, n: string) => el.hasAttribute?.(n);
const norm = (s: string | null | undefined) => (s || "").replace(/\s+/g, " ").trim();

function styleOf(el: any): Record<string, string> {
  const s = attr(el, "style");
  if (!s) return {};
  const out: Record<string, string> = {};
  for (const part of s.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    out[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).replace(/!important/i, "").trim().toLowerCase();
  }
  return out;
}
function selfHidden(el: any): boolean {
  const t = tag(el);
  if (t === "template" || t === "noscript" || t === "script" || t === "style") return true;
  if (has(el, "hidden") && !(t === "div" && /^S:\d+$/.test(attr(el, "id") || ""))) return true; // React streaming SSR chunks are moved in by JS
  if (t === "input" && (attr(el, "type") || "").toLowerCase() === "hidden") return true;
  const st = styleOf(el);
  if (st["display"] === "none" || st["visibility"] === "hidden") return true;
  const cl = attr(el, "class");
  if (cl && /(^|\s)(d-none|hidden|hide|is-hidden|invisible|display-none|u-hidden|displaynone)(\s|$)/i.test(cl)) return true;
  return false;
}
function notRendered(el: any): boolean {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (selfHidden(e)) return true;
  return false;
}
function ariaHiddenAncestor(el: any): any {
  for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (attr(e, "aria-hidden") === "true") return e;
  return null;
}
function ancestor(el: any, pred: (e: any) => boolean): any {
  for (let e = el.parentElement; e; e = e.parentElement) if (pred(e)) return e;
  return null;
}
function isFocusable(el: any): boolean {
  const t = tag(el);
  if (has(el, "disabled")) return false;
  const ti = attr(el, "tabindex");
  if (ti !== null && ti !== undefined && parseInt(ti, 10) < 0) return false;
  if (t === "a" || t === "area") return has(el, "href");
  if (t === "button" || t === "select" || t === "textarea" || t === "iframe" || t === "summary") return true;
  if (t === "input") return (attr(el, "type") || "").toLowerCase() !== "hidden";
  if ((t === "video" || t === "audio") && has(el, "controls")) return true;
  if (has(el, "contenteditable") && attr(el, "contenteditable") !== "false") return true;
  return ti !== null && ti !== undefined && !isNaN(parseInt(ti, 10));
}

export interface Ctx {
  doc: any;
  byId: Map<string, any[]>;
  labelsFor: Map<string, any[]>;
}

function textOf(ctx: Ctx, node: any, depth = 0): string {
  if (!node || depth > 40) return "";
  if (node.nodeType === 3) return node.nodeValue || "";
  if (node.nodeType !== 1) return "";
  const t = tag(node);
  if (selfHidden(node) || attr(node, "aria-hidden") === "true") return "";
  const al = norm(attr(node, "aria-label"));
  if (depth > 0 && al) return " " + al + " ";
  if (t === "img" || t === "area" || (t === "input" && (attr(node, "type") || "").toLowerCase() === "image")) return " " + norm(attr(node, "alt")) + " ";
  if (t === "svg") {
    const ti = node.querySelector?.("title");
    return " " + norm(ti?.textContent) + " ";
  }
  if (t === "input") {
    const ty = (attr(node, "type") || "text").toLowerCase();
    if (["submit", "reset", "button"].includes(ty)) return " " + norm(attr(node, "value")) + " ";
    return "";
  }
  let s = "";
  for (const c of node.childNodes) s += textOf(ctx, c, depth + 1);
  const t2 = tag(node);
  if (["div", "p", "li", "br", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6"].includes(t2)) s = " " + s + " ";
  return s;
}
function labelledBy(ctx: Ctx, el: any): string | null {
  const v = attr(el, "aria-labelledby");
  if (!v) return null;
  const parts = v.split(/\s+/).filter(Boolean).map((id: string) => ctx.byId.get(id)?.[0]).filter(Boolean);
  if (!parts.length) return null;
  return norm(parts.map((p: any) => norm(attr(p, "aria-label")) || textOf(ctx, p, 1)).join(" "));
}
/** accessible name, simplified accname. Returns { name, source } */
function accName(ctx: Ctx, el: any): { name: string; src: string } {
  const lb = labelledBy(ctx, el);
  if (lb) return { name: lb, src: "labelledby" };
  const al = norm(attr(el, "aria-label"));
  if (al) return { name: al, src: "aria-label" };
  const t = tag(el);
  const ty = (attr(el, "type") || "").toLowerCase();
  if (t === "input" || t === "select" || t === "textarea") {
    const id = attr(el, "id");
    let lab = "";
    if (id && ctx.labelsFor.has(id)) lab = ctx.labelsFor.get(id)!.map((l) => textOf(ctx, l, 1)).join(" ");
    const wrap = ancestor(el, (e) => tag(e) === "label");
    if (wrap) lab += " " + textOf(ctx, wrap, 1);
    lab = norm(lab);
    if (lab) return { name: lab, src: "label" };
    if (t === "input" && ["submit", "reset"].includes(ty)) return { name: norm(attr(el, "value")) || ty, src: "default" };
    if (t === "input" && ty === "button") {
      const v = norm(attr(el, "value")) || norm(attr(el, "title"));
      return { name: v, src: "value" };
    }
    if (t === "input" && ty === "image") return { name: norm(attr(el, "alt")), src: "alt" };
    const title = norm(attr(el, "title"));
    if (title) return { name: title, src: "title" };
    const ph = norm(attr(el, "placeholder"));
    if (ph) return { name: ph, src: "placeholder" };
    return { name: "", src: "" };
  }
  if (t === "img" || t === "area") {
    if (has(el, "alt")) return { name: norm(attr(el, "alt")), src: "alt" };
    const title = norm(attr(el, "title"));
    return { name: title, src: title ? "title" : "" };
  }
  if (t === "svg") {
    const ti = el.querySelector?.("title");
    const n = norm(ti?.textContent) || norm(attr(el, "title"));
    return { name: n, src: n ? "title" : "" };
  }
  const txt = norm(textOf(ctx, el, 0));
  if (txt) return { name: txt, src: "content" };
  const title = norm(attr(el, "title"));
  return { name: title, src: title ? "title" : "" };
}

function cssPath(el: any): string {
  const parts: string[] = [];
  let e = el;
  for (let i = 0; e && e.nodeType === 1 && i < 3; i++, e = e.parentElement) {
    let p = tag(e);
    const id = attr(e, "id");
    if (id && /^[A-Za-z][\w-]{0,40}$/.test(id)) {
      parts.unshift(p + "#" + id);
      break;
    }
    const cls = norm(attr(e, "class")).split(" ").filter((c) => c && /^[A-Za-z_][\w-]{0,30}$/.test(c)).slice(0, 2);
    if (cls.length) p += "." + cls.join(".");
    parts.unshift(p);
    if (tag(e) === "body") break;
  }
  return parts.join(" > ");
}
function startTag(el: any): string {
  let s = "<" + tag(el);
  for (const n of (el.getAttributeNames?.() || []).slice(0, 8)) {
    let v = attr(el, n) || "";
    if (v.length > 60) v = v.slice(0, 57) + "...";
    s += v === "" ? ` ${n}` : ` ${n}="${v.replace(/"/g, "&quot;")}"`;
  }
  s += ">";
  const txt = norm(el.textContent).slice(0, 40);
  if (txt && !["img", "input", "meta", "iframe", "br", "hr", "link"].includes(tag(el))) s += txt + (norm(el.textContent).length > 40 ? "…" : "");
  return s.length > 220 ? s.slice(0, 217) + "..." : s;
}

// ---------- colour ----------
const NAMED: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  yellow: "#ffff00",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  orange: "#ffa500",
  purple: "#800080",
  navy: "#000080",
  maroon: "#800000",
  lime: "#00ff00",
  aqua: "#00ffff",
  cyan: "#00ffff",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  teal: "#008080",
  olive: "#808000",
  pink: "#ffc0cb",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  gold: "#ffd700",
  whitesmoke: "#f5f5f5",
};
export function parseColor(v: string | undefined | null): [number, number, number] | null {
  if (!v) return null;
  v = v.trim().toLowerCase();
  if (NAMED[v]) v = NAMED[v];
  let m = v.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    else if (h.length === 4) {
      if (h[3] !== "f") return null;
      h = h.slice(0, 3).split("").map((c) => c + c).join("");
    } else if (h.length === 8) {
      if (h.slice(6) !== "ff") return null;
      h = h.slice(0, 6);
    } else if (h.length !== 6) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  m = v.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/);
  if (m) {
    if (m[4] !== undefined) {
      const a = m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
      if (a < 1) return null;
    }
    return [+m[1], +m[2], +m[3]].map((x) => Math.min(255, x)) as [number, number, number];
  }
  return null;
}
function lum([r, g, b]: number[]) {
  const f = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: number[], b: number[]) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function bgColorOf(el: any): string | null | "complex" {
  const st = styleOf(el);
  const bi = st["background-image"];
  if (bi && bi !== "none") return "complex";
  const bc = st["background-color"];
  if (bc) return bc;
  const b = st["background"];
  if (b) {
    if (/url\(|gradient/.test(b)) return "complex";
    const tok = b.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b[a-z]+\b/i);
    return tok ? tok[0] : null;
  }
  const bg = attr(el, "bgcolor");
  return bg || null;
}
function fgColorOf(el: any): string | null {
  const st = styleOf(el);
  if (st["color"]) return st["color"];
  if (tag(el) === "font" && attr(el, "color")) return attr(el, "color");
  return null;
}
function ownText(el: any): string {
  let s = "";
  for (const c of el.childNodes) if (c.nodeType === 3) s += c.nodeValue;
  return norm(s);
}
function pxSize(v: string | undefined): number | null {
  if (!v) return null;
  const m = v.match(/^([\d.]+)\s*(px|pt|em|rem|%)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  switch (m[2] || "px") {
    case "px":
      return n;
    case "pt":
      return n * 4 / 3;
    case "em":
    case "rem":
      return n * 16;
    case "%":
      return n * 0.16;
  }
  return null;
}

// ---------- main ----------
export interface EngineResult {
  findings: Finding[];
  passed: string[];
  notApplicable: string[];
  overlays: string[];
  statement: { found: boolean; href?: string; text?: string };
  stats: { elements: number; textChars: number; hebrewRatio: number; scripts: number; jsRendered: boolean; lang: string | null; title: string };
  score: number | null;
  deductions: { id: string; points: number }[];
}

export function runChecks(doc: any, rawHtml: string, pageUrl: string, lang: "he" | "en"): EngineResult {
  const all: any[] = Array.from(doc.querySelectorAll("*"));
  const byId = new Map<string, any[]>();
  const labelsFor = new Map<string, any[]>();
  for (const el of all) {
    const id = attr(el, "id");
    if (id) {
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id)!.push(el);
    }
    if (tag(el) === "label" && attr(el, "for")) {
      const f = attr(el, "for");
      if (!labelsFor.has(f)) labelsFor.set(f, []);
      labelsFor.get(f)!.push(el);
    }
  }
  const ctx: Ctx = { doc, byId, labelsFor };
  const hits: Record<string, any[]> = {};
  const applicable = new Set<string>();
  const hit = (id: string, el: any) => {
    (hits[id] ||= []).push(el);
  };
  const app = (id: string) => applicable.add(id);
  const vis = all.filter((el) => !notRendered(el));
  const body = doc.body || doc.querySelector("body");
  const html = doc.documentElement;

  // text stats
  let text = "";
  const walk = (n: any) => {
    if (!n) return;
    if (n.nodeType === 3) {
      text += n.nodeValue;
      return;
    }
    if (n.nodeType !== 1 || selfHidden(n)) return;
    for (const c of n.childNodes) walk(c);
  };
  walk(body);
  const heb = (text.match(/[א-ת]/g) || []).length;
  const lat = (text.match(/[A-Za-z]/g) || []).length;
  const ara = (text.match(/[ؠ-ي]/g) || []).length;
  const hebrewRatio = heb + lat + ara ? heb / (heb + lat + ara) : 0;
  const textChars = norm(text).length;
  const scripts = doc.querySelectorAll("script").length;
  const jsRendered = textChars < 300 && scripts >= 2;

  // 1 lang
  app("html-lang");
  const hl = norm(attr(html, "lang") || attr(html, "xml:lang"));
  if (!hl || !/^[a-z]{2,3}(-[a-z0-9]{1,8})*$/i.test(hl) || /^(heb|eng|ara|rus|fra|fre|deu|ger|spa|ita|nld|dut)\b/i.test(hl)) hit("html-lang", html);
  if (heb > 200 && hebrewRatio > 0.5) {
    app("html-lang-mismatch");
    app("html-dir");
    if (hl && !/^(he|iw|heb)\b/i.test(hl)) hit("html-lang-mismatch", html);
    const dirs = [html, body, body?.firstElementChild, doc.querySelector("main")].filter(Boolean).map((e: any) => (attr(e, "dir") || "").toLowerCase());
    const styleText = Array.from(doc.querySelectorAll("style")).map((s: any) => s.textContent || "").join("\n");
    const cssRtl = /(?:^|[}\s,])(?:html|body|:root)[^{]*\{[^}]*direction\s*:\s*rtl/i.test(styleText) || /direction\s*:\s*rtl/.test(attr(html, "style") || "") ||
      /direction\s*:\s*rtl/.test(attr(body, "style") || "");
    if (!dirs.includes("rtl") && !cssRtl) hit("html-dir", html);
  }
  // title
  app("page-title");
  const titleEl = doc.querySelector("head title") || doc.querySelector("title");
  const title = norm(titleEl?.textContent);
  if (!title) hit("page-title", titleEl || html);
  // viewport
  for (const m of doc.querySelectorAll('meta[name="viewport" i], meta[name="viewport"]')) {
    app("meta-viewport");
    const c = (attr(m, "content") || "").toLowerCase().replace(/\s/g, "");
    const ms = c.match(/maximum-scale=([\d.]+)/);
    if (/user-scalable=(no|0)(,|;|$)/.test(c) || (ms && parseFloat(ms[1]) < 2)) hit("meta-viewport", m);
  }
  for (const m of doc.querySelectorAll("meta")) {
    if ((attr(m, "http-equiv") || "").toLowerCase() !== "refresh") continue;
    app("meta-refresh");
    const n = parseFloat(attr(m, "content") || "");
    if (n > 0 && n < 72000) hit("meta-refresh", m);
  }

  // images
  const FILE_RE = /\.(jpe?g|png|gif|webp|svg|avif|bmp)$|^(img|dsc|image|screenshot)[-_ ]?\d+/i;
  const GENERIC = new Set([
    "image",
    "img",
    "photo",
    "picture",
    "pic",
    "logo",
    "icon",
    "banner",
    "תמונה",
    "תמונות",
    "לוגו",
    "אייקון",
    "באנר",
    "placeholder",
    "untitled",
    "default",
    "alt",
    "null",
    "undefined",
    "*",
  ]);
  for (const el of vis) {
    const t = tag(el);
    if (t === "img") {
      if (ariaHiddenAncestor(el)) continue;
      app("img-alt");
      const role = (attr(el, "role") || "").toLowerCase();
      if (!has(el, "alt")) {
        if (role === "presentation" || role === "none") continue;
        if (attr(el, "aria-label") || labelledBy(ctx, el) || norm(attr(el, "title"))) continue;
        // 1x1 tracking pixels
        if ((attr(el, "width") === "1" && attr(el, "height") === "1") || (attr(el, "width") === "0")) continue;
        hit("img-alt", el);
      } else {
        const a = norm(attr(el, "alt"));
        if (a) {
          app("img-alt-suspicious");
          if (FILE_RE.test(a) || GENERIC.has(a.toLowerCase())) hit("img-alt-suspicious", el);
        }
      }
    } else if (t === "input" && (attr(el, "type") || "").toLowerCase() === "image") {
      app("input-image-alt");
      if (!accName(ctx, el).name) hit("input-image-alt", el);
    } else if (t === "area" && has(el, "href")) {
      app("img-alt");
      if (!norm(attr(el, "alt")) && !attr(el, "aria-label")) hit("img-alt", el);
    } else if (t === "svg" && (attr(el, "role") || "").toLowerCase() === "img") {
      if (ariaHiddenAncestor(el)) continue;
      app("svg-img-name");
      if (!accName(ctx, el).name) hit("svg-img-name", el);
    }
  }

  // forms
  for (const el of vis) {
    const t = tag(el);
    if (t !== "input" && t !== "select" && t !== "textarea") continue;
    const ty = (attr(el, "type") || "text").toLowerCase();
    if (t === "input" && ["hidden", "submit", "reset", "button", "image"].includes(ty)) continue;
    if (ariaHiddenAncestor(el)) continue;
    const n = accName(ctx, el);
    const id = t === "select" ? "select-name" : "form-label";
    app(id);
    app("label-placeholder-only");
    if (!n.name) hit(id, el);
    else if (n.src === "placeholder") hit("label-placeholder-only", el);
    const ac = norm(attr(el, "autocomplete")).toLowerCase();
    if (ac) {
      app("autocomplete-valid");
      const toks = ac.split(" ").filter((x) => !x.startsWith("section-"));
      if (toks.some((x) => !AUTOCOMPLETE.has(x))) hit("autocomplete-valid", el);
    }
    // required marked by asterisk only
    if (n.src === "label" && /\*/.test(n.name)) {
      app("required-indicator");
      if (!has(el, "required") && attr(el, "aria-required") !== "true") hit("required-indicator", el);
    }
  }
  // form errors pattern
  const forms = vis.filter((e) => tag(e) === "form");
  if (forms.length) {
    for (const f of forms) {
      const errEls = Array.from(f.querySelectorAll("*")).filter((e: any) =>
        /(^|[\s_-])(error|errors|invalid|err-msg|field-error|validation)([\s_-]|$)/i.test(attr(e, "class") || "") && tag(e) !== "input"
      );
      if (!errEls.length) continue;
      app("form-errors");
      const live = Array.from(f.querySelectorAll("[aria-live],[role=alert],[role=status]")).length;
      const described = Array.from(f.querySelectorAll("[aria-describedby],[aria-errormessage]")).length;
      if (!live && !described && !f.closest?.("[aria-live]")) hit("form-errors", errEls[0]);
    }
  }

  // buttons / links
  const INTERACTIVE = (e: any) => {
    const t = tag(e);
    return (t === "a" && has(e, "href")) || t === "button" || t === "select" || t === "textarea" || (t === "input" && (attr(e, "type") || "").toLowerCase() !== "hidden");
  };
  const VAGUE = /^(click here|here|read more|more|learn more|לחצו כאן|לחץ כאן|כאן|קרא עוד|קראו עוד|לפרטים|עוד|למידע נוסף|details|link)$/i;
  for (const el of vis) {
    const t = tag(el);
    const role = (attr(el, "role") || "").toLowerCase().split(/\s+/)[0];
    const isBtn = t === "button" || role === "button" || (t === "input" && ["button", "submit", "reset"].includes((attr(el, "type") || "").toLowerCase()));
    const isLink = (t === "a" && has(el, "href")) && role !== "button";
    if (!isBtn && !isLink) continue;
    if (ariaHiddenAncestor(el)) continue;
    const n = accName(ctx, el).name;
    if (isBtn) {
      app("button-name");
      if (!n) hit("button-name", el);
    } else {
      app("link-name");
      if (!n) hit("link-name", el);
      else {
        app("link-vague");
        if (VAGUE.test(n.replace(/[.…:!>»«\s]+$/g, "").trim())) hit("link-vague", el);
      }
      const tg = (attr(el, "target") || "").toLowerCase();
      if (tg === "_blank") {
        app("new-window");
        const all2 = (n + " " + (attr(el, "title") || "")).toLowerCase();
        if (!/new (window|tab)|opens in|external|חלון חדש|לשונית חדשה|כרטיסייה חדשה|נפתח ב|ייפתח|פתיחה ב/.test(all2)) hit("new-window", el);
      }
    }
    if (ancestor(el, INTERACTIVE)) {
      app("nested-interactive");
      hit("nested-interactive", el);
    }
  }

  // headings
  const heads: { el: any; lvl: number }[] = [];
  for (const el of vis) {
    const t = tag(el);
    let lvl = 0;
    if (/^h[1-6]$/.test(t)) lvl = +t[1];
    else if ((attr(el, "role") || "") === "heading") lvl = parseInt(attr(el, "aria-level") || "2", 10) || 2;
    if (!lvl || ariaHiddenAncestor(el)) continue;
    const r = (attr(el, "role") || "").toLowerCase();
    if (/^h[1-6]$/.test(t) && (r === "presentation" || r === "none")) continue;
    heads.push({ el, lvl });
  }
  if (heads.length) {
    app("empty-heading");
    app("heading-order");
    let prev = 0;
    for (const h of heads) {
      if (!accName(ctx, h.el).name) hit("empty-heading", h.el);
      if (prev && h.lvl > prev + 1) hit("heading-order", h.el);
      prev = h.lvl;
    }
  }
  if (!jsRendered) {
    app("missing-h1");
    if (!heads.some((h) => h.lvl === 1)) hit("missing-h1", body || html);
  }
  // landmarks
  const mains = vis.filter((e) => tag(e) === "main" || (attr(e, "role") || "") === "main");
  if (!jsRendered) {
    app("landmark-main");
    if (!mains.length) hit("landmark-main", body || html);
  }
  const links = vis.filter((e) => tag(e) === "a" && has(e, "href"));
  if (links.length >= 10) {
    app("landmark-nav");
    if (!vis.some((e) => tag(e) === "nav" || (attr(e, "role") || "") === "navigation")) hit("landmark-nav", body);
  }
  // skip link
  if (links.length >= 10) {
    app("skip-link");
    const SKIP = /skip|jump to|דלג|דילוג|מעבר לתוכן|לתוכן העיקרי|לתוכן הראשי|main content/i;
    const first = links.slice(0, 5);
    const ok = first.some((a) => {
      const h = attr(a, "href") || "";
      return h.length > 1 && h.startsWith("#") && (SKIP.test(accName(ctx, a).name) || byId.has(h.slice(1)));
    }) ||
      links.some((a) => (attr(a, "href") || "").startsWith("#") && SKIP.test(accName(ctx, a).name));
    if (!ok) hit("skip-link", body);
  }
  // duplicate ids referenced
  const refIds = new Set<string>();
  for (const el of all) {
    for (const a of ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-activedescendant", "aria-errormessage"]) {
      const v = attr(el, a);
      if (v) v.split(/\s+/).forEach((x: string) => x && refIds.add(x));
    }
    if (tag(el) === "label" && attr(el, "for")) refIds.add(attr(el, "for"));
  }
  if (byId.size) app("duplicate-id-ref");
  for (const [id, els] of byId) if (els.length > 1 && refIds.has(id)) hit("duplicate-id-ref", els[1]);
  // aria refs missing (labelledby/describedby only, all ids missing)
  for (const el of vis) {
    for (const a of ["aria-labelledby", "aria-describedby"]) {
      const v = attr(el, a);
      if (!v) continue;
      app("aria-ref-missing");
      const ids = v.split(/\s+/).filter(Boolean);
      if (ids.length && ids.every((x: string) => !byId.has(x))) hit("aria-ref-missing", el);
    }
  }
  // tabindex, roles, aria attrs
  for (const el of vis) {
    const ti = attr(el, "tabindex");
    if (ti !== null && ti !== undefined) {
      app("tabindex-positive");
      if (parseInt(ti, 10) > 0) hit("tabindex-positive", el);
    }
    const r = attr(el, "role");
    if (r !== null && r !== undefined && norm(r)) {
      app("aria-role-invalid");
      const toks = norm(r).toLowerCase().split(" ");
      if (!toks.some((x: string) => ROLES.has(x) || x.startsWith("doc-"))) hit("aria-role-invalid", el);
    }
    for (const n of el.getAttributeNames?.() || []) {
      if (!n.startsWith("aria-")) continue;
      app("aria-attr-invalid");
      if (!ARIA_ATTRS.has(n.toLowerCase())) {
        hit("aria-attr-invalid", el);
        break;
      }
    }
  }
  // aria-hidden containing focusable
  for (const el of vis) {
    if (attr(el, "aria-hidden") !== "true") continue;
    if (has(el, "inert")) continue;
    app("aria-hidden-focus");
    const cands = [el, ...Array.from(el.querySelectorAll("a[href],button,input,select,textarea,iframe,[tabindex],summary"))];
    const f = cands.find((c: any) => isFocusable(c) && !notRendered(c) && !ancestor(c, (e) => has(e, "inert")));
    if (f) hit("aria-hidden-focus", f);
  }
  // frames
  for (const el of vis) {
    const t = tag(el);
    if (t !== "iframe" && t !== "frame") continue;
    const w = attr(el, "width"), h = attr(el, "height");
    if (w === "0" || h === "0" || w === "1" || h === "1") continue;
    if (ariaHiddenAncestor(el) || parseInt(attr(el, "tabindex") || "0", 10) < 0) continue;
    app("frame-title");
    if (!norm(attr(el, "title")) && !norm(attr(el, "aria-label")) && !labelledBy(ctx, el)) hit("frame-title", el);
  }
  // media
  for (const el of vis) {
    const t = tag(el);
    if (t !== "video" && t !== "audio") continue;
    const auto = has(el, "autoplay");
    const muted = has(el, "muted");
    if (auto) {
      app("autoplay-audio");
      if (!muted) hit("autoplay-audio", el);
      else if (t === "video" && has(el, "loop")) {
        app("autoplay-no-pause");
        if (!has(el, "controls")) hit("autoplay-no-pause", el);
      }
    }
    if (t === "video" && !muted) {
      app("video-captions");
      if (!el.querySelector('track[kind="captions"], track[kind="subtitles"]')) hit("video-captions", el);
    }
  }
  for (const el of vis) {
    if (tag(el) === "marquee" || tag(el) === "blink") {
      app("blink-marquee");
      hit("blink-marquee", el);
    }
  }
  // tables
  for (const el of vis) {
    if (tag(el) !== "table") continue;
    const role = (attr(el, "role") || "").toLowerCase();
    if (role === "presentation" || role === "none") continue;
    if (el.querySelector("table")) continue;
    const rows = Array.from(el.querySelectorAll("tr"));
    if (rows.length < 3) continue;
    const maxCols = Math.max(...rows.map((r: any) => Array.from(r.children).filter((c: any) => /^t[dh]$/.test(tag(c))).length));
    if (maxCols < 2) continue;
    // layout-table hints: forms or many block elements inside cells
    if (el.querySelector("form, h1, h2, h3, nav, ul > li > a")) continue;
    app("table-headers");
    if (!el.querySelector("th, [role=columnheader], [role=rowheader], td[scope], td[headers]")) hit("table-headers", el);
  }
  // lists
  for (const el of vis) {
    const t = tag(el);
    if (t === "li") {
      app("list-structure");
      const p = el.parentElement;
      const pt = p ? tag(p) : "";
      const pr = p ? (attr(p, "role") || "").toLowerCase() : "";
      if (!["ul", "ol", "menu"].includes(pt) && pr !== "list" && !(attr(el, "role"))) hit("list-structure", el);
    }
  }
  // inline small text + contrast
  for (const el of vis) {
    const st = styleOf(el);
    const own = ownText(el);
    if (!own || own.length < 2) continue;
    if (st["font-size"]) {
      const px = pxSize(st["font-size"]);
      app("small-text");
      if (px !== null && px > 0 && px < 12) hit("small-text", el);
    }
    // contrast: need fg and bg, both inline-resolvable
    let fg: string | null = null;
    let bg: string | null | "complex" = null;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (!fg) fg = fgColorOf(e);
      if (!bg) bg = bgColorOf(e);
      if (fg && bg) break;
    }
    if (!fg || !bg || bg === "complex") continue;
    const f = parseColor(fg), b = parseColor(bg);
    if (!f || !b) continue;
    app("color-contrast");
    const px = pxSize(st["font-size"]) || 16;
    const bold = /bold|[6-9]00/.test(st["font-weight"] || "") || ["b", "strong", "h1", "h2", "h3"].includes(tag(el));
    const large = px >= 24 || (bold && px >= 18.66);
    if (contrast(f, b) < (large ? 3 : 4.5)) hit("color-contrast", el);
  }
  // focus outline removal in inline <style>
  {
    const css = Array.from(doc.querySelectorAll("style")).map((s: any) => s.textContent || "").join("\n");
    if (css) {
      app("focus-outline");
      const rules = css.replace(/\/\*[\s\S]*?\*\//g, "").match(/[^{}]+\{[^{}]*\}/g) || [];
      const kill = rules.filter((r) => /:focus(?!-within)/.test(r.split("{")[0]) && /outline\s*:\s*(none|0)\b/.test(r) && !/box-shadow|border|text-decoration|background/.test(r.split("{")[1]));
      const replaced = rules.some((r) => /:focus(-visible)?/.test(r.split("{")[0]) && /outline\s*:\s*(?!none|0\b)[^;}]+|box-shadow\s*:/.test(r.split("{")[1]));
      if (kill.length && !replaced) hit("focus-outline", doc.querySelector("style"));
    }
  }

  // accessibility statement
  const STMT = /הצהרת\s*נגישות|נגישות|accessibility|barrierefrei|accessibilit[ée]|accesibilidad|accessibilità|toegankelijk|tillgänglighet|dostępność/i;
  let statement: EngineResult["statement"] = { found: false };
  for (const a of all) {
    if (tag(a) !== "a") continue;
    const h = (attr(a, "href") || "").trim();
    if (!h || h === "#" || /^javascript:/i.test(h)) continue;
    const n = norm(accName(ctx, a).name);
    if (STMT.test(n) || /accessib|negishut|nagishut|negishot|%d7%a0%d7%92%d7%99%d7%a9%d7%95%d7%aa|נגישות|barrierefrei/i.test(h)) {
      statement = { found: true, href: h.slice(0, 200), text: n.slice(0, 80) };
      break;
    }
  }
  if (!statement.found) {
    const PHRASE =
      /הצהרת\s*(ה)?נגישות|accessibility statement|erklärung zur barrierefreiheit|déclaration d.accessibilité|declaración de accesibilidad|dichiarazione di accessibilità|toegankelijkheidsverklaring/i;
    for (const e of all) {
      const t = tag(e);
      if (!["button", "h1", "h2", "h3", "h4", "summary", "a"].includes(t) && (attr(e, "role") || "") !== "button") continue;
      const n = norm(accName(ctx, e).name);
      if (PHRASE.test(n)) {
        statement = { found: true, text: n.slice(0, 80) };
        break;
      }
    }
  }
  app("a11y-statement");
  if (!statement.found && !jsRendered) hit("a11y-statement", body || html);
  if (!statement.found && jsRendered) applicable.delete("a11y-statement");

  // overlays
  const blobs: string[] = [];
  for (const s of doc.querySelectorAll("script")) {
    blobs.push(attr(s, "src") || "");
    blobs.push((s.textContent || "").slice(0, 4000));
  }
  for (const l of doc.querySelectorAll("link[href], iframe[src]")) blobs.push(attr(l, "href") || attr(l, "src") || "");
  const blob = blobs.join("\n") + "\n" + rawHtml.slice(0, 2_000_000).match(/https?:\/\/[^"'\s)]+/g)?.slice(0, 3000).join("\n");
  const overlays = OVERLAYS.filter((o) => o.re.test(blob)).map((o) => o.name);

  // build findings
  const findings: Finding[] = [];
  const deductions: { id: string; points: number }[] = [];
  for (const def of CHECKS) {
    const els = hits[def.id];
    if (!els || !els.length) continue;
    const uniq = Array.from(new Set(els));
    findings.push({
      id: def.id,
      wcag: def.wcag,
      level: def.level,
      severity: def.sev,
      count: uniq.length,
      examples: uniq.slice(0, 3).map((e) => ({ selector: cssPath(e), snippet: startTag(e) })),
      title: def.title[lang],
      why: def.why[lang],
      fix: def.fix[lang],
      code: def.code,
    });
    const w = WEIGHTS[def.sev];
    const pts = w * (uniq.length >= 10 ? 1.5 : 1);
    deductions.push({ id: def.id, points: pts });
  }
  const order: Severity[] = ["critical", "serious", "moderate", "minor"];
  findings.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || b.count - a.count);
  const score = jsRendered ? null : Math.max(0, Math.round(100 - deductions.reduce((s, d) => s + d.points, 0)));
  const passed = Array.from(applicable).filter((id) => !hits[id]);
  const notApplicable = CHECKS.map((c) => c.id).filter((id) => !applicable.has(id));
  return {
    findings,
    passed,
    notApplicable,
    overlays,
    statement,
    score,
    deductions,
    stats: { elements: all.length, textChars, hebrewRatio: Math.round(hebrewRatio * 100) / 100, scripts, jsRendered, lang: hl || null, title: title.slice(0, 120) },
  };
}
