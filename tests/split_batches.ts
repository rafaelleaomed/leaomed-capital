import fs from 'fs';

const sql = fs.readFileSync('tests/bulk_insert_october.sql', 'utf8');
// Extracts the values section
const valuesMatch = sql.match(/VALUES\s+([\s\S]+?)\s+ON CONFLICT/i);
if (!valuesMatch) {
  console.error('Values not found');
  process.exit(1);
}

const rawValues = valuesMatch[1].trim();
// Split values by "),\n("
const items = rawValues.split(/\),\s*\n\s*\(/);
console.log('Total items split:', items.length);

const cleanItems = items.map((it, idx) => {
  let s = it.trim();
  if (!s.startsWith('(')) s = '(' + s;
  if (!s.endsWith(')')) s = s + ')';
  return s;
});

const b1 = cleanItems.slice(0, 30);
const b2 = cleanItems.slice(30);

const template = (vals: string[]) => `
INSERT INTO public.transactions (
  user_id, raw_id, account_id, amount, date, competence_date,
  description, category, subcategory, is_fixed, is_ignored, hash
) VALUES 
${vals.join(',\n')}
ON CONFLICT (hash) DO UPDATE SET
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  is_fixed = EXCLUDED.is_fixed,
  is_ignored = EXCLUDED.is_ignored;
`;

fs.writeFileSync('tests/batch1.sql', template(b1));
fs.writeFileSync('tests/batch2.sql', template(b2));
console.log('Batch 1 written:', b1.length, 'items');
console.log('Batch 2 written:', b2.length, 'items');
