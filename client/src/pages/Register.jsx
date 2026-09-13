import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Mail, Lock, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ companyName: companyName.trim(), name: name.trim(), email: email.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || t("register.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="authpage">
      <style>{`
        .authpage *{box-sizing:border-box;}
        .authpage{font-family:'Inter', sans-serif; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#F6F8F4; padding:24px;}
        .authpage h1,.authpage h2{font-family:'Manrope', sans-serif; font-weight:800; letter-spacing:-0.01em; margin:0;}
        .authpage a{color:inherit; text-decoration:none;}
        .authpage button{font:inherit; cursor:pointer;}

        .authpage .card{width:100%; max-width:440px; background:#fff; border:1px solid #E1E8DF; border-radius:20px; padding:40px 36px; box-shadow:0 14px 34px rgba(14,32,23,.08);}
        .authpage .back-link{display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.86rem; color:#4C6157;}
        .authpage .back-link:hover{color:#01613C;}
        .authpage .card h1{font-size:1.5rem; color:#0F241A;}
        .authpage .card .sub{margin-top:8px; color:#7C9086; font-size:.92rem; line-height:1.6;}

        .authpage .field{margin-top:18px;}
        .authpage .field label{display:block; font-size:.82rem; font-weight:700; color:#0F241A; margin-bottom:8px;}
        .authpage .field .input-wrap{position:relative; display:flex; align-items:center;}
        .authpage .field .input-wrap .ic-left{position:absolute; left:14px; color:#7C9086;}
        .authpage .field input{width:100%; padding:13px 14px 13px 42px; border:1.5px solid #E1E8DF; border-radius:12px; font-size:.94rem; color:#0F241A; background:#fff; transition:border-color .2s ease;}
        .authpage .field input:focus{outline:none; border-color:#01613C;}
        .authpage .field .toggle-eye{position:absolute; right:12px; background:none; border:none; color:#7C9086; display:flex; padding:4px;}
        .authpage .field .toggle-eye:hover{color:#01613C;}
        .authpage .field .hint{margin-top:6px; font-size:.78rem; color:#7C9086;}

        .authpage .error-box{margin-top:18px; background:#FDECE3; border:1px solid #E36B14; color:#B3540F; font-size:.84rem; font-weight:600; padding:11px 14px; border-radius:10px;}

        .authpage .submit{margin-top:24px; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#01613C; color:#fff; font-family:'Manrope', sans-serif; font-weight:700; font-size:.9rem; letter-spacing:.02em; text-transform:uppercase; padding:14px; border:none; border-radius:12px; transition:transform .2s ease, box-shadow .2s ease;}
        .authpage .submit:hover{transform:translateY(-2px); box-shadow:0 14px 34px rgba(1,97,60,.25);}
        .authpage .submit:disabled{opacity:.7; transform:none;}

        .authpage .switch-line{margin-top:20px; text-align:center; font-size:.86rem; color:#4C6157;}
        .authpage .switch-line a{font-weight:700; color:#01613C;}
        .authpage .switch-line a:hover{text-decoration:underline;}

        .authpage .free-badge{display:inline-flex; align-items:center; gap:6px; font-family:'Manrope', sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.06em; text-transform:uppercase; background:#E1F3E7; color:#01613C; padding:6px 12px; border-radius:99px; margin-bottom:14px;}
      `}</style>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <a href="/login" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
            <ArrowLeft size={16} /> {t("register.backToLogin")}
          </a>
          <LanguageToggle />
        </div>

        <span className="free-badge">{t("register.freeBadge")}</span>
        <h1>{t("register.title")}</h1>
        <p className="sub">{t("register.subtitle")}</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reg-company">{t("register.companyLabel")}</label>
            <div className="input-wrap">
              <Building2 size={17} className="ic-left" />
              <input
                id="reg-company"
                type="text"
                autoComplete="organization"
                placeholder={t("register.companyPlaceholder")}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-name">{t("register.nameLabel")}</label>
            <div className="input-wrap">
              <User size={17} className="ic-left" />
              <input
                id="reg-name"
                type="text"
                autoComplete="name"
                placeholder={t("register.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-email">{t("login.emailLabel")}</label>
            <div className="input-wrap">
              <Mail size={17} className="ic-left" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-password">{t("login.passwordLabel")}</label>
            <div className="input-wrap">
              <Lock size={17} className="ic-left" />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
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
            <div className="hint">{t("register.passwordHint")}</div>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="submit" disabled={submitting}>
            <UserPlus size={16} /> {submitting ? t("register.creating") : t("register.createAccount")}
          </button>
        </form>

        <div className="switch-line">
          {t("register.haveAccount")}{" "}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>{t("login.logIn")}</a>
        </div>
      </div>
    </div>
  );
}
