import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import logoHeader from "../assets/logoheader.webp";
import logoFooterWhite from "../assets/logo-white-footer.png";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";

export default function KnowledgeBaseArticlePage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null); // index into article.images, or null when closed

  useEffect(() => {
    setLoading(true);
    setArticle(null);
    // The article's own record (404 -> not-found state below) and the full
    // list (for the "More from the Knowledge Base" related links) are two
    // separate public endpoints — see server/routes/kbArticles.js.
    Promise.all([
      api.get(`/kb-articles/${slug}`).catch(() => null),
      api.get("/kb-articles").catch(() => []),
    ]).then(([found, all]) => {
      setArticle(found);
      setAllArticles(all);
      setLoading(false);
    });
  }, [slug]);

  const related = useMemo(() => {
    if (!article) return [];
    return allArticles.filter((a) => a.slug !== article.slug).slice(0, 3);
  }, [article, allArticles]);

  const images = article?.images || [];

  // Escape to close, Left/Right to step through every image on the article
  // (not just the gallery strip) — so opening the hero image still lets you
  // browse the rest without closing and re-opening.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, images.length]);

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
  const goToKb = (e) => {
    e?.preventDefault();
    navigate("/knowledge-base");
  };
  const goToArticle = (e, targetSlug) => {
    e.preventDefault();
    navigate(`/knowledge-base/${targetSlug}`);
  };

  return (
    <div className="bsfdm kb-page kb-article-page">
      <style>{`
        :root{
          --ink:#0F241A; --ink-soft:#4C6157; --muted:#7C9086;
          --canvas:#F6F8F4; --canvas-alt:#EEF2EC; --surface:#FFFFFF; --line:#E1E8DF;
          --green:#01613C; --green-deep:#01613C; --green-light:#E1F3E7;
          --navy-dark:#0A2017;
          --shadow-sm:0 6px 18px rgba(14,32,23,.06);
          --shadow-md:0 14px 34px rgba(14,32,23,.10);
          --font-display:'Manrope', sans-serif;
          --font-body:'Inter', sans-serif;
        }
        .kb-article-page *{box-sizing:border-box;}
        .kb-article-page{font-family:var(--font-body); color:var(--ink); background:var(--canvas); min-height:100vh;}
        .kb-article-page img,.kb-article-page svg{display:block; max-width:100%;}
        .kb-article-page a{color:inherit; text-decoration:none;}
        .kb-article-page button{font:inherit; cursor:pointer; background:none; border:none; color:inherit;}
        .kb-article-page h1,.kb-article-page h2,.kb-article-page h3{font-family:var(--font-display); font-weight:800; letter-spacing:-0.01em; margin:0;}
        .kb-article-page p{color:var(--ink-soft); line-height:1.8; margin:0;}
        .kb-article-page .container{max-width:820px; margin:0 auto; padding:0 32px;}
        @media (max-width:700px){ .kb-article-page .container{padding:0 20px;} }

        .kb-article-page header.kb-header{background:var(--surface); border-bottom:1px solid var(--line); position:sticky; top:0; z-index:20;}
        .kb-header .kb-header-inner{max-width:820px; margin:0 auto; padding:18px 32px; display:flex; align-items:center; justify-content:space-between; gap:16px;}
        @media (max-width:700px){ .kb-header .kb-header-inner{padding:18px 20px;} }
        .kb-header .logo-img{height:34px; width:auto;}
        .kb-header .kb-back{display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:.88rem; color:var(--ink-soft);}
        .kb-header .kb-back:hover{color:var(--green-deep);}
        .kb-header-right{display:flex; align-items:center; gap:18px;}

        .kb-article-body{padding:56px 0 100px;}
        .kb-crumb{display:inline-flex; align-items:center; gap:8px; font-family:var(--font-display); font-weight:700; font-size:.86rem; color:var(--green-deep); margin-bottom:28px;}
        .kb-crumb:hover{text-decoration:underline;}
        .kb-cat-tag{display:inline-flex; font-family:var(--font-display); font-weight:700; font-size:.68rem; letter-spacing:.08em; text-transform:uppercase; color:var(--green-deep); background:var(--green-light); padding:5px 12px; border-radius:99px;}
        .kb-article-body h1{font-size:clamp(1.7rem,3.6vw,2.5rem); margin-top:18px; line-height:1.25;}
        .kb-article-meta{display:flex; align-items:center; gap:16px; margin-top:18px; font-size:.85rem; color:var(--muted); font-weight:600;}
        .kb-article-meta span{display:inline-flex; align-items:center; gap:6px;}
        .kb-article-content{margin-top:36px; display:flex; flex-direction:column; gap:20px;}
        .kb-article-content p{font-size:1.02rem;}

        .kb-hero-cover{margin-top:28px; border-radius:18px; overflow:hidden; box-shadow:var(--shadow-md); cursor:zoom-in; background:var(--canvas-alt, var(--green-light));}
        .kb-hero-cover img{width:100%; aspect-ratio:16/9; object-fit:cover; display:block; transition:transform .4s ease;}
        .kb-hero-cover:hover img{transform:scale(1.02);}

        .kb-gallery{margin-top:44px;}
        .kb-gallery h2{font-size:1.05rem; display:flex; align-items:center; gap:8px;}
        .kb-gallery-grid{display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:16px;}
        @media (max-width:560px){ .kb-gallery-grid{grid-template-columns:repeat(2, 1fr);} }
        .kb-gallery-item{aspect-ratio:1; border-radius:12px; overflow:hidden; cursor:zoom-in; border:1px solid var(--line);}
        .kb-gallery-item img{width:100%; height:100%; object-fit:cover; display:block; transition:transform .3s ease;}
        .kb-gallery-item:hover img{transform:scale(1.08);}

        .kb-lightbox{position:fixed; inset:0; z-index:100; background:rgba(10,32,23,.92); display:flex; align-items:center; justify-content:center; padding:40px;}
        .kb-lightbox img{max-width:100%; max-height:84vh; border-radius:10px; box-shadow:0 20px 60px rgba(0,0,0,.5);}
        .kb-lightbox-close{position:absolute; top:22px; right:22px; width:40px; height:40px; border-radius:99px; background:rgba(255,255,255,.12); color:#fff; display:flex; align-items:center; justify-content:center;}
        .kb-lightbox-close:hover{background:rgba(255,255,255,.22);}
        .kb-lightbox-nav{position:absolute; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:99px; background:rgba(255,255,255,.12); color:#fff; display:flex; align-items:center; justify-content:center;}
        .kb-lightbox-nav:hover{background:rgba(255,255,255,.22);}
        .kb-lightbox-nav.prev{left:18px;}
        .kb-lightbox-nav.next{right:18px;}
        @media (max-width:640px){ .kb-lightbox-nav{display:none;} }
        .kb-lightbox-count{position:absolute; bottom:22px; left:50%; transform:translateX(-50%); color:rgba(255,255,255,.75); font-size:.82rem; font-weight:600;}

        .kb-related{margin-top:80px; border-top:1px solid var(--line); padding-top:40px;}
        .kb-related h2{font-size:1.3rem; margin-bottom:22px;}
        .kb-related-grid{display:grid; grid-template-columns:repeat(3, 1fr); gap:18px;}
        @media (max-width:680px){ .kb-related-grid{grid-template-columns:1fr;} }
        .kb-related-card{display:block; background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:18px; transition:transform .2s ease, box-shadow .2s ease;}
        .kb-related-card:hover{transform:translateY(-3px); box-shadow:var(--shadow-sm);}
        .kb-related-card h3{font-size:.94rem; margin-top:8px; line-height:1.4;}

        .kb-notfound{padding:120px 20px; text-align:center;}
        .kb-notfound h1{font-size:1.7rem;}
        .kb-notfound p{margin-top:12px;}
        .kb-notfound .btn{display:inline-flex; align-items:center; gap:8px; margin-top:26px; font-family:var(--font-display); font-weight:700; font-size:.86rem; text-transform:uppercase; letter-spacing:.03em; background:var(--green); color:#fff; padding:14px 26px; border-radius:12px;}

        .kb-article-page footer{background:var(--navy-dark); color:rgba(255,255,255,.7); padding:36px 0; margin-top:0;}
        .kb-article-page footer .kb-foot-inner{max-width:820px; margin:0 auto; padding:0 32px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;}
        @media (max-width:700px){ .kb-article-page footer .kb-foot-inner{padding:0 20px;} }
        .kb-article-page footer .foot-logo-img{height:26px; width:auto;}
        .kb-article-page footer p{color:rgba(255,255,255,.6); font-size:.82rem;}
      `}</style>

      <header className="kb-header">
        <div className="kb-header-inner">
          <a href="/" className="logo" onClick={goHome}>
            <img src={logoHeader} alt="BSFDM" className="logo-img" />
          </a>
          <div className="kb-header-right">
            <LanguageToggle />
            <a href="/knowledge-base" className="kb-back" onClick={goToKb}>
              <ArrowLeft size={16} />
              {t("kb.backToKb")}
            </a>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="container kb-notfound">
          <p>{t("kb.loading")}</p>
        </div>
      ) : !article ? (
        <div className="container kb-notfound">
          <h1>{t("kb.notFoundTitle")}</h1>
          <p>{t("kb.notFoundBody")}</p>
          <a href="/knowledge-base" className="btn" onClick={goToKb}>
            <ArrowLeft size={16} />
            {t("kb.backToKb")}
          </a>
        </div>
      ) : (
        <div className="kb-article-body container">
          <a href="/knowledge-base" className="kb-crumb" onClick={goToKb}>
            <ArrowLeft size={14} />
            {t("kb.backToKb")}
          </a>
          <div>
            <span className="kb-cat-tag">{article.category[lang] || article.category.en}</span>
            <h1>{article.title[lang] || article.title.en}</h1>
            <div className="kb-article-meta">
              <span>{t("kb.published")} {formatDate(article.publishedAt)}</span>
              <span><Clock size={14} />{t("kb.minRead", { n: article.readMinutes })}</span>
            </div>
          </div>

          {images.length > 0 && (
            <div className="kb-hero-cover" onClick={() => setLightboxIndex(0)}>
              <img src={images[0]} alt="" />
            </div>
          )}

          <div className="kb-article-content">
            {(article.body[lang] || article.body.en).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {images.length > 1 && (
            <div className="kb-gallery">
              <h2><Images size={18} />{t("kb.gallery")}</h2>
              <div className="kb-gallery-grid">
                {images.slice(1).map((url, i) => (
                  <button key={url} type="button" className="kb-gallery-item" onClick={() => setLightboxIndex(i + 1)}>
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="kb-related">
              <h2>{t("kb.relatedTitle")}</h2>
              <div className="kb-related-grid">
                {related.map((r) => (
                  <a
                    key={r.slug}
                    href={`/knowledge-base/${r.slug}`}
                    className="kb-related-card"
                    onClick={(e) => goToArticle(e, r.slug)}
                  >
                    <span className="kb-cat-tag">{r.category[lang] || r.category.en}</span>
                    <h3>{r.title[lang] || r.title.en}</h3>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <footer>
        <div className="kb-foot-inner">
          <img src={logoFooterWhite} alt="BSFDM" className="foot-logo-img" />
          <p>© 2026 BSF Data Management. {lang === "id" ? "Seluruh Hak Cipta Dilindungi." : "All Rights Reserved."}</p>
        </div>
      </footer>

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="kb-lightbox"
          onMouseDown={(e) => e.target === e.currentTarget && setLightboxIndex(null)}
        >
          <button type="button" className="kb-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label={t("kb.lightboxClose")}>
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="kb-lightbox-nav prev"
                onClick={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
                aria-label={t("kb.lightboxPrev")}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="kb-lightbox-nav next"
                onClick={() => setLightboxIndex((i) => (i + 1) % images.length)}
                aria-label={t("kb.lightboxNext")}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <img src={images[lightboxIndex]} alt="" />
          {images.length > 1 && (
            <span className="kb-lightbox-count">{lightboxIndex + 1} / {images.length}</span>
          )}
        </div>
      )}
    </div>
  );
}
