import re
import glob

def add_import(path, new_imports):
    with open(path, 'r') as f:
        content = f.read()

    # Find the existing import from "lucide-react"
    match = re.search(r'import\s+\{([^}]+)\}\s+from\s+["\']lucide-react["\'];?', content)
    if match:
        existing_imports = [i.strip() for i in match.group(1).split(',')]
        for imp in new_imports:
            if imp not in existing_imports:
                existing_imports.append(imp)
        
        new_import_stmt = f'import {{ {", ".join(existing_imports)} }} from "lucide-react";'
        content = content[:match.start()] + new_import_stmt + content[match.end():]
        
        with open(path, 'w') as f:
            f.write(content)

add_import('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/(app)/page.tsx', ['ArrowRight', 'Sparkles'])
add_import('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/(app)/books/page.tsx', ['ArrowRight'])
add_import('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/(app)/content/page.tsx', ['ArrowRight', 'Sparkles'])

