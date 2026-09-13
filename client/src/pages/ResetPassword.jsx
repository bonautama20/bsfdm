import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { api } from "../api/client.js";
import { useLanguage } from "../context/LanguageContext.jsx";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError(t("resetPassword.tooShort"));
    if (password !== confirm) return setError(t("resetPassword.mismatch"));
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      setError(err.message || t("resetPassword.error"));
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

        .authpage .card{width:100%; max-width:420px; background:#fff; border:1px solid #E1E8DF; border-radius:20px; padding:40px 36px; box-shadow:0 14px 34px rgba(14,32,23,.08);}
        .authpage .back-link{display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.86rem; color:#4C6157;}
        .authpage .back-link:hover{color:#01613C;}
        .authpage .card h1{font-size:1.5rem; color:#0F241A;}
        .authpage .card .sub{margin-top:8px; color:#7C9086; font-size:.92rem; line-height:1.6;}

        .authpage .field{margin-top:20px;}
        .authpage .field label{display:block; font-size:.82rem; font-weight:700; color:#0F241A; margin-bottom:8px;}
        .authpage .field .input-wrap{position:relative; display:flex; align-items:center;}
        .authpage .field .input-wrap .ic-left{position:absolute; left:14px; color:#7C9086;}
        .authpage .field input{width:100%; padding:13px 42px 13px 42px; border:1.5px solid #E1E8DF; border-radius:12px; font-size:.94rem; color:#0F241A; background:#fff; transition:border-color .2s ease;}
        .authpage .field input:focus{outline:none; border-color:#01613C;}
        .authpage .field .toggle-eye{position:absolute; right:12px; background:none; border:none; color:#7C9086; display:flex; padding:4px;}
        .authpage .field .toggle-eye:hover{color:#01613C;}

        .authpage .error-box{margin-top:18px; background:#FDECE3; border:1px solid #E36B14; color:#B3540F; font-size:.84rem; font-weight:600; padding:11px 14px; border-radius:10px;}

        .authpage .submit{margin-top:24px; width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#01613C; color:#fff; font-family:'Manrope', sans-serif; font-weight:700; font-size:.9rem; letter-spacing:.02em; text-transform:uppercase; padding:14px; border:none; border-radius:12px; transition:transform .2s ease, box-shadow .2s ease;}
        .authpage .submit:hover{transform:translateY(-2px); box-shadow:0 14px 34px rgba(1,97,60,.25);}
        .authpage .submit:disabled{opacity:.7; transform:none;}

        .authpage .success-icon{width:56px; height:56px; border-radius:50%; background:#E1F3E7; color:#01613C; display:flex; align-items:center; justify-content:center; margin-bottom:18px;}
      `}</style>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <a href="/login" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
            <ArrowLeft size={16} /> {t("forgotPassword.backToLogin")}
          </a>
          <LanguageToggle />
        </div>

        {!token ? (
          <>
            <h1>{t("resetPassword.invalidLinkTitle")}</h1>
            <p className="sub">{t("resetPassword.invalidLinkDesc")}</p>
            <button type="button" className="submit" onClick={() => navigate("/forgot-password")}>
              <KeyRound size={16} /> {t("resetPassword.requestNewLink")}
            </button>
          </>
        ) : done ? (
          <>
            <div className="success-icon"><CheckCircle2 size={26} /></div>
            <h1>{t("resetPassword.successTitle")}</h1>
            <p className="sub">{t("resetPassword.successDesc")}</p>
            <button type="button" className="submit" onClick={() => navigate("/login")}>
              {t("resetPassword.goToLogin")}
            </button>
          </>
        ) : (
          <>
            <h1>{t("resetPassword.title")}</h1>
            <p className="sub">{t("resetPassword.subtitle")}</p>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="rp-password">{t("resetPassword.newPassword")}</label>
                <div className="input-wrap">
                  <Lock size={17} className="ic-left" />
                  <input
                    id="rp-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="toggle-eye" aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")} onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor="rp-confirm">{t("resetPassword.confirmPassword")}</label>
                <div className="input-wrap">
                  <Lock size={17} className="ic-left" />
                  <input
                    id="rp-confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <div className="error-box">{error}</div>}
              <button type="submit" className="submit" disabled={submitting}>
                <KeyRound size={16} /> {submitting ? t("opForm.saving") : t("resetPassword.submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
