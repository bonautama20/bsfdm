import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function LanguageToggle({ className = "", style, onDark = false }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`lang-toggle ${className}`} style={style} role="group" aria-label="Language" data-on-dark={onDark ? "" : undefined}>
      <style>{`
        .lang-toggle{display:inline-flex; align-items:center; gap:4px; background:rgba(1,97,60,.08); border-radius:99px; padding:3px; font-family:inherit;}
        .lang-toggle .lang-ic{display:flex; align-items:center; padding:0 6px; color:#4C6157;}
        .lang-toggle button{font-size:.72rem; font-weight:800; letter-spacing:.03em; padding:5px 10px; border-radius:99px; border:none; background:transparent; color:#4C6157; cursor:pointer; transition:background .15s ease, color .15s ease;}
        .lang-toggle button.active{background:#01613C; color:#fff;}
        .lang-toggle[data-on-dark] .lang-ic{color:rgba(255,255,255,.75);}
        .lang-toggle[data-on-dark]{background:rgba(255,255,255,.14);}
        .lang-toggle[data-on-dark] button{color:rgba(255,255,255,.75);}
        .lang-toggle[data-on-dark] button.active{background:#fff; color:#01613C;}
      `}</style>
      <span className="lang-ic"><Languages size={14} /></span>
      <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
      <button type="button" className={lang === "id" ? "active" : ""} onClick={() => setLang("id")}>ID</button>
    </div>
  );
}
