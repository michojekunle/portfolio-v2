import re
import glob

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
        
    original_content = content

    # Simple replacements
    content = content.replace('style={{ color: "#8B6F47" }}', '')
    content = content.replace('style={{ color: "#2C2C2C" }}', '')
    content = content.replace('style={{ color: "#C85A2C" }}', '')
    content = content.replace('style={{ border: "1px solid #D4B896", background: "#FAF5EC" }}', '')
    content = content.replace('style={{ border: "1.5px dashed #D4B896", background: "#FAF5EC" }}', '')
    content = content.replace('style={{ color: "#8B6F47", fontFamily: "inherit" }}', '')
    content = content.replace('style={{\n              color: "#8B6F47"\n            }}', '')
    
    # We also need to inject the Tailwind classes into className=""
    # This is a bit manual, let's use a mapping of regexes

    # books/page.tsx replacements
    content = content.replace(
        'className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"\n            style={{ color: "#8B6F47" }}',
        'className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px] text-[var(--ink-3)]"'
    )
    content = content.replace(
        'className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"\n            style={{ color: "#2C2C2C" }}',
        'className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0 text-[var(--ink)]"'
    )
    content = content.replace(
        'className="text-[14px] mt-[6px] m-0"\n            style={{ color: "#8B6F47" }}',
        'className="text-[14px] mt-[6px] m-0 text-[var(--ink-3)]"'
    )
    content = content.replace(
        'className="rounded-[12px] overflow-hidden group/book"\n                style={{ border: "1px solid #D4B896", background: "#FAF5EC" }}',
        'className="rounded-[12px] overflow-hidden group/book border border-[var(--rule)] bg-[var(--bg-2)]"'
    )
    content = content.replace(
        'className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full"\n                          style={{\n                            background: "rgba(200,90,44,0.1)",\n                            color: "#C85A2C",\n                          }}',
        'className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-[var(--v3-accent)]"'
    )
    content = content.replace(
        'className="font-mono text-[10px] font-semibold" style={{ color: "#C85A2C" }}',
        'className="font-mono text-[10px] font-semibold text-[var(--v3-accent)]"'
    )
    content = content.replace(
        'className="font-mono text-[9px] uppercase tracking-[0.1em] ml-[4px]" style={{ color: "#8B6F47" }}',
        'className="font-mono text-[9px] uppercase tracking-[0.1em] ml-[4px] text-[var(--ink-3)]"'
    )
    content = content.replace(
        'className="inline-flex items-center gap-[6px] font-mono text-[9px] uppercase tracking-[0.12em] font-semibold no-underline transition-colors hover:opacity-80"\n                      style={{ color: "#C85A2C" }}',
        'className="inline-flex items-center gap-[6px] font-mono text-[9px] uppercase tracking-[0.12em] font-semibold no-underline transition-colors hover:opacity-80 text-[var(--v3-accent)]"'
    )
    content = content.replace(
        'className="col-span-full rounded-[12px] p-[48px] text-center"\n            style={{ border: "1.5px dashed #D4B896", background: "#FAF5EC" }}',
        'className="col-span-full rounded-[12px] p-[48px] text-center border-[1.5px] border-dashed border-[var(--rule)] bg-[var(--bg-2)]"'
    )
    content = content.replace(
        'className="font-mono text-[12px] tracking-[0.1em] uppercase mb-[24px]"\n              style={{ color: "#8B6F47" }}',
        'className="font-mono text-[12px] tracking-[0.1em] uppercase mb-[24px] text-[var(--ink-3)]"'
    )

    if content != original_content:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

for p in glob.glob('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/**/*.tsx', recursive=True):
    process_file(p)
