import Image from "next/image";
import Link from "next/link";

const HEXES = [
  { title: "הסרת שיער\nבאמצעות שעווה", href: "/hair-removal-methods/wax-for-men", src: "/media/fb072e_25c2789b5ee947688ceca3aa594dcce6~mv2.jpg" },
  { title: "טיפולי פנים\nלגבר", href: "/facial-treatments-for-men", src: "/media/fb072e_dd7f4169b0a24a1c8684fc6d5ac9197d~mv2.jpg" },
  { title: "טיפול נגד קמטים\nוקמטוטים", href: "/facial-treatments-for-men/wrinkle-elimination", src: "/media/fb072e_e7ebf4ec711e41e0a35bfe935534895e~mv2.jpg" },
  { title: "הסרת שיער\nבלייזר", href: "/hair-removal-methods/laser-hair-removal", src: "/media/fb072e_1301b9127c9846cc94ab82f06e3a4d3d~mv2.jpg" },
  { title: "לייזר בזקן", href: "/hair-removal-methods/laser-beard-shaping", src: "/media/fb072e_884915b7fafe4c059abdf7ac97b1fe8e~mv2.jpg" },
  { title: "סידור גבות\nלגברים", href: "/treatments/eyebrows-hair-removal-for-men", src: "/media/fb072e_ed217528edaf4b1492bfe5f60f87139a~mv2.png" },
  { title: "הסרת שיער באזורים\nאינטימיים לגברים", href: "/hair-removal-methods/intimate", src: "/media/fb072e_67697bd2acfb4139ab6eaacb44b0afab~mv2.jpg" },
  { title: "הסרת קעקועים", href: "/treatments/tattoo-removal", src: "/media/fb072e_62798da51131499e9b5ba5d8a3fac1ef~mv2.jpg" },
  { title: "טיפול לפני\nחתונה", href: "/facial-treatments-for-men/pre-wedding-facial-for-men", src: "/media/fb072e_be7691735b4c4baca13996a0c3e425bc~mv2.jpg" },
  { title: "טיפים ומידע", href: "/articles", src: "/media/fb072e_1187bed366e9415890608af373034c0a~mv2.jpg" },
];

function Hex({ title, href, src }: { title: string; href: string; src: string }) {
  return (
    <Link href={href} className="hex">
      <span className="hex-border">
        <span className="hex-inner">
          <Image src={src} alt="" fill sizes="180px" className="hex-img" />
          <span className="hex-label">{title}</span>
        </span>
      </span>
    </Link>
  );
}

export function Honeycomb() {
  return (
    <div className="honey-scale">
      <div className="honey" dir="rtl">
        <div className="honey-row">
          {HEXES.slice(0, 6).map((item) => (
            <Hex key={item.href} {...item} />
          ))}
        </div>
        <div className="honey-row honey-row-offset">
          {HEXES.slice(6).map((item) => (
            <Hex key={item.href + item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
