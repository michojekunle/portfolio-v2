import re

with open('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/login/page.tsx', 'r') as f:
    content = f.read()

# 1. Rename BookBreaksLoginPage to LoginContent
content = content.replace('export default function BookBreaksLoginPage(): React.ReactElement {', 'function LoginContent(): React.ReactElement {')

# 2. Add export default with Suspense at the bottom
suspense_wrapper = """
export default function BookBreaksLoginPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--ink-3)]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
"""
content += suspense_wrapper

# 3. Add import Suspense
if 'import { Suspense }' not in content:
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect, Suspense } from "react";')

# 4. Remove style={{ background: "#F5E6D3" }}
content = content.replace('style={{ background: "#F5E6D3" }}', '')
content = content.replace('className="min-h-screen flex items-center justify-center px-[24px] py-[80px]"\n      \n    >', 'className="min-h-screen flex items-center justify-center px-[24px] py-[80px] bg-[var(--bg)]"\n    >')
content = content.replace('className="min-h-screen flex items-center justify-center px-[24px] py-[80px]"', 'className="min-h-screen flex items-center justify-center px-[24px] py-[80px] bg-[var(--bg)]"')

with open('/Users/mac/prog/blockchain/portfolio-v2/app/tools/bookbreaks/login/page.tsx', 'w') as f:
    f.write(content)
