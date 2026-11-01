export type NavItem = { href: string; label: string; children?: { href: string; label: string }[] };

export const NAV: NavItem[] = [
  { href: "/", label: "ראשי" },
  { href: "/about", label: "אודות" },
  { href: "/treatments", label: "טיפולים" },
  {
    href: "/facial-treatments-for-men",
    label: "טיפולי פנים לגבר",
    children: [
      { href: "/facial-treatments-for-men/pigmentation-treatment", label: "טיפול בפיגמנטציה לגברים" },
      { href: "/facial-treatments-for-men/mesotherapy", label: "טיפולי מזותרפיה" },
      { href: "/facial-treatments-for-men/pre-wedding-facial-for-men", label: "טיפול לפני חתונה" },
      { href: "/facial-treatments-for-men/skin-peeling-treatment", label: "טיפולי פילינג" },
      { href: "/facial-treatments-for-men/laser-acne-treatment", label: "טיפול באקנה בלייזר" },
      { href: "/facial-treatments-for-men/skin-rejuvenation-for-men", label: "חידוש עור" },
      { href: "/facial-treatments-for-men/wrinkle-elimination", label: "טיפול נגד קמטים וקמטוטים" },
      { href: "/facial-treatments-for-men/aesthetic-treatments-for-religious-men", label: "טיפולים אסתטיים לדתיים וחרדים" },
      { href: "/treatments/eyebrows-hair-removal-for-men", label: "סידור גבות לגברים" },
      { href: "/facial-treatments-for-men/faq-facial-treatments-for-men", label: "טיפולי פנים לגבר - שאלות ותשובות" },
    ],
  },
  {
    href: "/hair-removal-methods",
    label: "הסרת שיער בכל השיטות",
    children: [
      { href: "/hair-removal-methods/laser-beard-shaping", label: "סידור זקן בלייזר" },
      { href: "/hair-removal-methods/laser-hair-removal", label: "הסרת שיער בלייזר לגברים" },
      { href: "/hair-removal-methods/wax-for-men", label: "הסרת שיער באמצעות שעווה לגברים" },
      { href: "/hair-removal-methods/all-methods-for-buttocks-hair-removal", label: "הסרת שיער בישבן" },
      { href: "/hair-removal-methods/intimate", label: "הסרת שיער באזורים אינטימיים לגברים" },
      { href: "/hair-removal-methods/pricing", label: "מחירון" },
    ],
  },
  { href: "/treatments/tattoo-removal", label: "הסרת קעקועים" },
  { href: "/articles", label: "טיפים ומידע" },
  { href: "/contact-us", label: "יצירת קשר" },
];

export const WA = "https://wa.me/972503800066";

export const FOOTER = {
  info: [
    { href: "/about", label: "אודות" },
    { href: "/treatments", label: "הטיפולים שלנו" },
    { href: "/hair-removal-methods/pricing", label: "מחירון טיפולים" },
    { href: "/articles", label: "טיפים ומידע" },
    { href: "/recommendations", label: "המלצות" },
    { href: "/accessibility", label: "הצהרת נגישות" },
    { href: "/privacy-policy", label: "מדיניות פרטיות" },
    { href: "/terms-and-conditions", label: "תנאי שימוש" },
  ],
  face: [
    { href: "/facial-treatments-for-men", label: "טיפולי פנים לגבר" },
    { href: "/facial-treatments-for-men/wrinkle-elimination", label: "טיפול בקמטים" },
    { href: "/facial-treatments-for-men/faq-facial-treatments-for-men", label: "טיפולי פנים לגבר – שאלות ותשובות" },
  ],
  hair: [
    { href: "/hair-removal-methods/intimate", label: "הסרת שיער באזורים אינטימיים לגברים" },
    { href: "/hair-removal-methods/wax-for-men", label: "הסרת שיער בשעווה לגבר" },
    { href: "/hair-removal-methods/laser-hair-removal", label: "הסרת שיער בלייזר" },
    { href: "/hair-removal-methods/laser-beard-shaping", label: "סידור זקן בלייזר" },
    { href: "/treatments/eyebrows-hair-removal-for-men", label: "עיצוב גבות לגברים" },
    { href: "/hair-removal-methods/all-methods-for-buttocks-hair-removal", label: "הסרת שיער בישבן" },
  ],
};
