import re

with open('/Users/mac/prog/blockchain/portfolio-v2/components/bookbreaks/Generator.tsx', 'r') as f:
    content = f.read()

original_content = content

# 1. Fix the empty state emojis and colors
content = content.replace('style={{ background: "#FAF5EC", border: "1.5px dashed #D4B896" }}', 'className="rounded-[12px] p-[48px] text-center bg-[var(--bg-2)] border-[1.5px] border-dashed border-[var(--rule)]"')
# the className was already there, so we merge it
content = content.replace('className="rounded-[12px] p-[48px] text-center"\n        className="rounded-[12px] p-[48px] text-center bg-[var(--bg-2)] border-[1.5px] border-dashed border-[var(--rule)]"', 'className="rounded-[12px] p-[48px] text-center bg-[var(--bg-2)] border-[1.5px] border-dashed border-[var(--rule)]"')

# Wait, simple replace is easier
content = content.replace('className="rounded-[12px] p-[48px] text-center"\n        style={{ background: "#FAF5EC", border: "1.5px dashed #D4B896" }}', 'className="rounded-[12px] p-[48px] text-center bg-[var(--bg-2)] border-[1.5px] border-dashed border-[var(--rule)]"')

content = content.replace('<div className="text-[40px] mb-[16px]">📚</div>', '<div className="mb-[16px] text-[var(--v3-accent)]"><BookOpen size={48} className="mx-auto" /></div>')

content = content.replace('className="font-mono text-[12px] uppercase tracking-[0.1em] mb-[20px]" style={{ color: "#8B6F47" }}', 'className="font-mono text-[12px] uppercase tracking-[0.1em] mb-[20px] text-[var(--ink-3)]"')

content = content.replace('className="inline-flex items-center gap-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline"\n          style={{ color: "#C85A2C" }}', 'className="inline-flex items-center gap-[8px] font-mono text-[12px] uppercase tracking-[0.12em] font-semibold no-underline text-[var(--v3-accent)] hover:opacity-80"')

content = content.replace('Add a book first →', 'Add a book first <ArrowRight size={14} className="ml-1 inline-block" />')

# 2. Fix the layout panel borders and bg
content = content.replace('className="rounded-[16px] overflow-hidden sticky top-[24px] max-[1100px]:static"\n        style={{ border: "1px solid #D4B896", background: "#FAF5EC" }}', 'className="rounded-[16px] overflow-hidden sticky top-[24px] max-[1100px]:static bg-[var(--bg-2)] border border-[var(--rule)]"')
content = content.replace('className="px-[24px] py-[20px]"\n          style={{ borderBottom: "1px solid #D4B896", background: "#EDD9BA" }}', 'className="px-[24px] py-[20px] border-b border-[var(--rule)] bg-[color-mix(in_oklab,var(--bg-2)_95%,var(--ink))] "')

content = content.replace('className="font-mono text-[10px] tracking-[0.14em] uppercase"\n            style={{ color: "#8B6F47" }}', 'className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-3)]"')

# 3. Form Labels text-[10px] -> text-[11px] and color #8B6F47 -> var(--ink-3)
content = content.replace('className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"\n              style={{ color: "#8B6F47" }}', 'className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]"')
content = content.replace('className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[10px]"\n              style={{ color: "#8B6F47" }}', 'className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[10px] text-[var(--ink-3)]"')

# 4. Input fields text-[12px] -> text-[14px] and fix colors
input_styles = r'className="w-full h-\[44px\] px-\[14px\] rounded-\[8px\] font-mono text-\[12px\] outline-none cursor-pointer"\n\s*style={{\n\s*background: "#F5E6D3",\n\s*border: "1\.5px solid #D4B896",\n\s*color: "#2C2C2C",\n\s*fontFamily: "inherit",\n\s*}}'
content = re.sub(input_styles, 'className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none cursor-pointer bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"', content)

input_styles_2 = r'className="w-full h-\[44px\] px-\[14px\] rounded-\[8px\] font-mono text-\[12px\] outline-none"\n\s*style={{\n\s*background: "#F5E6D3",\n\s*border: "1\.5px solid #D4B896",\n\s*color: "#2C2C2C",\n\s*fontFamily: "inherit",\n\s*}}'
content = re.sub(input_styles_2, 'className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"', content)

textarea_styles = r'className="w-full px-\[14px\] py-\[12px\] rounded-\[8px\] font-mono text-\[12px\] outline-none resize-none"\n\s*style={{\n\s*background: "#F5E6D3",\n\s*border: "1\.5px solid #D4B896",\n\s*color: "#2C2C2C",\n\s*fontFamily: "inherit",\n\s*}}'
content = re.sub(textarea_styles, 'className="w-full px-[14px] py-[12px] rounded-[8px] font-mono text-[14px] outline-none resize-none bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"', content)

# 5. Content type buttons
content = content.replace(
    '''style={{
                    background:
                      contentType === ct
                        ? "rgba(200,90,44,0.12)"
                        : "rgba(44,44,44,0.05)",
                    color: contentType === ct ? "#C85A2C" : "#4A3728",
                    fontWeight: contentType === ct ? 600 : 400,
                    outline:
                      contentType === ct
                        ? "1.5px solid rgba(200,90,44,0.3)"
                        : "none",
                  }}''',
    '''style={{
                    background:
                      contentType === ct
                        ? "color-mix(in oklab, var(--v3-accent) 15%, transparent)"
                        : "var(--bg)",
                    color: contentType === ct ? "var(--v3-accent)" : "var(--ink-2)",
                    fontWeight: contentType === ct ? 600 : 400,
                    outline:
                      contentType === ct
                        ? "1.5px solid var(--v3-accent)"
                        : "1px solid var(--rule)",
                  }}'''
)

# 6. Generate button
content = content.replace('style={{ background: "#C85A2C" }}', 'className="w-full h-[52px] rounded-[10px] font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"')
content = content.replace('className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90"\n            className="w-full h-[52px] rounded-[10px] font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"', 'className="w-full h-[52px] rounded-[10px] font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"')
content = content.replace('className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90"', 'className="w-full h-[52px] rounded-[10px] font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"')

content = content.replace('✦ Generate', '<Sparkles size={16} className="inline-block mr-2" /> Generate')


# 7. Output panel bg and fonts
content = content.replace('className="rounded-[16px] overflow-hidden"\n            style={{ border: "1px solid #D4B896" }}', 'className="rounded-[16px] overflow-hidden border border-[var(--rule)]"')

# 8. Markdown wrapper fonts
content = content.replace('className="prose prose-sm max-w-none text-[#2C2C2C]"', 'className="prose prose-sm max-w-none text-[var(--ink)]"')
content = content.replace('background: "#F5E6D3"', 'background: "var(--bg)"')
content = content.replace('background: "#FAF5EC"', 'background: "var(--bg-2)"')
content = content.replace('color: "#8B6F47"', 'color: "var(--ink-3)"')
content = content.replace('color: "#2C2C2C"', 'color: "var(--ink)"')
content = content.replace('color: "#C85A2C"', 'color: "var(--v3-accent)"')

# Add missing lucide imports
if 'import { Sparkles, BookOpen, ArrowRight } from "lucide-react";' not in content:
    content = content.replace('import { CarouselPreview } from "@/components/bookbreaks/CarouselPreview";', 'import { CarouselPreview } from "@/components/bookbreaks/CarouselPreview";\nimport { Sparkles, BookOpen, ArrowRight } from "lucide-react";')

with open('/Users/mac/prog/blockchain/portfolio-v2/components/bookbreaks/Generator.tsx', 'w') as f:
    f.write(content)
