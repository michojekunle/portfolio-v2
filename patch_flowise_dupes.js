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
  
  // Replace multiple occurrences of `const { hidden } = usePrivacy();` with just one in a row
  code = code.replace(/(?:\s*const \{ hidden \} = usePrivacy\(\);\s*){2,}/g, '\n  const { hidden } = usePrivacy();\n');

  fs.writeFileSync(path, code);
}

console.log("Done removing dupes!");
