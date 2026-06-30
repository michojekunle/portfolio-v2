import re
import glob

def process_file(path):
    with open(path, 'r') as f:
        content = f.read()
        
    original_content = content

    # In books/page.tsx
    if "books/page.tsx" in path:
        content = content.replace('Generate →', 'Generate <ArrowRight className="w-3 h-3 ml-1 inline-block" />')
        
    # In content/page.tsx
    if "content/page.tsx" in path:
        content = content.replace('✦ Generate More', '<Sparkles className="w-3 h-3 mr-1 inline-block" /> Generate More')
        content = content.replace('Generate Content →', 'Generate Content <ArrowRight className="w-3 h-3 ml-1 inline-block" />')
        
    # In page.tsx (dashboard)
    if "(app)/page.tsx" in path:
        content = content.replace('✦ Generate Content', '<Sparkles className="w-3 h-3 mr-1 inline-block" /> Generate Content')
        content = content.replace('All books →', 'All books <ArrowRight className="w-3 h-3 ml-1 inline-block" />')
        content = content.replace('All →', 'All <ArrowRight className="w-3 h-3 ml-1 inline-block" />')
        content = content.replace('{cta.label} →', '{cta.label} <ArrowRight className="w-3 h-3 ml-1 inline-block" />')
        
    # In login/page.tsx
    if "login/page.tsx" in path:
        content = content.replace('← Creator Suite', '<ArrowLeft className="w-3 h-3 mr-1 inline-block" /> Creator Suite')
        content = content.replace('📚', '<BookOpen className="w-5 h-5 text-[var(--v3-accent)]" />')
        content = content.replace('? "Sign In →"', '? <><span className="mr-1">Sign In</span> <ArrowRight className="w-3 h-3 inline-block" /></>')
        content = content.replace(': "Create Account →"', ': <><span className="mr-1">Create Account</span> <ArrowRight className="w-3 h-3 inline-block" /></>')
        
        # fix the inputs manually via regex
        input_style_re = r'style={{\s*background:\s*"#FAF5EC",\s*border:\s*"1\.5px solid #D4B896",\s*color:\s*"#2C2C2C",\s*fontFamily:\s*"inherit",\s*}}'
        content = re.sub(input_style_re, 'className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200 bg-[var(--bg-2)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"', content)
        
        # remove the onFocus/onBlur inline handlers that change border color since tailwind focus:border-[var(--v3-accent)] handles it
        content = re.sub(r'onFocus={\(e\) => { e\.currentTarget\.style\.borderColor = "#C85A2C"; }}\s*onBlur={\(e\) => { e\.currentTarget\.style\.borderColor = "#D4B896"; }}', '', content)

        # Fix the old className that had w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200
        content = content.replace('className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200"\n              className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200 bg-[var(--bg-2)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"', 'className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200 bg-[var(--bg-2)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"')

    if content != original_content:
        # Add imports for ArrowRight, Sparkles, ArrowLeft, BookOpen if needed
        lucide_imports = set()
        if 'ArrowRight' in content: lucide_imports.add('ArrowRight')
        if 'ArrowLeft' in content: lucide_imports.add('ArrowLeft')
        if 'Sparkles' in content: lucide_imports.add('Sparkles')
        if 'BookOpen' in content: lucide_imports.add('BookOpen')
        
        if lucide_imports:
            # check if lucide-react is already imported
            import_str = f"import {{ {', '.join(lucide_imports)} }} from \"lucide-react\";\n"
            if 'lucide-react' not in content:
                # add to the top
                lines = content.split('\n')
                # insert after last import
                last_import = 0
                for i, line in enumerate(lines):
                    if line.startswith('import '):
                        last_import = i
                lines.insert(last_import + 1, import_str.strip())
                content = '\n'.join(lines)
            else:
                # it's already there, we might need to merge, but for now let's just add it if it's missing from the existing import
                pass # simpler to just let it be or manually fix

        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

for p in glob.glob('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/**/*.tsx', recursive=True):
    process_file(p)
