import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Menu, X, CalendarCheck, Boxes, Bell, FileText, LayoutDashboard, Layers,
  Egg, Droplets, ShoppingBasket, Settings, Database, Activity, BarChart3,
  Clock, Sprout, TrendingUp, Check, Target, ShieldCheck, Building2, Recycle,
  Share2, Instagram, Linkedin, Youtube, Search, MapPin, Users,
  CheckCircle2, Phone, Mail, Loader2,
} from "lucide-react";
import bsfImg from "../assets/bsf-img.webp";
import maggotImg from "../assets/maggot-img.webp";
import logoHeader from "../assets/logoheader.webp";
import logoFooterWhite from "../assets/logo-white-footer.png";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";
import CommunityMap from "../components/CommunityMap.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { api } from "../api/client.js";
import { PRIVACY_POLICY } from "../data/privacyPolicy.js";
import { TERMS_CONDITIONS } from "../data/termsConditions.js";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const RING_C = 106.8; // circumference for r=17

const HexIcon = ({ size = 62, children }) => (
  <div className="hex" style={{ width: size, height: size }}>
    <svg className="hex-frame" viewBox="0 0 62 62" fill="none">
      <polygon points="31,2 56,16.5 56,45.5 31,60 6,45.5 6,16.5" fill="#E1F3E7" />
    </svg>
    {children}
  </div>
);

const BatchRing = ({ percent }) => {
  const target = RING_C * (1 - percent / 100);
  return (
    <svg className="ring" viewBox="0 0 44 44">
      <circle className="bg" cx="22" cy="22" r="17" />
      <circle className="fg" cx="22" cy="22" r="17" strokeDasharray={RING_C} strokeDashoffset={RING_C} data-target={target} />
    </svg>
  );
};

const datasets = {
  weekly: { labels: ["W1", "W2", "W3", "W4", "W5", "W6"], values: [62, 70, 58, 74, 80, 88] },
  monthly: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [55, 67, 63, 81, 90, 98] },
  yearly: { labels: ["2021", "2022", "2023", "2024", "2025", "2026"], values: [38, 48, 58, 70, 84, 98] },
};

function renderPolicyBlock(block, i) {
  if (block.type === "p") return <p key={i}>{block.text}</p>;
  if (block.type === "ul") return <ul key={i}>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>;
  if (block.type === "dl") return (
    <div key={i} className="pp-dl">
      {block.items.map((item, j) => (
        <div key={j} className="pp-dl-item"><strong>{item.term}</strong><p>{item.desc}</p></div>
      ))}
    </div>
  );
  if (block.type === "address") return (
    <div key={i} className="pp-address">
      {block.lines.map((line, j) => <div key={j}>{line}</div>)}
    </div>
  );
  if (block.type === "role") return (
    <div key={i} className="pp-role">
      <strong>{block.term}</strong>
      {block.text && <p>{block.text}</p>}
      {block.intro && <p>{block.intro}</p>}
      {block.items && <ul>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ul>}
    </div>
  );
  return null;
}

const navLinks = [
  { href: "#home", key: "landing.nav.home" },
  { href: "#about", key: "landing.nav.about" },
  { href: "#service", key: "landing.nav.service" },
  // { href: "#features", key: "landing.nav.features" },
  // { href: "#reporting", key: "landing.nav.reporting" },
  { href: "#contact", key: "landing.nav.contact" },
  { href: "#community", key: "landing.nav.community" },
];

