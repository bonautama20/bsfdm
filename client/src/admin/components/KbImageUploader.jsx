import React, { useRef, useState } from "react";
import { ImagePlus, X, ChevronLeft, ChevronRight, Loader2, ImageOff } from "lucide-react";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // keep in sync with server/routes/kbArticles.js
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const filenameFromUrl = (url) => url.split("/").pop();

// Image picker for the Knowledge Base article editor — up to MAX_IMAGES
// photos, uploaded immediately on selection (rather than staged until Save)
// so by the time the admin hits Save every entry in `images` is already a
// real, persisted URL. images[0] is the cover shown on the article card and
// at the top of the article page; the first-position badge plus the
// left/right reorder buttons make that explicit rather than implicit.
export default function KbImageUploader({ images, onChange }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [removingUrl, setRemovingUrl] = useState(null);
  const [error, setError] = useState("");

  const remainingSlots = MAX_IMAGES - images.length - uploadingCount;
  const canAddMore = remainingSlots > 0;

  const validateFiles = (files) => {
    if (files.length > remainingSlots) {
      return t("kbAdmin.imageTooMany", { n: MAX_IMAGES });
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return t("kbAdmin.imageBadType", { name: file.name });
      }
      if (file.size > MAX_FILE_BYTES) {
        return t("kbAdmin.imageTooLarge", { name: file.name });
      }
    }
    return "";
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setUploadingCount(files.length);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("images", f));
      const uploaded = await api.upload("/kb-articles/uploads", form);
      onChange([...images, ...uploaded.map((f) => f.url)]);
    } catch (err) {
      setError(err.message || t("kbAdmin.imageUploadFailed"));
    } finally {
      setUploadingCount(0);
    }
  };

  const handleRemove = async (url) => {
    setRemovingUrl(url);
    try {
      await api.delete(`/kb-articles/uploads/${filenameFromUrl(url)}`);
    } catch {
      // Best-effort disk cleanup — even if the file is already gone (or the
      // delete otherwise fails), the admin's clear intent is to detach it
      // from this article, so the UI still proceeds to remove it below.
    } finally {
      setRemovingUrl(null);
      onChange(images.filter((u) => u !== url));
    }
  };

  const moveImage = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="kb-uploader">
      <style>{`
        .kb-uploader-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(118px, 1fr)); gap:12px; margin-top:8px;}
        .kb-uploader-tile{position:relative; aspect-ratio:1; border-radius:12px; overflow:hidden; background:var(--db-canvas); border:1.5px solid var(--db-line);}
        .kb-uploader-tile img{width:100%; height:100%; object-fit:cover; display:block;}
        .kb-uploader-cover-badge{position:absolute; top:6px; left:6px; background:var(--db-primary); color:#fff; font-size:.64rem; font-weight:800; text-transform:uppercase; letter-spacing:.03em; padding:3px 7px; border-radius:99px; z-index:2;}
        .kb-uploader-remove{position:absolute; top:6px; right:6px; width:24px; height:24px; border-radius:99px; background:rgba(15,36,26,.72); color:#fff; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; z-index:2; transition:background .15s ease;}
        .kb-uploader-remove:hover{background:var(--db-danger);}
        .kb-uploader-reorder{position:absolute; bottom:6px; left:6px; right:6px; display:flex; justify-content:space-between; z-index:2;}
        .kb-uploader-reorder button{width:22px; height:22px; border-radius:7px; background:rgba(15,36,26,.72); color:#fff; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer;}
        .kb-uploader-reorder button:disabled{opacity:.3; cursor:not-allowed;}
        .kb-uploader-busy{position:absolute; inset:0; background:rgba(245,247,245,.85); display:flex; align-items:center; justify-content:center;}
        .kb-uploader-busy svg{animation:kb-spin 0.8s linear infinite;}
        @keyframes kb-spin{to{transform:rotate(360deg);}}
        .kb-uploader-add{display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; aspect-ratio:1; border-radius:12px; border:1.5px dashed var(--db-line); background:none; color:var(--db-muted); cursor:pointer; font-size:.72rem; font-weight:700; transition:border-color .15s ease, color .15s ease;}
        .kb-uploader-add:hover{border-color:var(--db-primary); color:var(--db-primary);}
        .kb-uploader-empty{display:flex; align-items:center; gap:8px; color:var(--db-muted); font-size:.82rem; padding:14px 0;}
        .kb-uploader-error{margin-top:8px; font-size:.78rem; color:var(--db-danger); font-weight:600;}
        .kb-uploader-hint{margin-top:8px; font-size:.76rem; color:var(--db-muted);}
      `}</style>

      <div className="kb-uploader-grid">
        {images.length === 0 && uploadingCount === 0 ? null : (
          <>
            {images.map((url, i) => (
              <div className="kb-uploader-tile" key={url}>
                {i === 0 && <span className="kb-uploader-cover-badge">{t("kbAdmin.imageCover")}</span>}
                <img src={url} alt="" />
                <button
                  type="button"
                  className="kb-uploader-remove"
                  onClick={() => handleRemove(url)}
                  disabled={removingUrl === url}
                  aria-label={t("kbAdmin.imageRemove")}
                  title={t("kbAdmin.imageRemove")}
                >
                  {removingUrl === url ? <Loader2 size={13} /> : <X size={13} />}
                </button>
                {images.length > 1 && (
                  <div className="kb-uploader-reorder">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={t("kbAdmin.imageMoveLeft")} title={t("kbAdmin.imageMoveLeft")}>
                      <ChevronLeft size={13} />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} aria-label={t("kbAdmin.imageMoveRight")} title={t("kbAdmin.imageMoveRight")}>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {Array.from({ length: uploadingCount }).map((_, i) => (
              <div className="kb-uploader-tile" key={`uploading-${i}`}>
                <div className="kb-uploader-busy"><Loader2 size={20} color="var(--db-primary)" /></div>
              </div>
            ))}
          </>
        )}

        {canAddMore && (
          <button type="button" className="kb-uploader-add" onClick={() => inputRef.current?.click()}>
            <ImagePlus size={20} />
            {t("kbAdmin.imageAdd")}
          </button>
        )}
      </div>

      {images.length === 0 && uploadingCount === 0 && (
        <div className="kb-uploader-empty"><ImageOff size={16} /> {t("kbAdmin.imageEmpty")}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
      />

      <p className="kb-uploader-hint">{t("kbAdmin.imageHint", { n: MAX_IMAGES })}</p>
      {error && <p className="kb-uploader-error">{error}</p>}
    </div>
  );
}
