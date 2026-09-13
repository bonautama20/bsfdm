import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { useAuth, DEMO_ACCOUNT, DEMO_OPERATOR_ACCOUNT } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef(null);
  const formRef = useRef(null);

  // Entrance animation + a slow, subtle float on the decorative hex shapes.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power2.out", duration: 0.55 } })
        .from(".brand-top", { opacity: 0, y: -10 })
        .from(".brand-mid .eyebrow", { opacity: 0, y: 10 }, "-=0.35")
        .from(".brand-mid h2", { opacity: 0, y: 14 }, "-=0.4")
        .from(".brand-mid p", { opacity: 0, y: 14 }, "-=0.4")
        .from(".brand-stats > div", { opacity: 0, y: 14, stagger: 0.08 }, "-=0.35")
        .from(".back-link", { opacity: 0, x: -10 }, 0.15)
        .from(".card h1", { opacity: 0, y: 14 }, "-=0.3")
        .from(".card .sub", { opacity: 0, y: 14 }, "-=0.4")
        .from(".field", { opacity: 0, y: 14, stagger: 0.08 }, "-=0.3")
        .from(".row-between", { opacity: 0, y: 10 }, "-=0.25")
        .from(".submit", { opacity: 0, y: 10, scale: 0.97 }, "-=0.2")
        .from(".demo-box", { opacity: 0, y: 14 }, "-=0.15");

      gsap.utils.toArray(".brand-hex polygon").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? 14 : -14,
          duration: 5 + i,
          delay: i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Gentle shake + fade-in on a failed login attempt.
  useEffect(() => {
    if (!error || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".error-box", { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      if (formRef.current) {
        gsap.timeline({ defaults: { duration: 0.06, ease: "power1.inOut" } })
          .to(formRef.current, { x: -8 })
          .to(formRef.current, { x: 8 })
          .to(formRef.current, { x: -5 })
          .to(formRef.current, { x: 5 })
          .to(formRef.current, { x: 0, duration: 0.08 });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [error]);

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const nextSession = await login(email.trim(), password);
      navigate(nextSession.role.id === "role-operator" ? "/operator" : "/dashboard");
    } catch (err) {
      setError(err.message || t("login.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login" ref={rootRef}>
      <style>{`
        .login *{box-sizing:border-box;}
        .login{font-family:'Inter', sans-serif; min-height:100vh; display:grid; grid-template-columns:1fr 1fr; background:#F6F8F4;}
        .login h1,.login h2,.login h3{font-family:'Manrope', sans-serif; font-weight:800; letter-spacing:-0.01em; margin:0;}
        .login a{color:inherit; text-decoration:none;}
        .login button{font:inherit; cursor:pointer;}

        .login .brand{background:#01613C; color:#fff; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; padding:48px;}
        .login .brand-hex{position:absolute; inset:0; opacity:.12; pointer-events:none;}
        .login .brand-top{display:flex; align-items:center; gap:10px; font-family:'Manrope', sans-serif; font-weight:800; font-size:1.2rem; position:relative; z-index:1;}
        .login .brand-mark{width:34px; height:34px; flex-shrink:0;}
        .login .brand-mid{position:relative; z-index:1; max-width:420px;}
        .login .brand-mid .eyebrow{display:inline-flex; align-items:center; gap:8px; font-family:'Manrope', sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; background:rgba(255,255,255,.14); padding:7px 14px; border-radius:99px;}
        .login .brand-mid h2{margin-top:18px; font-size:clamp(1.6rem,2.6vw,2.1rem); line-height:1.2;}
        .login .brand-mid p{margin-top:14px; color:rgba(255,255,255,.78); line-height:1.7; font-size:.98rem;}
        .login .brand-stats{position:relative; z-index:1; display:flex; gap:32px;}
        .login .brand-stats div .v{font-family:'Manrope', sans-serif; font-weight:800; font-size:1.4rem;}
        .login .brand-stats div .l{font-size:.72rem; color:rgba(255,255,255,.65); margin-top:2px; text-transform:uppercase; letter-spacing:.04em;}

        .login .panel{display:flex; align-items:center; justify-content:center; padding:48px 32px;}
        .login .card{width:100%; max-width:400px;}
        .login .back-link{display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.86rem; color:#4C6157; margin-bottom:28px;}
        .login .back-link:hover{color:#01613C;}
        .login .card h1{font-size:1.7rem; color:#0F241A;}
        .login .card .sub{margin-top:8px; color:#7C9086; font-size:.92rem;}

        .login .field{margin-top:20px;}
        .login .field label{display:block; font-size:.82rem; font-weight:700; color:#0F241A; margin-bottom:8px;}
        .login .field .input-wrap{position:relative; display:flex; align-items:center;}
        .login .field .input-wrap .ic-left{position:absolute; left:14px; color:#7C9086;}
        .login .field input{width:100%; padding:13px 14px 13px 42px; border:1.5px solid #E1E8DF; border-radius:12px; font-size:.94rem; color:#0F241A; background:#fff; transition:border-color .2s ease;}
        .login .field input:focus{outline:none; border-color:#01613C;}
        .login .field .toggle-eye{position:absolute; right:12px; background:none; border:none; color:#7C9086; display:flex; padding:4px;}
        .login .field .toggle-eye:hover{color:#01613C;}

        .login .row-between{display:flex; align-items:center; justify-content:space-between; margin-top:18px; font-size:.84rem;}
        .login .remember{display:flex; align-items:center; gap:8px; color:#4C6157; font-weight:600;}
        .login .forgot{font-weight:700; color:#01613C;}
        .login .forgot:hover{text-decoration:underline;}

        .login .error-box{margin-top:18px; background:#FDECE3; border:1px solid #E36B14; color:#B3540F; font-size:.84rem; font-weight:600; padding:11px 14px; border-radius:10px;}

        .login .submit{margin-top:24px; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#01613C; color:#fff; font-family:'Manrope', sans-serif; font-weight:700; font-size:.9rem; letter-spacing:.02em; text-transform:uppercase; padding:14px; border:none; border-radius:12px; transition:transform .2s ease, box-shadow .2s ease;}
        .login .submit:hover{transform:translateY(-2px); box-shadow:0 14px 34px rgba(1,97,60,.25);}

        .login .demo-box{margin-top:26px; border:1.5px dashed #E36B14; background:#FFF6EF; border-radius:12px; padding:14px 16px;}
        .login .demo-box .dt{font-size:.76rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#E36B14; margin-bottom:8px;}
        .login .demo-box .dl{font-size:.86rem; color:#0F241A; line-height:1.7;}
        .login .demo-box .dl b{font-weight:700;}
        .login .demo-box .fill-btn{font-size:.8rem; font-weight:700; color:#E36B14; background:none; border:1.5px solid #E36B14; padding:7px 14px; border-radius:99px;}
        .login .demo-box .fill-btn:hover{background:#E36B14; color:#fff;}

        @media (max-width:900px){
          .login{grid-template-columns:1fr;}
          .login .brand{display:none;}
          .login .panel{padding:32px 22px;}
        }
      `}</style>

      <div className="brand">
        <svg className="brand-hex" viewBox="0 0 500 500" fill="none">
          <polygon points="90,20 150,55 150,125 90,160 30,125 30,55" fill="#fff" />
          <polygon points="420,340 480,375 480,445 420,480 360,445 360,375" fill="#fff" />
          <polygon points="380,40 420,63 420,109 380,132 340,109 340,63" fill="#fff" />
        </svg>
        <a href="/" className="brand-top" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <svg className="brand-mark" viewBox="0 0 40 40" fill="none">
            <polygon points="20,3 34.6,11.5 34.6,28.5 20,37 5.4,28.5 5.4,11.5" fill="#fff" />
          </svg>
          BSFDM
        </a>
        <div className="brand-mid">
          <span className="eyebrow">{t("login.eyebrow")}</span>
          <h2>{t("login.brandTitle")}</h2>
          <p>{t("login.brandDesc")}</p>
        </div>
        <div className="brand-stats">
          <div><div className="v">24</div><div className="l">{t("login.statActiveBatch")}</div></div>
          <div><div className="v">8</div><div className="l">{t("login.statHarvestReady")}</div></div>
          <div><div className="v">94%</div><div className="l">{t("login.statSuccessRate")}</div></div>
        </div>
      </div>

      <div className="panel">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <a href="/" className="back-link" style={{ marginBottom: 0 }} onClick={(e) => { e.preventDefault(); navigate("/"); }}>
              <ArrowLeft size={16} /> {t("login.backToHome")}
            </a>
            <LanguageToggle />
          </div>

          <h1>{t("login.welcomeBack")}</h1>
          <p className="sub">{t("login.subtitle")}</p>

          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="field">
              <label htmlFor="login-email">{t("login.emailLabel")}</label>
              <div className="input-wrap">
                <Mail size={17} className="ic-left" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@bsfdm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="login-password">{t("login.passwordLabel")}</label>
              <div className="input-wrap">
                <Lock size={17} className="ic-left" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-eye"
                  aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="remember">
                <input type="checkbox" /> {t("login.rememberMe")}
              </label>
              <a href="/forgot-password" className="forgot" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}>{t("login.forgotPassword")}</a>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="submit" disabled={submitting}>
              <LogIn size={16} /> {submitting ? t("login.loggingIn") : t("login.logIn")}
            </button>
          </form>

          <div className="demo-box">
            <div className="dt">{t("login.demoAccounts")}</div>
            <div className="dl">
              <b>Admin</b> — {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}<br />
              <b>Operator</b> — {DEMO_OPERATOR_ACCOUNT.email} / {DEMO_OPERATOR_ACCOUNT.password}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button type="button" className="fill-btn" onClick={() => fillDemo(DEMO_ACCOUNT)}>{t("login.fillAdmin")}</button>
              <button type="button" className="fill-btn" onClick={() => fillDemo(DEMO_OPERATOR_ACCOUNT)}>{t("login.fillOperator")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
