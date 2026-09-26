import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Search } from "lucide-react";
import logoHeader from "../assets/logoheader.webp";
import logoFooterWhite from "../assets/logo-white-footer.png";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";

export default function KnowledgeBasePage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Articles are managed by the platform owner from the admin dashboard
  // (Dashboard -> Knowledge Base) — this page just reads the public list.
  useEffect(() => {
    api.get("/kb-articles")
      .then(setArticles)
      .catch(() => setError(t("kb.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const categories = useMemo(() => {
    const seen = new Map();
    articles.forEach((a) => {
      const key = a.category.en;
      if (!seen.has(key)) seen.set(key, a.category);
    });
    return Array.from(seen.values());
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesCategory = activeCategory === "all" || a.category.en === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${a.title.en} ${a.title.id} ${a.excerpt.en} ${a.excerpt.id}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, query, activeCategory]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const goHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="bsfdm kb-page">
      <style>{`
        :root{
          --ink:#0F241A; --ink-soft:#4C6157; --muted:#7C9086;
          --canvas:#F6F8F4; --canvas-alt:#EEF2EC; --surface:#FFFFFF; --line:#E1E8DF;
          --green:#01613C; --green-deep:#01613C; --green-light:#E1F3E7;
          --lime:#E36B14;
          --navy-dark:#0A2017;
          --shadow-sm:0 6px 18px rgba(14,32,23,.06);
          --shadow-md:0 14px 34px rgba(14,32,23,.10);
          --shadow-lg:0 26px 60px rgba(14,32,23,.16);
          --font-display:'Manrope', sans-serif;
          --font-body:'Inter', sans-serif;
        }
        .kb-page *{box-sizing:border-box;}
        .kb-page{font-family:var(--font-body); color:var(--ink); background:var(--canvas); min-height:100vh;}
        .kb-page img,.kb-page svg{display:block; max-width:100%;}
        .kb-page a{color:inherit; text-decoration:none;}
        .kb-page ul{list-style:none; margin:0; padding:0;}
        .kb-page button{font:inherit; cursor:pointer; background:none; border:none; color:inherit;}
        .kb-page h1,.kb-page h2,.kb-page h3{font-family:var(--font-display); font-weight:800; letter-spacing:-0.01em; margin:0;}
        .kb-page p{color:var(--ink-soft); line-height:1.7; margin:0;}
        .kb-page .container{max-width:1180px; margin:0 auto; padding:0 32px;}
        @media (max-width:700px){ .kb-page .container{padding:0 20px;} }

        .kb-page header.kb-header{background:var(--surface); border-bottom:1px solid var(--line); position:sticky; top:0; z-index:20;}
        .kb-header .kb-header-inner{display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 0;}
        .kb-header .logo-img{height:34px; width:auto;}
        .kb-header .kb-back{display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:.88rem; color:var(--ink-soft);}
        .kb-header .kb-back:hover{color:var(--green-deep);}
        .kb-header-right{display:flex; align-items:center; gap:18px;}

        .kb-hero{padding:64px 0 44px; text-align:center;}
        .kb-hero .eyebrow{display:inline-flex; align-items:center; gap:8px; font-family:var(--font-display); font-weight:700; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:var(--green-deep); background:var(--green-light); padding:7px 14px; border-radius:99px;}
        .kb-hero h1{font-size:clamp(2rem,4vw,3rem); margin-top:18px;}
        .kb-hero p{max-width:640px; margin:16px auto 0; font-size:1.05rem;}

        .kb-controls{display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; margin:0 0 40px;}
        .kb-search{display:flex; align-items:center; gap:10px; background:var(--surface); border:1.5px solid var(--line); border-radius:12px; padding:12px 16px; min-width:260px; flex:1; max-width:360px;}
        .kb-search input{border:none; outline:none; background:none; font:inherit; color:var(--ink); width:100%;}
        .kb-search svg{flex-shrink:0; color:var(--muted);}
        .kb-cats{display:flex; flex-wrap:wrap; gap:8px;}
        .kb-cat-btn{font-family:var(--font-display); font-weight:700; font-size:.8rem; padding:9px 16px; border-radius:99px; background:var(--surface); border:1.5px solid var(--line); color:var(--ink-soft); transition:all .2s ease;}
        .kb-cat-btn:hover{border-color:var(--green);}
        .kb-cat-btn.active{background:var(--green); border-color:var(--green); color:#fff;}

        .kb-grid{display:grid; grid-template-columns:repeat(3, 1fr); gap:28px; padding-bottom:110px;}
        @media (max-width:980px){ .kb-grid{grid-template-columns:repeat(2, 1fr);} }
        @media (max-width:680px){ .kb-grid{grid-template-columns:1fr;} }

        .kb-card{display:flex; flex-direction:column; background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:28px; box-shadow:var(--shadow-sm); transition:transform .25s ease, box-shadow .25s ease; height:100%;}
        .kb-card:hover{transform:translateY(-4px); box-shadow:var(--shadow-md);}
        .kb-card .kb-cat-tag{align-self:flex-start; font-family:var(--font-display); font-weight:700; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase; color:var(--green-deep); background:var(--green-light); padding:5px 12px; border-radius:99px;}
        .kb-card h3{font-size:1.15rem; margin-top:16px; line-height:1.35;}
        .kb-card p.kb-excerpt{margin-top:10px; font-size:.92rem; flex:1;}
        .kb-card .kb-meta{display:flex; align-items:center; gap:14px; margin-top:20px; font-size:.78rem; color:var(--muted); font-weight:600;}
        .kb-card .kb-meta span{display:inline-flex; align-items:center; gap:5px;}
        .kb-card .kb-read-link{margin-top:18px; display:inline-flex; align-items:center; gap:6px; font-family:var(--font-display); font-weight:700; font-size:.86rem; color:var(--green-deep);}
        .kb-card .kb-read-link svg{transition:transform .2s ease;}
        .kb-card:hover .kb-read-link svg{transform:translateX(3px);}

        .kb-empty{text-align:center; padding:80px 20px; color:var(--muted); font-weight:600;}

        .kb-page footer{background:var(--navy-dark); color:rgba(255,255,255,.7); padding:36px 0; margin-top:0;}
        .kb-page footer .kb-foot-inner{display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;}
        .kb-page footer .foot-logo-img{height:26px; width:auto;}
        .kb-page footer p{color:rgba(255,255,255,.6); font-size:.82rem;}
      `}</style>

      <header className="kb-header">
        <div className="container kb-header-inner">
          <a href="/" className="logo" onClick={goHome}>
            <img src={logoHeader} alt="BSFDM" className="logo-img" />
          </a>
          <div className="kb-header-right">
            <LanguageToggle />
            <a href="/" className="kb-back" onClick={goHome}>
              <ArrowLeft size={16} />
              {t("kb.backHome")}
            </a>
          </div>
        </div>
      </header>

      <section className="kb-hero">
        <div className="container">
          <span className="eyebrow"><BookOpen size={14} />{t("kb.eyebrow")}</span>
          <h1>{t("kb.heroTitle")}</h1>
          <p>{t("kb.heroSubtitle")}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="kb-controls">
            <div className="kb-search">
              <Search size={17} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("kb.searchPlaceholder")}
                aria-label={t("kb.searchPlaceholder")}
              />
            </div>
            <div className="kb-cats">
              <button
                className={`kb-cat-btn ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                {t("kb.allCategories")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.en}
                  className={`kb-cat-btn ${activeCategory === cat.en ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.en)}
                >
                  {cat[lang] || cat.en}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="kb-empty">{t("kb.loading")}</div>
          ) : error ? (
            <div className="kb-empty">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="kb-empty">{t("kb.noResults")}</div>
          ) : (
            <div className="kb-grid">
              {filtered.map((article) => (
                <a
                  key={article.slug}
                  href={`/knowledge-base/${article.slug}`}
                  className="kb-card"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/knowledge-base/${article.slug}`);
                  }}
                >
                  <span className="kb-cat-tag">{article.category[lang] || article.category.en}</span>
                  <h3>{article.title[lang] || article.title.en}</h3>
                  <p className="kb-excerpt">{article.excerpt[lang] || article.excerpt.en}</p>
                  <div className="kb-meta">
                    <span>{formatDate(article.publishedAt)}</span>
                    <span><Clock size={13} />{t("kb.minRead", { n: article.readMinutes })}</span>
                  </div>
                  <span className="kb-read-link">
                    {t("kb.readMore")} <ArrowRight size={15} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <div className="container kb-foot-inner">
          <img src={logoFooterWhite} alt="BSFDM" className="foot-logo-img" />
          <p>© 2026 BSF Data Management. {lang === "id" ? "Seluruh Hak Cipta Dilindungi." : "All Rights Reserved."}</p>
        </div>
      </footer>
    </div>
  );
}
