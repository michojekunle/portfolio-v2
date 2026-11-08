import { useEffect, useState } from "react";

const STORAGE_KEY = "carousel_lab_logo_image";

function loadImage(dataUrl: string, onLoad: (img: HTMLImageElement) => void): void {
  const img = new window.Image();
  img.onload = () => onLoad(img);
  img.src = dataUrl;
}

/**
 * Uploaded logo state: a data URL for the <img> preview, plus a preloaded
 * HTMLImageElement the canvas exporter can drawImage() directly. Persists to
 * localStorage so the logo survives a reload, same as the color overrides.
 */
export function useLogoUpload(): {
  logoImage: string | null;
  logoImageEl: HTMLImageElement | null;
  upload: (file: File) => void;
  remove: () => void;
} {
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoImageEl, setLogoImageEl] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLogoImage(saved);
        loadImage(saved, setLogoImageEl);
      }
    } catch {}
  }, []);

  const upload = (file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoImage(dataUrl);
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch {}
      loadImage(dataUrl, setLogoImageEl);
    };
    reader.readAsDataURL(file);
  };

  const remove = (): void => {
    setLogoImage(null);
    setLogoImageEl(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return { logoImage, logoImageEl, upload, remove };
}
