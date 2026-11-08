import { Upload, X } from "lucide-react";
import { MoSignatureInline, AmdSignatureInline } from "@/lib/brand-mark";
import type { LogoMark } from "../lib/types";

interface Props {
  accent: string;
  showBranding: boolean;
  onShowBrandingChange: (value: boolean) => void;
  logoImage: string | null;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
  logoText: string;
  onLogoTextChange: (value: string) => void;
  logoMark: LogoMark;
  onLogoMarkChange: (value: LogoMark) => void;
  creatorName: string;
  onCreatorNameChange: (value: string) => void;
  topRightTag: string;
  onTopRightTagChange: (value: string) => void;
  creatorHandle: string;
  onCreatorHandleChange: (value: string) => void;
}

const fieldLabel = "block font-mono text-[8px] tracking-widest uppercase mb-1.5 text-muted-foreground";
const fieldInput = "w-full h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] outline-none";

export function BrandingPanel({
  accent,
  showBranding,
  onShowBrandingChange,
  logoImage,
  onLogoUpload,
  onLogoRemove,
  logoText,
  onLogoTextChange,
  logoMark,
  onLogoMarkChange,
  creatorName,
  onCreatorNameChange,
  topRightTag,
  onTopRightTagChange,
  creatorHandle,
  onCreatorHandleChange,
}: Props): React.ReactElement {
  return (
    <div className="rounded-2xl p-6 border border-(--rule) bg-(--bg-2) space-y-4">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground border-b pb-2.5 border-(--rule)">
        Creator Branding & Logo
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-secondary-foreground">Show Profile Branding</span>
        <input
          type="checkbox"
          checked={showBranding}
          onChange={(e) => onShowBrandingChange(e.target.checked)}
          className="w-9 h-5 rounded-full appearance-none cursor-pointer relative bg-(--bg) border border-(--rule) checked:bg-(--accent) transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3.5 after:h-3.5 after:rounded-full after:bg-muted-foreground checked:after:translate-x-4 after:transition-transform"
          style={{ "--accent": accent } as React.CSSProperties}
        />
      </div>
      {showBranding && (
        <div className="space-y-3">
          <div>
            <label className={fieldLabel}>Logo Image</label>
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border border-(--rule)"
                style={{ background: accent + "20", color: accent }}
              >
                {logoImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoImage} alt="" className="w-full h-full object-cover" />
                ) : logoMark === "mo" ? (
                  <MoSignatureInline height={18} color={accent} />
                ) : logoMark === "amd" ? (
                  <AmdSignatureInline height={18} color={accent} accent={accent} />
                ) : (
                  (logoText.trim()[0] || creatorName.trim()[0] || "M").toUpperCase()
                )}
              </div>
              <label className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[11px] font-medium cursor-pointer hover:border-(--accent) transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onLogoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {logoImage && (
                <button
                  type="button"
                  onClick={onLogoRemove}
                  className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-(--rule) text-muted-foreground hover:text-foreground hover:border-(--accent) transition-colors"
                  aria-label="Remove logo image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {logoImage ? "Used in the badge instead of the mark below." : "No image set — badge shows the mark below."}
            </p>
          </div>
          <div>
            <label className={fieldLabel}>Badge Mark</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { value: "mo" as const, label: "MO" },
                  { value: "amd" as const, label: "AMD" },
                  { value: "initial" as const, label: "Initial" },
                ]
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onLogoMarkChange(opt.value)}
                  disabled={!!logoImage}
                  className="h-9 rounded-lg border text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    logoMark === opt.value
                      ? { borderColor: accent, color: accent, background: accent + "14" }
                      : { borderColor: "var(--rule)", color: "var(--muted-foreground)" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {logoImage ? "Remove the uploaded image to switch marks." : "MO is the forward brand mark; AMD is the signature mark."}
            </p>
          </div>
          <div>
            <label className={fieldLabel}>Brand Logo Text</label>
            <input type="text" value={logoText} onChange={(e) => onLogoTextChange(e.target.value)} className={fieldInput} />
          </div>
          <div>
            <label className={fieldLabel}>Top Right Header Tag</label>
            <input type="text" value={topRightTag} onChange={(e) => onTopRightTagChange(e.target.value)} className={fieldInput} />
          </div>
          <div>
            <label className={fieldLabel}>Bottom Left Creator Name</label>
            <input type="text" value={creatorName} onChange={(e) => onCreatorNameChange(e.target.value)} className={fieldInput} />
          </div>
          <div>
            <label className={fieldLabel}>Bottom Right Link / URL</label>
            <input type="text" value={creatorHandle} onChange={(e) => onCreatorHandleChange(e.target.value)} className={fieldInput} />
          </div>
        </div>
      )}
    </div>
  );
}
