const fs = require('fs');

const files = [
  'CashFlowChart.tsx',
  'AccountsClient.tsx',
  'BudgetsClient.tsx',
  'AnalyticsClient.tsx',
  'TransactionsClient.tsx',
  'GoalsClient.tsx',
  'CategoryDonut.tsx',
  'SpendingHeatmap.tsx',
  'DashboardClient.tsx'
];

for (const file of files) {
  const path = '/Users/mac/prog/blockchain/portfolio-v2/components/flowise/' + file;
  if (!fs.existsSync(path)) continue;
  
  let code = fs.readFileSync(path, 'utf8');
  
  if (code.includes('usePrivacy')) continue;
  
  code = code.replace(
    /import \{ formatCurrency \} from "@\/lib\/flowise\/calculator";/,
    `import { formatCurrency } from "@/lib/flowise/calculator";\nimport { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";`
  );
  
  code = code.replace(
    /export function ([A-Za-z0-9_]+)\([^)]*\)(?:\s*:\s*[A-Za-z0-9_<>.]+)?\s*\{/,
    match => match + '\n  const { hidden } = usePrivacy();\n'
  );
  
  code = code.replace(
    /const ([A-Za-z0-9_]+) = \([^)]*\)(?:\s*:\s*[A-Za-z0-9_<>.]+)?\s*=>\s*\{/,
    match => match + '\n  const { hidden } = usePrivacy();\n'
  );

  code = code.replace(/formatCurrency\(([^)]+)\)/g, '(hidden ? "****" : formatCurrency($1))');

  fs.writeFileSync(path, code);
}

const sidebar = '/Users/mac/prog/blockchain/portfolio-v2/components/flowise/SidebarNav.tsx';
let sb = fs.readFileSync(sidebar, 'utf8');
if (!sb.includes('usePrivacy')) {
  sb = sb.replace(
    /import \{ ([^}]+) \} from "lucide-react";/,
    `import { $1, Eye, EyeOff } from "lucide-react";`
  );
  sb = sb.replace(
    /import \{ usePathname, useRouter \} from "next\/navigation";/,
    `import { usePathname, useRouter } from "next/navigation";\nimport { usePrivacy } from "@/components/flowise/PrivacyProvider";`
  );
  sb = sb.replace(
    /export function SidebarNav\(\) \{/,
    `export function SidebarNav() {\n  const { hidden, toggle } = usePrivacy();\n`
  );
  sb = sb.replace(
    /<button\s+onClick=\{handleSignOut\}/,
    `<button\n            onClick={toggle}\n            className="w-full flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] text-[13px] font-medium transition-all text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)]"\n          >\n            {hidden ? <EyeOff size={16} /> : <Eye size={16} />}\n            {hidden ? "Show Amounts" : "Hide Amounts"}\n          </button>\n          <button onClick={handleSignOut}`
  );
  fs.writeFileSync(sidebar, sb);
}

const layout = '/Users/mac/prog/blockchain/portfolio-v2/app/tools/flowise/(app)/layout.tsx';
let lyt = fs.readFileSync(layout, 'utf8');
if (!lyt.includes('PrivacyProvider')) {
  lyt = lyt.replace(
    /import \{ SidebarNav \} from "@\/components\/flowise\/SidebarNav";/,
    `import { SidebarNav } from "@/components/flowise/SidebarNav";\nimport { PrivacyProvider } from "@/components/flowise/PrivacyProvider";`
  );
  lyt = lyt.replace(
    /<div className="flex h-screen bg-\[var\(--paper\)\]">/,
    `<PrivacyProvider>\n      <div className="flex h-screen bg-[var(--paper)]">`
  );
  lyt = lyt.replace(
    /<\/div>\n    <\/main>/,
    `</div>\n      </PrivacyProvider>\n    </main>`
  );
  fs.writeFileSync(layout, lyt);
}

console.log("Done patching!");