export default function Landing() {
  const { t, lang } = useLanguage();
  const policy = PRIVACY_POLICY[lang] || PRIVACY_POLICY.en;
  const terms = TERMS_CONDITIONS[lang] || TERMS_CONDITIONS.en;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [range, setRange] = useState("monthly");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ phone: "", email: "" });
  const [demoErrors, setDemoErrors] = useState({});
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoFailed, setDemoFailed] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const [communityRows, setCommunityRows] = useState([]);
  const [communityQuery, setCommunityQuery] = useState("");
  const [communityProvince, setCommunityProvince] = useState(null);

  useEffect(() => {
    api.get("/community").then(setCommunityRows).catch(() => {});
  }, []);

  const communityCounts = useMemo(() => {
    const c = {};
    communityRows.forEach((r) => { c[r.provinsi] = (c[r.provinsi] || 0) + 1; });
    return c;
  }, [communityRows]);

  const filteredCommunity = useMemo(() => {
    const q = communityQuery.trim().toLowerCase();
    return communityRows.filter((r) => {
      if (communityProvince && r.provinsi !== communityProvince) return false;
      if (!q) return true;
      return [r.name, r.address, r.kabupaten, r.provinsi].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [communityRows, communityQuery, communityProvince]);

  const goToLogin = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate("/login");
  };

  const goToRegister = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    navigate("/register");
  };

  const openDemoModal = (e) => {
    e.preventDefault();
    setMobileOpen(false);
    setDemoForm({ phone: "", email: "" });
    setDemoErrors({});
    setDemoSubmitted(false);
    setDemoFailed(false);
    setDemoOpen(true);
  };

  const closeDemoModal = () => setDemoOpen(false);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!demoForm.phone.trim()) errs.phone = t("landing.demo.phoneRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demoForm.email.trim())) errs.email = t("landing.demo.emailRequired");
    setDemoErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setDemoFailed(false);
    setDemoSubmitting(true);
    try {
      await api.post("/demo-requests", { phone: demoForm.phone.trim(), email: demoForm.email.trim() });
      setDemoSubmitted(true);
    } catch {
      setDemoFailed(true);
    } finally {
      setDemoSubmitting(false);
    }
  };

  const goToDashboard = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = wrapperRef.current;
    if (!root) return;

    const revealEls = root.querySelectorAll(".reveal, [data-animate]");
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    revealEls.forEach((el) => revealIO.observe(el));

    const rings = root.querySelectorAll(".ring .fg");
    const ringIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.strokeDashoffset = entry.target.dataset.target;
            ringIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    rings.forEach((r) => ringIO.observe(r));

    return () => {
      revealIO.disconnect();
      ringIO.disconnect();
    };
  }, []);

  // Hero bug image: a bouncy entrance followed by a gentle, continuous hover/flight loop.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.4 })
        .fromTo(".bug-img", { opacity: 0, scale: 0.5, rotate: -15 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.6)" })
        .to(".bug-img", { y: -8, rotate: 3, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true }, "+=0.1");
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  const activeData = datasets[range];

  return (
    <div ref={wrapperRef}>
      <style>{`
        :root{
          --ink:#0F241A; --ink-soft:#4C6157; --muted:#7C9086;
          --canvas:#F6F8F4; --canvas-alt:#EEF2EC; --surface:#FFFFFF; --line:#E1E8DF;
          --green:#01613C; --green-deep:#01613C; --green-light:#E1F3E7;
          --lime:#E36B14; --lime-deep:#E36B14;
          --navy-dark:#0A2017;
          --shadow-sm:0 6px 18px rgba(14,32,23,.06);
          --shadow-md:0 14px 34px rgba(14,32,23,.10);
          --shadow-lg:0 26px 60px rgba(14,32,23,.16);
          --font-display:'Manrope', sans-serif;
          --font-body:'Inter', sans-serif;
        }
        .bsfdm *{box-sizing:border-box;}
        .bsfdm{font-family:var(--font-body); color:var(--ink); background:var(--canvas); overflow-x:hidden; scroll-behavior:smooth;}
        .bsfdm img,.bsfdm svg{display:block; max-width:100%;}
        .bsfdm a{color:inherit; text-decoration:none;}
        .bsfdm ul{list-style:none; margin:0; padding:0;}
        .bsfdm button{font:inherit; cursor:pointer; background:none; border:none; color:inherit;}
        .bsfdm .container{max-width:1240px; margin:0 auto; padding:0 32px;}
        .bsfdm h1,.bsfdm h2,.bsfdm h3,.bsfdm h4{font-family:var(--font-display); font-weight:800; line-height:1.12; letter-spacing:-0.01em; margin:0;}
        .bsfdm h2{font-size:clamp(1.9rem,3.4vw,2.7rem);}
        .bsfdm h3{font-size:1.2rem; font-weight:700;}
        .bsfdm p{color:var(--ink-soft); line-height:1.7; margin:0;}
        .bsfdm .eyebrow{display:inline-flex; align-items:center; gap:8px; font-family:var(--font-display); font-weight:700; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:var(--green-deep); background:var(--green-light); padding:7px 14px; border-radius:99px;}
        .bsfdm .section-head{max-width:640px; margin:0 auto 56px; text-align:center;}
        .bsfdm .section-head p{margin-top:12px; font-size:1.05rem;}
        .bsfdm .section{padding:112px 0;}
        .bsfdm .section.alt{background:var(--canvas-alt);}
        @media (max-width:900px){ .bsfdm .section{padding:76px 0;} .bsfdm .container{padding:0 22px;} }

        .bsfdm .btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:var(--font-display); font-weight:700; font-size:.86rem; letter-spacing:.03em; text-transform:uppercase; padding:15px 30px; border-radius:12px; transition:transform .25s ease, box-shadow .25s ease, background .25s ease; white-space:nowrap;}
        .bsfdm .btn-primary{background:var(--green); color:#fff; box-shadow:var(--shadow-md);}
        .bsfdm .btn-primary:hover{transform:translateY(-2px); box-shadow:var(--shadow-lg);}
        .bsfdm .btn-outline{background:var(--surface); color:var(--ink); border:1.5px solid var(--line);}
        .bsfdm .btn-outline:hover{border-color:var(--green); color:var(--green-deep); transform:translateY(-2px);}
        .bsfdm .btn-ghost-dark{background:rgba(255,255,255,.08); color:#fff; border:1.5px solid rgba(255,255,255,.35);}
        .bsfdm .btn-ghost-dark:hover{background:rgba(255,255,255,.16); transform:translateY(-2px);}

        .bsfdm .hex{position:relative; display:flex; align-items:center; justify-content:center; flex-shrink:0;}
        .bsfdm .hex-frame{position:absolute; inset:0; width:100%; height:100%;}
        .bsfdm .hex .ic{position:relative; z-index:1; color:var(--green-deep);}

        .bsfdm .reveal{opacity:0; transform:translateY(26px); transition:opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1);}
        .bsfdm .reveal.in-view{opacity:1; transform:translateY(0);}
        .bsfdm .reveal.d1{transition-delay:.08s;} .bsfdm .reveal.d2{transition-delay:.16s;} .bsfdm .reveal.d3{transition-delay:.24s;} .bsfdm .reveal.d4{transition-delay:.32s;}

        @media (prefers-reduced-motion: reduce){
          .bsfdm{scroll-behavior:auto;}
          .bsfdm .reveal{opacity:1; transform:none; transition:none;}
        }

        .bsfdm header{position:fixed; top:0; left:0; right:0; z-index:200; padding:22px 0; transition:all .35s ease;}
        .bsfdm header.scrolled{padding:12px 0; background:rgba(246,248,244,.85); backdrop-filter:blur(14px); box-shadow:0 1px 0 var(--line);}
        .bsfdm nav{display:flex; align-items:center; justify-content:space-between;}
        .bsfdm .logo{display:flex; align-items:center;}
        .bsfdm .logo-img{height:40px; width:auto; display:block;}
        @media (max-width:900px){ .bsfdm .logo-img{height:34px;} }
        .bsfdm .nav-links{display:flex; align-items:center; gap:38px;}
        .bsfdm .nav-links a{font-size:.92rem; font-weight:600; color:var(--ink-soft); position:relative; padding:4px 0;}
        .bsfdm .nav-links a:hover{color:var(--ink);}
        .bsfdm .nav-right{display:flex; align-items:center; gap:18px;}
        .bsfdm .nav-login{font-weight:700; font-size:.9rem;}
        .bsfdm .burger{display:none; padding:4px;}
        @media (max-width:900px){ .bsfdm .nav-links{display:none;} .bsfdm .burger{display:block;} .bsfdm .nav-login{display:none;} .bsfdm .nav-right .lang-toggle{display:none;} }

        .bsfdm .mobile-panel{position:fixed; inset:0; background:var(--surface); z-index:300; transform:translateX(100%); transition:transform .4s cubic-bezier(.2,.7,.2,1); display:flex; flex-direction:column; padding:26px 26px 40px;}
        .bsfdm .mobile-panel.open{transform:translateX(0);}
        .bsfdm .mobile-panel .top{display:flex; justify-content:space-between; align-items:center;}
        .bsfdm .mobile-panel ul{margin-top:50px; display:flex; flex-direction:column; gap:26px;}
        .bsfdm .mobile-panel ul a{font-family:var(--font-display); font-size:1.5rem; font-weight:800;}
        .bsfdm .mobile-panel .btn{margin-top:auto; width:100%;}

        .bsfdm .hero{position:relative; padding:168px 0 100px; overflow:hidden;}
        .bsfdm .hero-grid{display:grid; grid-template-columns:1.05fr .95fr; gap:40px; align-items:center; position:relative; z-index:2;}
        .bsfdm .hero h1{font-size:clamp(2.5rem,4.6vw,3.7rem); color:var(--ink);}
        .bsfdm .hero h1 .line2{display:block; color:var(--green);}
        .bsfdm .hero p.lead{margin-top:22px; font-size:1.08rem; max-width:490px;}
        .bsfdm .hero-ctas{display:flex; gap:16px; margin-top:34px; flex-wrap:wrap;}
        .bsfdm .hero-tags{margin-top:30px; display:flex; align-items:center; gap:10px; font-size:.85rem; font-weight:600; color:var(--muted);}
        .bsfdm .hero-tags .dot{width:5px; height:5px; border-radius:50%; background:var(--lime-deep);}
        .bsfdm .hero-visual{position:relative; height:520px;}
        .bsfdm .blob{position:absolute; opacity:.9;}
        .bsfdm .blob svg{width:100%; height:100%;}
        .bsfdm .blob-img{width:100%; height:100%; object-fit:cover; border-radius:50%; display:block;}
        .bsfdm .blob-1{top:-60px; right:-40px; width:420px; height:420px; animation:float-slow 9s ease-in-out infinite;}
        .bsfdm .blob-2{bottom:-30px; left:-10px; width:260px; height:260px; opacity:.5; animation:float-slow 11s ease-in-out infinite reverse;}
        @keyframes float-slow{0%,100%{transform:translateY(0) rotate(0deg);} 50%{transform:translateY(-16px) rotate(3deg);}}
        .bsfdm .hex-ring{position:absolute; inset:0; margin:auto; width:340px; height:340px; animation:spin 60s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .bsfdm .hero-card{position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:230px; height:230px; border-radius:50%; overflow:hidden; background:var(--surface); box-shadow:var(--shadow-lg); display:flex; align-items:center; justify-content:center; z-index:3;}
        .bsfdm .hero-card .bug-img{width:78%; height:78%; object-fit:contain; display:block;}
        .bsfdm .chip{position:absolute; background:var(--surface); border-radius:16px; box-shadow:var(--shadow-md); padding:14px 18px; z-index:4; animation:float-chip 5s ease-in-out infinite;}
        .bsfdm .chip .num{font-family:var(--font-display); font-weight:800; font-size:1.3rem; color:var(--ink);}
        .bsfdm .chip .lbl{font-size:.72rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.04em;}
        .bsfdm .chip-1{top:14px; left:0; animation-delay:.2s;}
        .bsfdm .chip-2{bottom:60px; right:-6px; animation-delay:1s;}
        .bsfdm .chip-3{bottom:-10px; left:60px; animation-delay:1.8s;}
        @keyframes float-chip{0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);}}
        @media (max-width:1000px){ .bsfdm .hero-grid{grid-template-columns:1fr;} .bsfdm .hero-visual{height:400px; margin-top:20px;} .bsfdm .hero p.lead{max-width:100%;} }
        @media (max-width:520px){ .bsfdm .hero{padding-top:140px;} .bsfdm .hero-card{width:170px; height:170px;} .bsfdm .hex-ring{width:250px; height:250px;} }

        .bsfdm .feat-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:22px;}
        .bsfdm .feat-card{background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:32px 26px; transition:transform .3s ease, box-shadow .3s ease, border-color .3s ease; position:relative; overflow:hidden;}
        .bsfdm .feat-card:hover{transform:translateY(-6px); box-shadow:var(--shadow-md); border-color:transparent;}
        .bsfdm .feat-card::before{content:''; position:absolute; left:0; right:0; bottom:0; height:3px; background:var(--green); transform:scaleX(0); transform-origin:left; transition:transform .3s ease;}
        .bsfdm .feat-card:hover::before{transform:scaleX(1);}
        .bsfdm .feat-card .hex{margin-bottom:20px;}
        .bsfdm .feat-card h3{margin-bottom:10px;}
        .bsfdm .feat-card p{font-size:.92rem;}
        @media (max-width:900px){ .bsfdm .feat-grid{grid-template-columns:1fr 1fr;} }
        @media (max-width:560px){ .bsfdm .feat-grid{grid-template-columns:1fr;} }

        .bsfdm .showcase{display:grid; grid-template-columns:1.15fr .85fr; gap:64px; align-items:center;}
        .bsfdm .showcase-visual{position:relative;}
        .bsfdm .device{background:var(--navy-dark); border-radius:20px; padding:16px 16px 46px; box-shadow:var(--shadow-lg); position:relative;}
        .bsfdm .device::after{content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:100px; height:8px; background:#132D20; border-radius:0 0 8px 8px;}
        .bsfdm .screen{background:var(--canvas); border-radius:10px; overflow:hidden; display:grid; grid-template-columns:150px 1fr; min-height:400px;}
        .bsfdm .side{background:var(--surface); border-right:1px solid var(--line); padding:20px 14px; display:flex; flex-direction:column; gap:4px;}
        .bsfdm .side .s-logo{font-family:var(--font-display); font-weight:800; font-size:.92rem; margin-bottom:14px; padding-left:6px;}
        .bsfdm .side a{display:flex; align-items:center; gap:9px; font-size:.72rem; font-weight:600; color:var(--ink-soft); padding:8px 8px; border-radius:8px;}
        .bsfdm .side a.active{background:var(--green-light); color:var(--green-deep);}
        .bsfdm .main-panel{padding:20px 20px 10px;}
        .bsfdm .panel-head{margin-bottom:16px;}
        .bsfdm .panel-head h4{font-family:var(--font-display); font-weight:800; font-size:1rem;}
        .bsfdm .panel-head span{font-size:.68rem; color:var(--muted); font-weight:600;}
        .bsfdm .stat-row{display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:16px;}
        .bsfdm .stat-box{background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:10px 12px;}
        .bsfdm .stat-box .v{font-family:var(--font-display); font-weight:800; font-size:1rem; color:var(--ink);}
        .bsfdm .stat-box .l{font-size:.6rem; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.03em;}
        .bsfdm .chart-box{background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:14px; margin-bottom:12px;}
        .bsfdm .chart-box .t{font-size:.7rem; font-weight:700; color:var(--ink-soft); margin-bottom:8px;}
        .bsfdm .mini-line{width:100%; height:auto;}
        .bsfdm .mini-line polyline{fill:none; stroke:var(--green); stroke-width:3; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:600; stroke-dashoffset:600; transition:stroke-dashoffset 1.6s ease;}
        .bsfdm .in-view .mini-line polyline{stroke-dashoffset:0;}
        .bsfdm .batch-row{display:flex; gap:10px;}
        .bsfdm .batch-card{flex:1; background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:10px; display:flex; align-items:center; gap:10px;}
        .bsfdm .ring{width:38px; height:38px; flex-shrink:0;}
        .bsfdm .ring circle{fill:none; stroke-width:5;}
        .bsfdm .ring .bg{stroke:var(--line);}
        .bsfdm .ring .fg{stroke:var(--green); stroke-linecap:round; transform:rotate(-90deg); transform-origin:50% 50%; transition:stroke-dashoffset 1.4s ease;}
        .bsfdm .batch-card .bt{font-size:.66rem; font-weight:700;}
        .bsfdm .batch-card .bs{font-size:.58rem; color:var(--muted); font-weight:600;}
        .bsfdm .float-card{position:absolute; background:var(--surface); border-radius:14px; box-shadow:var(--shadow-lg); padding:12px 16px; font-size:.75rem; font-weight:700; display:flex; align-items:center; gap:8px; animation:float-chip 6s ease-in-out infinite;}
        .bsfdm .float-card .dot2{width:8px; height:8px; border-radius:50%; background:var(--lime);}
        .bsfdm .fc-1{top:-18px; left:-30px; animation-delay:.3s;}
        .bsfdm .fc-2{bottom:80px; right:-34px; animation-delay:1.4s;}
        .bsfdm .fc-3{bottom:-20px; left:40px; animation-delay:2.1s;}
        .bsfdm .benefit-list{margin-top:26px; display:flex; flex-direction:column; gap:20px;}
        .bsfdm .benefit{display:flex; gap:16px; align-items:flex-start;}
        .bsfdm .benefit h4{font-family:var(--font-display); font-weight:700; font-size:.98rem; margin-bottom:4px;}
        .bsfdm .benefit p{font-size:.9rem;}
        @media (max-width:1050px){ .bsfdm .showcase{grid-template-columns:1fr;} .bsfdm .float-card{display:none;} }
        @media (max-width:600px){ .bsfdm .screen{grid-template-columns:1fr;} .bsfdm .side{display:none;} .bsfdm .stat-row{grid-template-columns:1fr 1fr;} .bsfdm .batch-row{flex-direction:column;} }

        .bsfdm .workflow{display:grid; grid-template-columns:repeat(6,1fr); gap:0; position:relative; margin-top:20px;}
        .bsfdm .wf-step{padding:0 14px; text-align:center; position:relative;}
        .bsfdm .wf-step .node{width:70px; height:70px; margin:0 auto 18px; position:relative;}
        .bsfdm .wf-step .num{position:absolute; top:-8px; right:calc(50% - 46px); background:var(--ink); color:#fff; font-family:var(--font-display); font-size:.64rem; font-weight:800; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center;}
        .bsfdm .wf-step h4{font-family:var(--font-display); font-weight:700; font-size:.9rem; margin-bottom:6px;}
        .bsfdm .wf-step p{font-size:.78rem;}
        .bsfdm .wf-line{position:absolute; top:35px; left:calc(50% + 46px); width:calc(100% - 92px); height:2px; background:repeating-linear-gradient(90deg, var(--green) 0 8px, transparent 8px 14px);}
        .bsfdm .wf-step:last-child .wf-line{display:none;}
        @media (max-width:900px){
          .bsfdm .workflow{grid-template-columns:1fr; gap:36px; max-width:360px; margin:20px auto 0;}
          .bsfdm .wf-step{display:flex; align-items:flex-start; gap:18px; text-align:left; padding:0;}
          .bsfdm .wf-step .node{margin:0;}
          .bsfdm .wf-step .num{top:-6px; right:auto; left:-6px;}
          .bsfdm .wf-line{top:76px; left:35px; width:2px; height:calc(100% + 4px); background:repeating-linear-gradient(180deg, var(--green) 0 8px, transparent 8px 14px);}
        }

        .bsfdm .split{display:grid; grid-template-columns:.95fr 1.05fr; gap:64px; align-items:center;}
        .bsfdm .split.rev{grid-template-columns:1.05fr .95fr;}
        .bsfdm .split.rev .split-visual{order:2;}
        .bsfdm .split.rev .split-content{order:1;}
        .bsfdm .mock-card{background:var(--surface); border:1px solid var(--line); border-radius:22px; box-shadow:var(--shadow-md); padding:24px;}
        .bsfdm .mock-card .mh{display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; flex-wrap:wrap; gap:10px;}
        .bsfdm .mock-card .mh h4{font-family:var(--font-display); font-size:.95rem; font-weight:800;}
        .bsfdm .bar-chart{display:flex; align-items:flex-end; gap:10px; height:150px; margin-top:6px;}
        .bsfdm .bar-chart .bar{flex:1; background:var(--green); border-radius:8px 8px 3px 3px; transition:height 1s cubic-bezier(.2,.7,.2,1);}
        .bsfdm .bar-chart .bar span{display:block; text-align:center; margin-top:8px; font-size:.62rem; color:var(--muted); font-weight:700;}
        .bsfdm .checklist{margin-top:26px; display:grid; grid-template-columns:1fr 1fr; gap:14px 20px;}
        .bsfdm .checklist li{display:flex; align-items:center; gap:10px; font-size:.92rem; font-weight:600; color:var(--ink);}
        @media (max-width:950px){ .bsfdm .split, .bsfdm .split.rev{grid-template-columns:1fr;} .bsfdm .split.rev .split-visual{order:1;} .bsfdm .split.rev .split-content{order:2;} .bsfdm .checklist{grid-template-columns:1fr;} }

        .bsfdm .insight-cards{display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-bottom:40px;}
        .bsfdm .insight-card{background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:28px;}
        .bsfdm .insight-card .top{display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;}
        .bsfdm .insight-card .trend{font-size:.72rem; font-weight:800; color:var(--green-deep); background:var(--green-light); padding:5px 10px; border-radius:99px;}
        .bsfdm .insight-card .big{font-family:var(--font-display); font-weight:800; font-size:2rem;}
        .bsfdm .insight-card .cap{font-size:.85rem; margin-top:4px;}
        .bsfdm .filters{display:flex; gap:8px;}
        .bsfdm .filters button{padding:8px 18px; border-radius:99px; font-size:.78rem; font-weight:700; border:1.5px solid var(--line); color:var(--ink-soft); transition:all .25s ease;}
        .bsfdm .filters button.active{background:var(--ink); border-color:var(--ink); color:#fff;}
        @media (max-width:850px){ .bsfdm .insight-cards{grid-template-columns:1fr;} }

        .bsfdm .phone-wrap{display:flex; justify-content:center;}
        .bsfdm .phone{width:280px; background:var(--navy-dark); border-radius:40px; padding:14px; box-shadow:var(--shadow-lg);}
        .bsfdm .phone .pscreen{background:var(--canvas); border-radius:28px; padding:24px 16px; min-height:480px;}
        .bsfdm .phone .ptime{text-align:center; font-family:var(--font-display); font-weight:800; font-size:1.6rem; margin-bottom:20px;}
        .bsfdm .notif{background:var(--surface); border-radius:16px; padding:14px; box-shadow:var(--shadow-sm); margin-bottom:12px; display:flex; gap:12px; opacity:0; animation:notif-in .6s ease forwards;}
        .bsfdm .notif:nth-child(2){animation-delay:.3s;} .bsfdm .notif:nth-child(3){animation-delay:.6s;} .bsfdm .notif:nth-child(4){animation-delay:.9s;}
        @keyframes notif-in{from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);}}
        .bsfdm .notif .nt{font-size:.78rem; font-weight:800;}
        .bsfdm .notif .nb{font-size:.72rem; color:var(--ink-soft); margin-top:2px; line-height:1.4;}

        .bsfdm .grid-4{display:grid; grid-template-columns:repeat(4,1fr); gap:22px;}
        .bsfdm .why-card{background:var(--surface); border:1px solid var(--line); border-radius:20px; padding:30px 24px; transition:transform .3s ease, box-shadow .3s ease;}
        .bsfdm .why-card:hover{transform:translateY(-6px); box-shadow:var(--shadow-md);}
        .bsfdm .why-card .hex{margin-bottom:18px;}
        .bsfdm .why-card h4{font-family:var(--font-display); font-weight:700; font-size:1.02rem; margin-bottom:8px;}
        .bsfdm .why-card p{font-size:.88rem;}
        @media (max-width:950px){ .bsfdm .grid-4{grid-template-columns:1fr 1fr;} }
        @media (max-width:560px){ .bsfdm .grid-4{grid-template-columns:1fr;} }

        .bsfdm .report-features{margin-top:22px; display:grid; grid-template-columns:1fr 1fr; gap:10px 20px;}
        .bsfdm .report-features li{font-size:.9rem; font-weight:600; display:flex; align-items:center; gap:8px;}
        .bsfdm .report-features li::before{content:''; width:6px; height:6px; background:var(--lime-deep); border-radius:1px; transform:rotate(45deg); flex-shrink:0;}
        .bsfdm .report-ctas{display:flex; gap:14px; margin-top:28px; flex-wrap:wrap;}
        .bsfdm .formats{margin-top:18px; font-size:.8rem; font-weight:700; color:var(--muted); letter-spacing:.04em;}
        .bsfdm .report-mock{background:var(--surface); border:1px solid var(--line); border-radius:22px; box-shadow:var(--shadow-md); padding:26px;}
        .bsfdm .report-mock .rrow{display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid var(--line);}
        .bsfdm .report-mock .rrow:last-child{border-bottom:none;}
        .bsfdm .report-mock .rname{font-size:.86rem; font-weight:700;}
        .bsfdm .report-mock .rdate{font-size:.72rem; color:var(--muted);}
        .bsfdm .report-mock .rtag{font-size:.66rem; font-weight:800; padding:5px 10px; border-radius:99px; background:var(--green-light); color:var(--green-deep);}

        .bsfdm .cta-section{position:relative; overflow:hidden; background:var(--green); border-radius:32px; padding:90px 60px; text-align:center; margin:0 auto; max-width:1240px;}
        .bsfdm .cta-section h2{color:#fff;}
        .bsfdm .cta-section p{color:rgba(255,255,255,.8); max-width:520px; margin:16px auto 0; font-size:1.05rem;}
        .bsfdm .cta-btns{display:flex; gap:16px; justify-content:center; margin-top:34px; flex-wrap:wrap;}
        .bsfdm .cta-section .btn-primary{background:var(--lime); color:#fff;}
        .bsfdm .cta-note{margin-top:22px; font-size:.82rem; font-weight:700; color:rgba(255,255,255,.65); letter-spacing:.05em;}
        .bsfdm .cta-hex-bg{position:absolute; inset:0; opacity:.15; pointer-events:none;}
        @media (max-width:700px){ .bsfdm .cta-section{padding:64px 26px; border-radius:22px;} }

        .bsfdm .community-split{display:grid; grid-template-columns:1.1fr .9fr; gap:48px; align-items:start;}
        .bsfdm .community-map-wrap{background:var(--surface); border:1px solid var(--line); border-radius:22px; padding:26px; box-shadow:var(--shadow-sm);}
        .bsfdm .cm-tooltip{background:var(--canvas-alt); color:var(--ink);}
        .bsfdm .cm-legend{color:var(--muted);}
        .bsfdm .cm-legend .swatch{background:linear-gradient(90deg, var(--line), var(--green));}
        .bsfdm .community-list-wrap{background:var(--surface); border:1px solid var(--line); border-radius:22px; padding:26px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; max-height:520px;}
        .bsfdm .community-search{display:flex; align-items:center; gap:10px; background:var(--canvas-alt); border:1px solid var(--line); border-radius:12px; padding:11px 14px; color:var(--muted);}
        .bsfdm .community-search input{flex:1; border:none; background:none; font:inherit; color:var(--ink); outline:none;}
        .bsfdm .community-chip{display:inline-flex; align-items:center; gap:6px; align-self:flex-start; margin-top:12px; padding:6px 12px; border-radius:99px; background:var(--green-light); color:var(--green-deep); font-size:.78rem; font-weight:700;}
        .bsfdm .community-count{display:flex; align-items:center; gap:6px; margin-top:14px; font-size:.78rem; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.04em;}
        .bsfdm .community-list{margin-top:10px; overflow-y:auto; display:flex; flex-direction:column;}
        .bsfdm .community-row{padding:13px 4px; border-bottom:1px solid var(--line);}
        .bsfdm .community-row:last-child{border-bottom:none;}
        .bsfdm .cr-name{font-weight:700; color:var(--ink); font-size:.92rem;}
        .bsfdm .cr-loc{display:flex; align-items:flex-start; gap:5px; margin-top:4px; font-size:.8rem; color:var(--muted);}
        @media (max-width:950px){ .bsfdm .community-split{grid-template-columns:1fr;} .bsfdm .community-list-wrap{max-height:400px;} }

        .bsfdm footer{background:var(--navy-dark); color:rgba(255,255,255,.7); padding:80px 0 0; margin-top:130px;}
        .bsfdm .foot-grid{display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:40px; padding-bottom:56px; border-bottom:1px solid rgba(255,255,255,.1);}
        .bsfdm .foot-logo{display:flex; align-items:center; margin-bottom:16px;}
        .bsfdm .foot-logo-img{height:44px; width:auto; display:block;}
        .bsfdm .foot-grid p{color:rgba(255,255,255,.55); font-size:.88rem; max-width:280px;}
        .bsfdm .foot-grid h5{color:#fff; font-family:var(--font-display); font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:18px;}
        .bsfdm .foot-grid ul{display:flex; flex-direction:column; gap:12px;}
        .bsfdm .foot-grid ul a{font-size:.9rem; color:rgba(255,255,255,.6); transition:color .2s ease;}
        .bsfdm .foot-grid ul a:hover{color:var(--lime);}
        .bsfdm .foot-social{display:flex; gap:10px; margin-top:18px;}
        .bsfdm .foot-social a{width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; transition:background .2s ease;}
        .bsfdm .foot-social a:hover{background:var(--green);}
        .bsfdm .foot-bottom{display:flex; justify-content:space-between; align-items:center; padding:26px 0; font-size:.8rem; color:rgba(255,255,255,.45); flex-wrap:wrap; gap:10px;}
        @media (max-width:900px){ .bsfdm .foot-grid{grid-template-columns:1fr 1fr; gap:36px 20px;} }
        @media (max-width:560px){ .bsfdm .foot-grid{grid-template-columns:1fr;} }

        .bsfdm ::selection{background:var(--lime); color:#06180F;}
        .bsfdm a:focus-visible, .bsfdm button:focus-visible{outline:2px solid var(--green); outline-offset:3px; border-radius:4px;}

        .bsfdm .pp-overlay{position:fixed; inset:0; background:rgba(10,32,23,.55); z-index:1200; display:flex; align-items:center; justify-content:center; padding:24px;}
        .bsfdm .pp-modal{background:var(--surface); border-radius:18px; width:100%; max-width:720px; max-height:86vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg);}
        .bsfdm .pp-head{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:24px 28px; border-bottom:1px solid var(--line);}
        .bsfdm .pp-head h3{font-family:var(--font-display); font-size:1.3rem; font-weight:800; color:var(--ink); margin:0;}
        .bsfdm .pp-updated{display:block; margin-top:4px; font-size:.82rem; color:var(--muted);}
        .bsfdm .pp-head button{color:var(--muted); padding:4px; flex-shrink:0;}
        .bsfdm .pp-head button:hover{color:var(--ink);}
        .bsfdm .pp-body{padding:24px 28px 32px; overflow-y:auto; font-size:.92rem; line-height:1.7; color:var(--ink-soft);}
        .bsfdm .pp-body > p{margin:0 0 14px;}
        .bsfdm .pp-section{margin-top:28px;}
        .bsfdm .pp-section:first-of-type{margin-top:8px;}
        .bsfdm .pp-section h4{font-family:var(--font-display); font-size:1.02rem; font-weight:800; color:var(--ink); margin:0 0 10px;}
        .bsfdm .pp-subsection{margin-top:18px;}
        .bsfdm .pp-subsection h4{font-family:var(--font-display); font-size:.92rem; font-weight:700; color:var(--ink); margin:0 0 8px;}
        .bsfdm .pp-body p{margin:0 0 10px;}
        .bsfdm .pp-body ul{list-style:disc; padding-left:22px; margin:0 0 12px; display:block;}
        .bsfdm .pp-body ul li{margin-bottom:6px;}
        .bsfdm .pp-dl{margin:0 0 12px; display:flex; flex-direction:column; gap:12px;}
        .bsfdm .pp-dl-item strong{display:block; color:var(--ink); font-weight:700; margin-bottom:3px;}
        .bsfdm .pp-dl-item p{margin:0;}
        .bsfdm .pp-role{margin:0 0 14px;}
        .bsfdm .pp-role strong{display:block; color:var(--ink); font-weight:700; margin-bottom:3px;}
        .bsfdm .pp-role p{margin:0 0 6px;}
        .bsfdm .pp-role ul{margin:6px 0 0;}
        .bsfdm .pp-address{margin:0 0 12px; padding:14px 16px; background:var(--canvas); border-radius:10px; font-style:normal;}
        .bsfdm .pp-address div{margin-bottom:3px;}
        .bsfdm .pp-address div:last-child{margin-bottom:0;}
        @media (max-width:640px){ .bsfdm .pp-modal{max-height:92vh;} .bsfdm .pp-head{padding:18px 20px;} .bsfdm .pp-body{padding:18px 20px 26px;} }

        .bsfdm .demo-modal{position:relative; background:var(--surface); border-radius:18px; width:100%; max-width:440px; padding:36px 32px 32px; box-shadow:var(--shadow-lg);}
        .bsfdm .demo-close{position:absolute; top:16px; right:16px; color:var(--muted); padding:6px; border-radius:8px;}
        .bsfdm .demo-close:hover{color:var(--ink); background:var(--canvas);}
        .bsfdm .demo-modal h3{font-family:var(--font-display); font-size:1.3rem; font-weight:800; color:var(--ink); margin:0 0 10px; padding-right:24px;}
        .bsfdm .demo-subtitle{font-size:.88rem; color:var(--ink-soft); line-height:1.6; margin:0 0 22px;}
        .bsfdm .demo-field{margin-bottom:16px;}
        .bsfdm .demo-field label{display:block; font-size:.8rem; font-weight:700; color:var(--ink); margin-bottom:7px;}
        .bsfdm .demo-input-wrap{display:flex; align-items:center; gap:9px; border:1.5px solid var(--line); border-radius:11px; padding:12px 14px; color:var(--muted); transition:border-color .2s ease;}
        .bsfdm .demo-input-wrap:focus-within{border-color:var(--green);}
        .bsfdm .demo-field.has-err .demo-input-wrap{border-color:#D8452D;}
        .bsfdm .demo-input-wrap input{flex:1; border:none; background:none; font:inherit; font-size:.92rem; color:var(--ink); outline:none;}
        .bsfdm .demo-err{margin-top:6px; font-size:.78rem; color:#D8452D; font-weight:600;}
        .bsfdm .demo-fail{margin-bottom:16px; background:#FDECE3; border:1px solid #E36B14; color:#B3540F; font-size:.82rem; font-weight:600; padding:10px 13px; border-radius:10px;}
        .bsfdm .demo-modal .btn{border:none; cursor:pointer;}
        .bsfdm .demo-modal .btn:disabled{opacity:.7; cursor:not-allowed; transform:none;}
        .bsfdm .demo-spin{animation:spin 0.8s linear infinite;}
        .bsfdm .demo-success{text-align:center;}
        .bsfdm .demo-success-ic{width:56px; height:56px; border-radius:50%; background:var(--green-light); color:var(--green); display:flex; align-items:center; justify-content:center; margin:4px auto 18px;}
        .bsfdm .demo-success h3{padding-right:0;}
        .bsfdm .demo-success p{font-size:.92rem; color:var(--ink-soft); line-height:1.65; margin:0 0 24px;}
        @media (max-width:480px){ .bsfdm .demo-modal{padding:30px 22px 26px;} }
      `}</style>

      <div className="bsfdm">
        {/* ============ NAV ============ */}
        <header className={scrolled ? "scrolled" : ""}>
          <div className="container">
            <nav>
              <a href="#home" className="logo">
                <img src={logoHeader} alt="BSFDM" className="logo-img" />
              </a>
              <ul className="nav-links">
                {navLinks.map((n) => (
                  <li key={n.href}><a href={n.href}>{t(n.key)}</a></li>
                ))}
              </ul>
              <div className="nav-right">
                <LanguageToggle />
                <a href="/register" className="btn btn-outline nav-login" style={{ padding: "11px 22px" }} onClick={goToRegister}>{t("landing.nav.register")}</a>
                <a href="/login" className="btn btn-primary nav-login" style={{ padding: "11px 22px" }} onClick={goToLogin}>{t("landing.nav.login")}</a>
                <button className="burger" aria-label={t("landing.nav.openMenu")} onClick={() => setMobileOpen(true)}>
                  <Menu size={26} />
                </button>
              </div>
            </nav>
          </div>
        </header>

        <div className={`mobile-panel ${mobileOpen ? "open" : ""}`}>
          <div className="top">
            <a href="#home" className="logo" onClick={() => setMobileOpen(false)}>
              <img src={logoHeader} alt="BSFDM" className="logo-img" />
            </a>
            <button aria-label={t("landing.nav.closeMenu")} onClick={() => setMobileOpen(false)}>
              <X size={26} />
            </button>
          </div>
          <ul>
            {navLinks.map((n) => (
              <li key={n.href}><a href={n.href} onClick={() => setMobileOpen(false)}>{t(n.key)}</a></li>
            ))}
          </ul>
          <LanguageToggle style={{ marginBottom: 18 }} />
          <a href="/register" className="btn btn-outline" style={{ marginBottom: 12 }} onClick={goToRegister}>{t("landing.nav.register")}</a>
          <a href="/login" className="btn btn-primary" onClick={goToLogin}>{t("landing.nav.login")}</a>
        </div>

        {/* ============ HERO ============ */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="reveal in-view">
              <h1>{t("landing.hero.title1")}<span className="line2">{t("landing.hero.title2")}</span></h1>
              <p className="lead">{t("landing.hero.lead")}</p>
              <div className="hero-ctas">
                <a href="#about" className="btn btn-primary">{t("landing.hero.moreInfo")}</a>
                <a href="/dashboard" className="btn btn-outline" onClick={goToDashboard}>{t("landing.hero.viewDashboard")}</a>
              </div>
              <div className="hero-tags"><span>{t("landing.hero.tag1")}</span><span className="dot"></span><span>{t("landing.hero.tag2")}</span><span className="dot"></span><span>{t("landing.hero.tag3")}</span></div>
            </div>

            <div className="hero-visual reveal d2 in-view">
              <div className="blob blob-1">
                <svg viewBox="0 0 400 400" fill="none"><path d="M120 40C200 10 320 40 350 130C380 220 330 300 240 340C150 380 60 350 30 260C0 170 40 70 120 40Z" fill="#01613C" /></svg>
              </div>
              <div className="blob blob-2">
                <img className="blob-img" src={maggotImg} alt="BSF Maggots" />
              </div>

              <svg className="hex-ring" viewBox="0 0 340 340" fill="none">
                <circle cx="170" cy="170" r="160" stroke="#0F5C30" strokeOpacity=".18" strokeWidth="1.5" strokeDasharray="4 10" />
                <circle cx="170" cy="170" r="130" stroke="#0F5C30" strokeOpacity=".28" strokeWidth="1.5" strokeDasharray="2 8" />
              </svg>

              <div className="hero-card">
                <img className="bug-img" src={bsfImg} alt="Black Soldier Fly" />
              </div>

              <div className="chip chip-1"><div className="num">24</div><div className="lbl">{t("landing.hero.chipActiveBatch")}</div></div>
              <div className="chip chip-2"><div className="num">8</div><div className="lbl">{t("landing.hero.chipHarvestReady")}</div></div>
              <div className="chip chip-3"><div className="num">94%</div><div className="lbl">{t("landing.hero.chipProductionSuccess")}</div></div>
            </div>
          </div>
        </section>

        {/* ============ EASY TO MANAGE ============ */}
        <section className="section" id="service">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.service.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.service.title")}</h2>
              <p>{t("landing.service.subtitle")}</p>
            </div>
            <div className="feat-grid">
              <div className="feat-card reveal d1">
                <HexIcon><CalendarCheck className="ic" size={24} strokeWidth={1.7} /></HexIcon>
                <h3>{t("landing.service.feat1.title")}</h3>
                <p>{t("landing.service.feat1.desc")}</p>
              </div>
              <div className="feat-card reveal d2">
                <HexIcon><Boxes className="ic" size={24} strokeWidth={1.7} /></HexIcon>
                <h3>{t("landing.service.feat2.title")}</h3>
                <p>{t("landing.service.feat2.desc")}</p>
              </div>
              <div className="feat-card reveal d3">
                <HexIcon><Bell className="ic" size={24} strokeWidth={1.7} /></HexIcon>
                <h3>{t("landing.service.feat3.title")}</h3>
                <p>{t("landing.service.feat3.desc")}</p>
              </div>
              <div className="feat-card reveal d4">
                <HexIcon><FileText className="ic" size={24} strokeWidth={1.7} /></HexIcon>
                <h3>{t("landing.service.feat4.title")}</h3>
                <p>{t("landing.service.feat4.desc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PROFESSIONAL DATA MANAGEMENT SYSTEM ============ */}
        <section className="section alt" id="about">
          <div className="container">
            <div className="showcase">
              <div className="showcase-visual reveal">
                <div className="device" data-animate>
                  <div className="screen">
                    <div className="side">
                      <div className="s-logo">BSFDM</div>
                      <a className="active"><LayoutDashboard size={15} />Dashboard</a>
                      <a><Layers size={15} />Production</a>
                      <a><Boxes size={15} />Batch Management</a>
                      <a><Egg size={15} />Hatching</a>
                      <a><Droplets size={15} />Feeding</a>
                      <a><ShoppingBasket size={15} />Harvest</a>
                      <a><FileText size={15} />Reports</a>
                      <a><Bell size={15} />Notifications</a>
                      <a><Settings size={15} />Settings</a>
                    </div>
                    <div className="main-panel">
                      <div className="panel-head">
                        <h4>{t("landing.about.mockGreeting")}</h4>
                        <span>{t("landing.about.mockDate")}</span>
                      </div>
                      <div className="stat-row">
                        <div className="stat-box"><div className="v">24</div><div className="l">{t("landing.about.mockActiveBatch")}</div></div>
                        <div className="stat-box"><div className="v">1.8kg</div><div className="l">{t("landing.about.mockEggProduction")}</div></div>
                        <div className="stat-box"><div className="v">8</div><div className="l">{t("landing.about.mockHarvestReady")}</div></div>
                        <div className="stat-box"><div className="v">94%</div><div className="l">{t("landing.about.mockSurvivalRate")}</div></div>
                      </div>
                      <div className="chart-box">
                        <div className="t">{t("landing.about.mockChartTitle")}</div>
                        <svg className="mini-line" viewBox="0 0 260 90" preserveAspectRatio="none">
                          <polyline points="0,76 52,59 104,64 156,37 208,24 260,12" />
                        </svg>
                      </div>
                      <div className="batch-row">
                        <div className="batch-card"><BatchRing percent={75} /><div><div className="bt">BSF-001</div><div className="bs">{t("landing.about.mockBatch1")}</div></div></div>
                        <div className="batch-card"><BatchRing percent={60} /><div><div className="bt">BSF-002</div><div className="bs">{t("landing.about.mockBatch2")}</div></div></div>
                        <div className="batch-card"><BatchRing percent={100} /><div><div className="bt">BSF-003</div><div className="bs">{t("landing.about.mockBatch3")}</div></div></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="float-card fc-1"><span className="dot2"></span>{t("landing.about.float1")}</div>
                <div className="float-card fc-2"><span className="dot2"></span>{t("landing.about.float2")}</div>
                <div className="float-card fc-3"><span className="dot2"></span>{t("landing.about.float3")}</div>
              </div>

              <div className="reveal d2">
                <span className="eyebrow">{t("landing.about.eyebrow")}</span>
                <h2 style={{ marginTop: 16 }}>{t("landing.about.title")}</h2>
                <p style={{ marginTop: 10, fontWeight: 600, color: "var(--ink)" }}>{t("landing.about.subtitle")}</p>
                <p style={{ marginTop: 14 }}>{t("landing.about.desc")}</p>
                <div className="benefit-list">
                  <div className="benefit"><HexIcon size={50}><Database className="ic" size={20} strokeWidth={1.7} /></HexIcon><div><h4>{t("landing.about.benefit1.title")}</h4><p>{t("landing.about.benefit1.desc")}</p></div></div>
                  <div className="benefit"><HexIcon size={50}><Activity className="ic" size={20} strokeWidth={1.7} /></HexIcon><div><h4>{t("landing.about.benefit2.title")}</h4><p>{t("landing.about.benefit2.desc")}</p></div></div>
                  <div className="benefit"><HexIcon size={50}><CalendarCheck className="ic" size={20} strokeWidth={1.7} /></HexIcon><div><h4>{t("landing.about.benefit3.title")}</h4><p>{t("landing.about.benefit3.desc")}</p></div></div>
                  <div className="benefit"><HexIcon size={50}><BarChart3 className="ic" size={20} strokeWidth={1.7} /></HexIcon><div><h4>{t("landing.about.benefit4.title")}</h4><p>{t("landing.about.benefit4.desc")}</p></div></div>
                </div>
                <a href="/dashboard" className="btn btn-primary" style={{ marginTop: 32 }} onClick={goToDashboard}>{t("landing.about.cta")}</a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FROM EGG TO HARVEST ============ */}
        <section className="section" id="workflow">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.workflow.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.workflow.title")}</h2>
              <p>{t("landing.workflow.subtitle")}</p>
            </div>
            <div className="workflow reveal">
              {[
                { n: "01", icon: <Egg className="ic" size={24} strokeWidth={1.7} />, key: "step1" },
                { n: "02", icon: <Clock className="ic" size={24} strokeWidth={1.7} />, key: "step2" },
                { n: "03", icon: <Sprout className="ic" size={24} strokeWidth={1.7} />, key: "step3" },
                { n: "04", icon: <TrendingUp className="ic" size={24} strokeWidth={1.7} />, key: "step4" },
                { n: "05", icon: <ShoppingBasket className="ic" size={24} strokeWidth={1.7} />, key: "step5" },
                { n: "06", icon: <FileText className="ic" size={24} strokeWidth={1.7} />, key: "step6" },
              ].map((s) => (
                <div className="wf-step" key={s.n}>
                  <div className="wf-line"></div>
                  <div className="node">
                    <span className="num">{s.n}</span>
                    <HexIcon size={70}>{s.icon}</HexIcon>
                  </div>
                  <h4>{t(`landing.workflow.${s.key}.title`)}</h4>
                  <p>{t(`landing.workflow.${s.key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SMART FARM MONITORING ============ */}
        <section className="section alt" id="features">
          <div className="container">
            <div className="split">
              <div className="split-visual reveal">
                <div className="mock-card">
                  <div className="mh"><h4>{t("landing.monitoring.mockTitle")}</h4><span className="eyebrow" style={{ padding: "4px 10px", fontSize: ".6rem" }}>{t("landing.monitoring.mockLive")}</span></div>
                  <div className="bar-chart">
                    <div className="bar" style={{ height: "58%" }}><span>Mon</span></div>
                    <div className="bar" style={{ height: "70%" }}><span>Tue</span></div>
                    <div className="bar" style={{ height: "48%" }}><span>Wed</span></div>
                    <div className="bar" style={{ height: "82%" }}><span>Thu</span></div>
                    <div className="bar" style={{ height: "64%" }}><span>Fri</span></div>
                    <div className="bar" style={{ height: "90%" }}><span>Sat</span></div>
                  </div>
                </div>
              </div>
              <div className="split-content reveal d2">
                <span className="eyebrow">{t("landing.monitoring.eyebrow")}</span>
                <h2 style={{ marginTop: 16 }}>{t("landing.monitoring.title")}</h2>
                <p style={{ marginTop: 12 }}>{t("landing.monitoring.desc")}</p>
                <ul className="checklist">
                  {["check1", "check2", "check3", "check4", "check5", "check6"].map((key) => (
                    <li key={key}><HexIcon size={34}><Check className="ic" size={15} strokeWidth={2.2} /></HexIcon>{t(`landing.monitoring.${key}`)}</li>
                  ))}
                </ul>
                <a href="/dashboard" className="btn btn-primary" style={{ marginTop: 30 }} onClick={goToDashboard}>{t("landing.monitoring.cta")}</a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRODUCTION INSIGHTS ============ */}
        <section className="section">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.insights.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.insights.title")}</h2>
              <p>{t("landing.insights.desc")}</p>
            </div>
            <div className="insight-cards">
              <div className="insight-card reveal d1">
                <div className="top"><HexIcon size={44}><TrendingUp className="ic" size={18} strokeWidth={1.7} /></HexIcon><span className="trend">+12.5%</span></div>
                <div className="big">750 kg</div>
                <div className="cap">{t("landing.insights.card1.caption")}</div>
              </div>
              <div className="insight-card reveal d2">
                <div className="top"><HexIcon size={44}><Clock className="ic" size={18} strokeWidth={1.7} /></HexIcon></div>
                <div className="big">{t("landing.insights.card2.value")}</div>
                <div className="cap">{t("landing.insights.card2.caption")}</div>
              </div>
              <div className="insight-card reveal d3">
                <div className="top"><HexIcon size={44}><Target className="ic" size={18} strokeWidth={1.7} /></HexIcon></div>
                <div className="big">94%</div>
                <div className="cap">{t("landing.insights.card3.caption")}</div>
              </div>
            </div>

            <div className="mock-card reveal">
              <div className="mh">
                <h4>{t("landing.insights.chartTitle")}</h4>
                <div className="filters">
                  {["weekly", "monthly", "yearly"].map((r) => (
                    <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
                      {t(`landing.insights.${r}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bar-chart">
                {activeData.values.map((v, i) => (
                  <div className="bar" key={i} style={{ height: `${v}%` }}><span>{activeData.labels[i]}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ AUTOMATED REMINDER SYSTEM ============ */}
        <section className="section alt">
          <div className="container">
            <div className="split rev">
              <div className="split-visual phone-wrap reveal">
                <div className="phone">
                  <div className="pscreen">
                    <div className="ptime">09:24</div>
                    <div className="notif"><HexIcon size={38}><Droplets className="ic" size={16} strokeWidth={1.7} /></HexIcon><div><div className="nt">{t("landing.reminder.notif1.title")}</div><div className="nb">{t("landing.reminder.notif1.body")}</div></div></div>
                    <div className="notif"><HexIcon size={38}><ShoppingBasket className="ic" size={16} strokeWidth={1.7} /></HexIcon><div><div className="nt">{t("landing.reminder.notif2.title")}</div><div className="nb">{t("landing.reminder.notif2.body")}</div></div></div>
                    <div className="notif"><HexIcon size={38}><Egg className="ic" size={16} strokeWidth={1.7} /></HexIcon><div><div className="nt">{t("landing.reminder.notif3.title")}</div><div className="nb">{t("landing.reminder.notif3.body")}</div></div></div>
                    <div className="notif"><HexIcon size={38}><Settings className="ic" size={16} strokeWidth={1.7} /></HexIcon><div><div className="nt">{t("landing.reminder.notif4.title")}</div><div className="nb">{t("landing.reminder.notif4.body")}</div></div></div>
                  </div>
                </div>
              </div>
              <div className="split-content reveal d2">
                <span className="eyebrow">{t("landing.reminder.eyebrow")}</span>
                <h2 style={{ marginTop: 16 }}>{t("landing.reminder.title")}</h2>
                <p style={{ marginTop: 12 }}>{t("landing.reminder.desc")}</p>
                <a href="/dashboard" className="btn btn-primary" style={{ marginTop: 30 }} onClick={goToDashboard}>{t("landing.reminder.cta")}</a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ REPORTING & DATA HISTORY ============ */}
        <section className="section" id="reporting">
          <div className="container">
            <div className="split">
              <div className="split-visual reveal">
                <div className="report-mock">
                  {[
                    { key: "report1", d: "25 Aug 2026", tag: "PDF" },
                    { key: "report2", d: "Week 34, 2026", tag: "Excel" },
                    { key: "report3", d: "August 2026", tag: "PDF" },
                    { key: "report4", d: "Last 6 months", tag: "CSV" },
                    { key: "report5", d: "BSF-001 → BSF-024", tag: "Excel" },
                    { key: "report6", d: "Year to date", tag: "PDF" },
                  ].map((r) => (
                    <div className="rrow" key={r.key}>
                      <div><div className="rname">{t(`landing.reporting.${r.key}`)}</div><div className="rdate">{r.d}</div></div>
                      <span className="rtag">{r.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="split-content reveal d2">
                <span className="eyebrow">{t("landing.reporting.eyebrow")}</span>
                <h2 style={{ marginTop: 16 }}>{t("landing.reporting.title")}</h2>
                <p style={{ marginTop: 12 }}>{t("landing.reporting.desc")}</p>
                <ul className="report-features">
                  {["report1", "report2", "report3", "report4", "report5", "report6"].map((key) => (
                    <li key={key}>{t(`landing.reporting.${key}`)}</li>
                  ))}
                </ul>
                <div className="report-ctas">
                  <a href="/dashboard/reports" className="btn btn-primary" onClick={(e) => { e.preventDefault(); navigate("/dashboard/reports"); }}>{t("landing.reporting.viewReports")}</a>
                  <a href="#" className="btn btn-outline">{t("landing.reporting.downloadReport")}</a>
                </div>
                <div className="formats">PDF &nbsp;•&nbsp; EXCEL &nbsp;•&nbsp; CSV</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ WHY BSFDM ============ */}
        <section className="section alt">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.why.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.why.title")}</h2>
            </div>
            <div className="grid-4">
              {[
                { icon: <TrendingUp className="ic" size={24} strokeWidth={1.7} />, key: "card1" },
                { icon: <ShieldCheck className="ic" size={24} strokeWidth={1.7} />, key: "card2" },
                { icon: <Target className="ic" size={24} strokeWidth={1.7} />, key: "card3" },
                { icon: <Sprout className="ic" size={24} strokeWidth={1.7} />, key: "card4" },
              ].map((c) => (
                <div className="why-card reveal" key={c.key}>
                  <HexIcon>{c.icon}</HexIcon>
                  <h4>{t(`landing.why.${c.key}.title`)}</h4>
                  <p>{t(`landing.why.${c.key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ BUILT FOR MODERN BSF OPERATIONS ============ */}
        <section className="section">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.builtFor.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.builtFor.title")}</h2>
              <p>{t("landing.builtFor.desc")}</p>
            </div>
            <div className="grid-4">
              {[
                { icon: <Sprout className="ic" size={24} strokeWidth={1.7} />, key: "card1" },
                { icon: <Building2 className="ic" size={24} strokeWidth={1.7} />, key: "card2" },
                { icon: <Recycle className="ic" size={24} strokeWidth={1.7} />, key: "card3" },
                { icon: <Share2 className="ic" size={24} strokeWidth={1.7} />, key: "card4" },
              ].map((c) => (
                <div className="why-card reveal" key={c.key}>
                  <HexIcon>{c.icon}</HexIcon>
                  <h4>{t(`landing.builtFor.${c.key}.title`)}</h4>
                  <p>{t(`landing.builtFor.${c.key}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="section" id="cta" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="cta-section reveal">
              <svg className="cta-hex-bg" viewBox="0 0 1200 500" fill="none">
                <polygon points="120,20 190,60 190,140 120,180 50,140 50,60" fill="#fff" />
                <polygon points="1050,300 1120,340 1120,420 1050,460 980,420 980,340" fill="#fff" />
                <polygon points="950,40 1000,68 1000,124 950,152 900,124 900,68" fill="#fff" />
              </svg>
              <h2>{t("landing.cta.title")}</h2>
              <p>{t("landing.cta.desc")}</p>
              <div className="cta-btns">
                <a href="/register" className="btn btn-primary" onClick={goToRegister}>{t("landing.cta.getStarted")}</a>
                <a href="#" className="btn btn-ghost-dark" onClick={openDemoModal}>{t("landing.cta.requestDemo")}</a>
              </div>
              <div className="cta-note">{t("landing.cta.note")}</div>
            </div>
          </div>
        </section>

        {/* ============ COMMUNITY MAP ============ */}
        <section className="section alt" id="community">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">{t("landing.community.eyebrow")}</span>
              <h2 style={{ marginTop: 16 }}>{t("landing.community.title")}</h2>
              <p>{t("landing.community.desc")}</p>
            </div>

            <div className="community-split reveal">
              <div className="community-map-wrap">
                <CommunityMap counts={communityCounts} selected={communityProvince} onSelect={setCommunityProvince} />
                <div className="cm-legend"><span className="swatch" /> {t("landing.community.legendLowHigh")}</div>
              </div>

              <div className="community-list-wrap">
                <div className="community-search">
                  <Search size={16} />
                  <input
                    placeholder={t("landing.community.searchPlaceholder")}
                    value={communityQuery}
                    onChange={(e) => setCommunityQuery(e.target.value)}
                  />
                </div>

                {communityProvince && (
                  <button className="community-chip" onClick={() => setCommunityProvince(null)}>
                    <MapPin size={13} /> {communityProvince} <X size={13} />
                  </button>
                )}

                <div className="community-count">
                  <Users size={14} /> {t("landing.community.resultsCount", { n: filteredCommunity.length })}
                </div>

                <div className="community-list">
                  {filteredCommunity.length === 0 ? (
                    <p style={{ padding: "18px 4px" }}>{t("landing.community.noResults")}</p>
                  ) : (
                    filteredCommunity.slice(0, 30).map((r) => (
                      <div className="community-row" key={r.id}>
                        <div className="cr-name">{r.name}</div>
                        <div className="cr-loc"><MapPin size={12} /> {[r.address, r.kabupaten, r.provinsi].filter(Boolean).join(", ")}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer id="contact">
          <div className="container">
            <div className="foot-grid">
              <div>
                <div className="foot-logo">
                  <img src={logoFooterWhite} alt="BSFDM" className="foot-logo-img" />
                </div>
                <p>{t("landing.footer.tagline")}</p>
                <div className="foot-social">
                  <a href="#" aria-label="Instagram"><Instagram size={16} color="#fff" /></a>
                  <a href="#" aria-label="LinkedIn"><Linkedin size={16} color="#fff" /></a>
                  <a href="#" aria-label="YouTube"><Youtube size={16} color="#fff" /></a>
                </div>
              </div>
              <div>
                <h5>{t("landing.footer.product")}</h5>
                <ul>
                  <li><a href="#about">{t("landing.footer.dashboard")}</a></li>
                  <li><a href="#service">{t("landing.footer.productionManagement")}</a></li>
                  <li><a href="#workflow">{t("landing.footer.harvestManagement")}</a></li>
                  <li><a href="#reporting">{t("landing.footer.reporting")}</a></li>
                  <li><a href="#features">{t("landing.footer.reminderSystem")}</a></li>
                </ul>
              </div>
              <div>
                <h5>{t("landing.footer.company")}</h5>
                <ul>
                  <li><a href="#about">{t("landing.footer.about")}</a></li>
                  <li><a href="#contact">{t("landing.footer.contact")}</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setPrivacyOpen(true); }}>{t("landing.footer.privacyPolicy")}</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}>{t("landing.footer.termsConditions")}</a></li>
                </ul>
              </div>
              <div>
                <h5>{t("landing.footer.contactHeading")}</h5>
                <ul>
                  <li>{t("landing.footer.email")}<br />
                    <a href="mailto:halo@bsfdm.id">halo@bsfdm.id</a>
                  </li>
                  <li>{t("landing.footer.website")}<br />
                    <a href="#">www.bsfdm.id</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="foot-bottom">
              <span>{t("landing.footer.copyright")}</span>
              <span>{t("landing.footer.poweredBy")}</span>
            </div>
          </div>
        </footer>

        {privacyOpen && (
          <div className="pp-overlay" onMouseDown={(e) => e.target === e.currentTarget && setPrivacyOpen(false)}>
            <div className="pp-modal">
              <div className="pp-head">
                <div>
                  <h3>{policy.title}</h3>
                  <span className="pp-updated">{policy.lastUpdatedLabel}: {policy.lastUpdated}</span>
                </div>
                <button aria-label="Close" onClick={() => setPrivacyOpen(false)}><X size={20} /></button>
              </div>
              <div className="pp-body">
                {policy.intro.map((text, i) => <p key={i}>{text}</p>)}
                {policy.sections.map((s) => (
                  <div key={s.number} className={s.sub ? "pp-subsection" : "pp-section"}>
                    <h4>{s.number}. {s.title}</h4>
                    {s.blocks.map(renderPolicyBlock)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {termsOpen && (
          <div className="pp-overlay" onMouseDown={(e) => e.target === e.currentTarget && setTermsOpen(false)}>
            <div className="pp-modal">
              <div className="pp-head">
                <div>
                  <h3>{terms.title}</h3>
                  <span className="pp-updated">{terms.lastUpdatedLabel}: {terms.lastUpdated}</span>
                </div>
                <button aria-label="Close" onClick={() => setTermsOpen(false)}><X size={20} /></button>
              </div>
              <div className="pp-body">
                {terms.intro.map((text, i) => <p key={i}>{text}</p>)}
                {terms.sections.map((s) => (
                  <div key={s.number} className={s.sub ? "pp-subsection" : "pp-section"}>
                    <h4>{s.number}. {s.title}</h4>
                    {s.blocks.map(renderPolicyBlock)}
                  </div>
                ))}
                {terms.closing.map((text, i) => <p key={i} style={{ fontWeight: 700, marginTop: 24 }}>{text}</p>)}
              </div>
            </div>
          </div>
        )}

        {demoOpen && (
          <div className="pp-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeDemoModal()}>
            <div className="demo-modal">
              <button className="demo-close" aria-label="Close" onClick={closeDemoModal}><X size={20} /></button>
              {demoSubmitted ? (
                <div className="demo-success">
                  <div className="demo-success-ic"><CheckCircle2 size={30} /></div>
                  <h3>{t("landing.demo.successTitle")}</h3>
                  <p>{t("landing.demo.successMessage")}</p>
                  <button type="button" className="btn btn-primary" onClick={closeDemoModal}>{t("landing.demo.done")}</button>
                </div>
              ) : (
                <>
                  <h3>{t("landing.demo.title")}</h3>
                  <p className="demo-subtitle">{t("landing.demo.subtitle")}</p>
                  <form onSubmit={handleDemoSubmit}>
                    <div className={`demo-field ${demoErrors.phone ? "has-err" : ""}`}>
                      <label>{t("landing.demo.phone")}</label>
                      <div className="demo-input-wrap">
                        <Phone size={16} />
                        <input
                          type="tel"
                          placeholder={t("landing.demo.phonePlaceholder")}
                          value={demoForm.phone}
                          onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                        />
                      </div>
                      {demoErrors.phone && <div className="demo-err">{demoErrors.phone}</div>}
                    </div>
                    <div className={`demo-field ${demoErrors.email ? "has-err" : ""}`}>
                      <label>{t("landing.demo.email")}</label>
                      <div className="demo-input-wrap">
                        <Mail size={16} />
                        <input
                          type="email"
                          placeholder={t("landing.demo.emailPlaceholder")}
                          value={demoForm.email}
                          onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                        />
                      </div>
                      {demoErrors.email && <div className="demo-err">{demoErrors.email}</div>}
                    </div>
                    {demoFailed && <div className="demo-fail">{t("landing.demo.failed")}</div>}
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={demoSubmitting}>
                      {demoSubmitting ? <><Loader2 size={16} className="demo-spin" /> {t("landing.demo.submitting")}</> : t("landing.demo.submit")}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
