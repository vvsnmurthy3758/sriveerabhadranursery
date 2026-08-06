#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════
 *  Sri Veerabhadra Nursery — Data Management CLI
 *  Reusable script to add, edit, remove, list, and audit entries
 *  in plants.json and blogs.json.
 * 
 *  Usage:
 *    node update-data.js <type> <action> [identifier]
 * 
 *  Types:  plant | blog
 *  Actions: add | edit | remove | list | audit
 * 
 *  Examples:
 *    node update-data.js plant list
 *    node update-data.js plant add
 *    node update-data.js plant edit "Flame Tree"
 *    node update-data.js plant remove "Flame Tree"
 *    node update-data.js blog list
 *    node update-data.js blog add
 *    node update-data.js blog edit "best-avenue-trees-india"
 *    node update-data.js blog remove "best-avenue-trees-india"
 *    node update-data.js audit
 * ═══════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── File paths ──
const PLANTS_FILE = path.join(__dirname, 'plants.json');
const BLOGS_FILE = path.join(__dirname, 'blogs.json');

// ── Colors for terminal output ──
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgCyan: '\x1b[46m',
  white: '\x1b[37m',
};

// ── Helpers ──

function loadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`${C.red}✗ Error reading ${filePath}: ${err.message}${C.reset}`);
    process.exit(1);
  }
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${C.green}✓ Saved ${filePath}${C.reset}`);
  } catch (err) {
    console.error(`${C.red}✗ Error writing ${filePath}: ${err.message}${C.reset}`);
    process.exit(1);
  }
}

function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question, defaultVal = '') {
  const suffix = defaultVal ? ` ${C.dim}(${defaultVal})${C.reset}` : '';
  return new Promise((resolve) => {
    rl.question(`${C.cyan}  → ${question}${suffix}: ${C.reset}`, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

function confirm(rl, question) {
  return new Promise((resolve) => {
    rl.question(`${C.yellow}  ⚠ ${question} (y/n): ${C.reset}`, (answer) => {
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

function printHeader(text) {
  const line = '═'.repeat(60);
  console.log(`\n${C.cyan}${line}${C.reset}`);
  console.log(`${C.bold}${C.cyan}  ${text}${C.reset}`);
  console.log(`${C.cyan}${line}${C.reset}\n`);
}

function printSubHeader(text) {
  console.log(`\n${C.magenta}  ── ${text} ──${C.reset}\n`);
}

function printSuccess(text) {
  console.log(`${C.green}  ✓ ${text}${C.reset}`);
}

function printError(text) {
  console.log(`${C.red}  ✗ ${text}${C.reset}`);
}

function printWarning(text) {
  console.log(`${C.yellow}  ⚠ ${text}${C.reset}`);
}

// ── Plant Operations ──

const PLANT_FIELDS = [
  { key: 'commonName', label: 'Common Name', required: true },
  { key: 'scientificName', label: 'Scientific Name', required: true },
  { key: 'category', label: 'Category (Flowering Plants / Fruit Plants / Palms & Bamboo / Avenue Plants / Shrubs)', required: true },
  { key: 'shortDescription', label: 'Short Description', required: true },
  { key: 'image', label: 'Image Path (e.g. assets/images/plants/name.webp)', required: true },
  { key: 'seoAltText', label: 'SEO Alt Text', required: true },
  { key: 'waterRequirement', label: 'Water Requirement (Low / Moderate / High)', required: false, default: 'Moderate' },
  { key: 'sunlightRequirement', label: 'Sunlight Requirement (Full Sun / Partial Shade / Shade)', required: false, default: 'Full Sun' },
  { key: 'maintenanceLevel', label: 'Maintenance Level (Low / Medium / High)', required: false, default: 'Medium' },
  { key: 'view', label: 'View Count', required: false, default: '5' },
];

async function listPlants() {
  const plants = loadJSON(PLANTS_FILE);
  printHeader(`🌱 All Plants (${plants.length} total)`);

  // Group by category
  const grouped = {};
  plants.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  for (const [category, items] of Object.entries(grouped)) {
    printSubHeader(`${category} (${items.length})`);
    items.forEach((p, i) => {
      const viewStr = p.view !== undefined ? ` | views: ${p.view}` : ` | ${C.red}no view field${C.reset}`;
      console.log(`    ${C.dim}${String(i + 1).padStart(2, ' ')}.${C.reset} ${C.bold}${p.commonName}${C.reset} ${C.dim}(${p.scientificName})${C.reset}${viewStr}`);
    });
  }
  console.log('');
}

async function addPlant() {
  const plants = loadJSON(PLANTS_FILE);
  const rl = createRL();

  printHeader('🌱 Add New Plant');

  const newPlant = {};
  for (const field of PLANT_FIELDS) {
    const val = await ask(rl, field.label, field.default || '');
    if (field.required && !val) {
      printError(`${field.label} is required. Aborting.`);
      rl.close();
      return;
    }
    if (field.key === 'view') {
      newPlant[field.key] = parseInt(val, 10) || 5;
    } else {
      newPlant[field.key] = val;
    }
  }

  // Check for duplicates
  const existing = plants.find((p) => p.commonName.toLowerCase() === newPlant.commonName.toLowerCase());
  if (existing) {
    printWarning(`A plant named "${existing.commonName}" already exists.`);
    const proceed = await confirm(rl, 'Add anyway?');
    if (!proceed) {
      rl.close();
      return;
    }
  }

  plants.push(newPlant);
  saveJSON(PLANTS_FILE, plants);
  printSuccess(`Added "${newPlant.commonName}" to plants.json (total: ${plants.length})`);
  rl.close();
}

async function editPlant(identifier) {
  const plants = loadJSON(PLANTS_FILE);
  const rl = createRL();

  if (!identifier) {
    identifier = await ask(rl, 'Enter the Common Name of the plant to edit');
  }

  const index = plants.findIndex((p) => p.commonName.toLowerCase() === identifier.toLowerCase());
  if (index === -1) {
    printError(`Plant "${identifier}" not found.`);
    rl.close();
    return;
  }

  const plant = plants[index];
  printHeader(`✏️  Editing: ${plant.commonName}`);
  console.log(`${C.dim}  Press Enter to keep the current value.${C.reset}\n`);

  for (const field of PLANT_FIELDS) {
    const currentVal = plant[field.key] !== undefined ? String(plant[field.key]) : '';
    const newVal = await ask(rl, field.label, currentVal);
    if (field.key === 'view') {
      plant[field.key] = parseInt(newVal, 10) || 5;
    } else {
      plant[field.key] = newVal;
    }
  }

  plants[index] = plant;
  saveJSON(PLANTS_FILE, plants);
  printSuccess(`Updated "${plant.commonName}" in plants.json`);
  rl.close();
}

async function removePlant(identifier) {
  const plants = loadJSON(PLANTS_FILE);
  const rl = createRL();

  if (!identifier) {
    identifier = await ask(rl, 'Enter the Common Name of the plant to remove');
  }

  const index = plants.findIndex((p) => p.commonName.toLowerCase() === identifier.toLowerCase());
  if (index === -1) {
    printError(`Plant "${identifier}" not found.`);
    rl.close();
    return;
  }

  const plant = plants[index];
  console.log(`\n  ${C.bold}${plant.commonName}${C.reset} (${plant.scientificName}) — ${plant.category}`);

  const proceed = await confirm(rl, `Remove "${plant.commonName}" permanently?`);
  if (!proceed) {
    console.log('  Cancelled.');
    rl.close();
    return;
  }

  plants.splice(index, 1);
  saveJSON(PLANTS_FILE, plants);
  printSuccess(`Removed "${plant.commonName}" from plants.json (remaining: ${plants.length})`);
  rl.close();
}

// ── Blog Operations ──

const BLOG_SIMPLE_FIELDS = [
  { key: 'id', label: 'Blog ID / slug (e.g. my-blog-post)', required: true },
  { key: 'title', label: 'Title', required: true },
  { key: 'metaDescription', label: 'Meta Description', required: true },
  { key: 'featuredImage', label: 'Featured Image Path', required: true },
  { key: 'tag', label: 'Tag', required: true },
  { key: 'excerpt', label: 'Excerpt', required: true },
  { key: 'date', label: 'Date (YYYY-MM-DD)', required: true },
  { key: 'introduction', label: 'Introduction paragraph', required: false, default: '' },
  { key: 'conclusion', label: 'Conclusion paragraph', required: false, default: '' },
  { key: 'ctaText', label: 'CTA Text', required: false, default: '' },
];

async function listBlogs() {
  const blogs = loadJSON(BLOGS_FILE);
  printHeader(`📝 All Blog Posts (${blogs.length} total)`);

  blogs.forEach((b, i) => {
    console.log(`  ${C.dim}${String(i + 1).padStart(2, ' ')}.${C.reset} ${C.bold}${b.title}${C.reset}`);
    console.log(`      ${C.dim}ID: ${b.id} | Tag: ${b.tag} | Date: ${b.date}${C.reset}`);
    console.log(`      ${C.dim}FAQs: ${(b.faqs || []).length} | Quick Facts: ${(b.quickFacts || []).length} | Benefits: ${(b.benefits || []).length}${C.reset}`);
    console.log('');
  });
}

async function addBlog() {
  const blogs = loadJSON(BLOGS_FILE);
  const rl = createRL();

  printHeader('📝 Add New Blog Post');

  const newBlog = {};
  for (const field of BLOG_SIMPLE_FIELDS) {
    const val = await ask(rl, field.label, field.default || '');
    if (field.required && !val) {
      printError(`${field.label} is required. Aborting.`);
      rl.close();
      return;
    }
    newBlog[field.key] = val;
  }

  // Initialize arrays with empty values (user can edit the JSON later for complex fields)
  newBlog.quickFacts = [];
  newBlog.benefits = [];
  newBlog.plantingGuide = [];
  newBlog.maintenanceTips = [];
  newBlog.faqs = [];
  newBlog.relatedIds = [];

  printSubHeader('Adding Quick Facts (type "done" to stop)');
  while (true) {
    const fact = await ask(rl, 'Quick Fact');
    if (fact.toLowerCase() === 'done' || !fact) break;
    newBlog.quickFacts.push(fact);
  }

  printSubHeader('Adding Benefits (type "done" to stop)');
  while (true) {
    const benefit = await ask(rl, 'Benefit');
    if (benefit.toLowerCase() === 'done' || !benefit) break;
    newBlog.benefits.push(benefit);
  }

  printSubHeader('Adding FAQs (type "done" for question to stop)');
  while (true) {
    const question = await ask(rl, 'FAQ Question');
    if (question.toLowerCase() === 'done' || !question) break;
    const answer = await ask(rl, 'FAQ Answer');
    newBlog.faqs.push({ question, answer });
  }

  printSubHeader('Adding Related Blog IDs (type "done" to stop)');
  while (true) {
    const relId = await ask(rl, 'Related Blog ID');
    if (relId.toLowerCase() === 'done' || !relId) break;
    newBlog.relatedIds.push(relId);
  }

  // Duplicate check
  const existing = blogs.find((b) => b.id === newBlog.id);
  if (existing) {
    printWarning(`A blog with ID "${newBlog.id}" already exists.`);
    const proceed = await confirm(rl, 'Add anyway?');
    if (!proceed) {
      rl.close();
      return;
    }
  }

  blogs.push(newBlog);
  saveJSON(BLOGS_FILE, blogs);
  printSuccess(`Added blog "${newBlog.title}" to blogs.json (total: ${blogs.length})`);
  rl.close();
}

async function editBlog(identifier) {
  const blogs = loadJSON(BLOGS_FILE);
  const rl = createRL();

  if (!identifier) {
    identifier = await ask(rl, 'Enter the Blog ID (slug) to edit');
  }

  const index = blogs.findIndex((b) => b.id === identifier);
  if (index === -1) {
    printError(`Blog "${identifier}" not found.`);
    console.log(`${C.dim}  Available IDs: ${blogs.map((b) => b.id).join(', ')}${C.reset}`);
    rl.close();
    return;
  }

  const blog = blogs[index];
  printHeader(`✏️  Editing Blog: ${blog.title}`);
  console.log(`${C.dim}  Press Enter to keep the current value.${C.reset}\n`);

  for (const field of BLOG_SIMPLE_FIELDS) {
    const currentVal = blog[field.key] || '';
    const newVal = await ask(rl, field.label, currentVal);
    blog[field.key] = newVal;
  }

  // For complex fields, show count and ask if user wants to replace
  const arrayFields = ['quickFacts', 'benefits', 'plantingGuide', 'maintenanceTips'];
  for (const arrField of arrayFields) {
    const count = (blog[arrField] || []).length;
    const replace = await confirm(rl, `${arrField} has ${count} items. Replace them?`);
    if (replace) {
      blog[arrField] = [];
      printSubHeader(`Adding ${arrField} (type "done" to stop)`);
      while (true) {
        const item = await ask(rl, `${arrField} item`);
        if (item.toLowerCase() === 'done' || !item) break;
        blog[arrField].push(item);
      }
    }
  }

  // FAQs
  const faqCount = (blog.faqs || []).length;
  const replaceFaqs = await confirm(rl, `faqs has ${faqCount} items. Replace them?`);
  if (replaceFaqs) {
    blog.faqs = [];
    printSubHeader('Adding FAQs (type "done" for question to stop)');
    while (true) {
      const question = await ask(rl, 'FAQ Question');
      if (question.toLowerCase() === 'done' || !question) break;
      const answer = await ask(rl, 'FAQ Answer');
      blog.faqs.push({ question, answer });
    }
  }

  // Related IDs
  const relCount = (blog.relatedIds || []).length;
  const replaceRel = await confirm(rl, `relatedIds has ${relCount} items. Replace them?`);
  if (replaceRel) {
    blog.relatedIds = [];
    printSubHeader('Adding Related Blog IDs (type "done" to stop)');
    while (true) {
      const relId = await ask(rl, 'Related Blog ID');
      if (relId.toLowerCase() === 'done' || !relId) break;
      blog.relatedIds.push(relId);
    }
  }

  blogs[index] = blog;
  saveJSON(BLOGS_FILE, blogs);
  printSuccess(`Updated blog "${blog.title}" in blogs.json`);
  rl.close();
}

async function removeBlog(identifier) {
  const blogs = loadJSON(BLOGS_FILE);
  const rl = createRL();

  if (!identifier) {
    identifier = await ask(rl, 'Enter the Blog ID (slug) to remove');
  }

  const index = blogs.findIndex((b) => b.id === identifier);
  if (index === -1) {
    printError(`Blog "${identifier}" not found.`);
    rl.close();
    return;
  }

  const blog = blogs[index];
  console.log(`\n  ${C.bold}${blog.title}${C.reset} ${C.dim}(${blog.id})${C.reset}`);

  const proceed = await confirm(rl, `Remove "${blog.title}" permanently?`);
  if (!proceed) {
    console.log('  Cancelled.');
    rl.close();
    return;
  }

  blogs.splice(index, 1);
  saveJSON(BLOGS_FILE, blogs);
  printSuccess(`Removed blog "${blog.title}" from blogs.json (remaining: ${blogs.length})`);
  rl.close();
}

// ── Audit Operation ──

async function runAudit() {
  const plants = loadJSON(PLANTS_FILE);
  const blogs = loadJSON(BLOGS_FILE);

  printHeader('🔍 Data Quality Audit');

  let issues = 0;

  // ── Plant Audits ──
  printSubHeader('Plant Data Checks');

  // Check for missing fields
  const plantRequiredFields = ['commonName', 'scientificName', 'category', 'shortDescription', 'image', 'seoAltText'];
  plants.forEach((p, i) => {
    plantRequiredFields.forEach((field) => {
      if (!p[field]) {
        printWarning(`Plant #${i + 1} missing required field: ${field}`);
        issues++;
      }
    });
    if (p.view === undefined) {
      printWarning(`Plant "${p.commonName}" missing "view" field`);
      issues++;
    }
  });

  // Check for duplicate names
  const nameMap = {};
  plants.forEach((p) => {
    const key = p.commonName.toLowerCase();
    if (nameMap[key]) {
      printWarning(`Duplicate plant name: "${p.commonName}"`);
      issues++;
    }
    nameMap[key] = true;
  });

  // Check for identical descriptions
  const descMap = {};
  plants.forEach((p) => {
    if (!descMap[p.shortDescription]) descMap[p.shortDescription] = [];
    descMap[p.shortDescription].push(p.commonName);
  });
  for (const [desc, names] of Object.entries(descMap)) {
    if (names.length > 3) {
      printWarning(`${names.length} plants share identical description: "${desc.substring(0, 60)}..."`);
      issues++;
    }
  }

  // Check for uniform values
  const waterVals = new Set(plants.map((p) => p.waterRequirement));
  if (waterVals.size === 1) {
    printWarning(`All ${plants.length} plants have identical waterRequirement: "${[...waterVals][0]}"`);
    issues++;
  }
  const sunVals = new Set(plants.map((p) => p.sunlightRequirement));
  if (sunVals.size === 1) {
    printWarning(`All ${plants.length} plants have identical sunlightRequirement: "${[...sunVals][0]}"`);
    issues++;
  }
  const maintVals = new Set(plants.map((p) => p.maintenanceLevel));
  if (maintVals.size === 1) {
    printWarning(`All ${plants.length} plants have identical maintenanceLevel: "${[...maintVals][0]}"`);
    issues++;
  }

  // Check image file references (filename patterns)
  plants.forEach((p) => {
    if (p.image && !p.image.startsWith('assets/images/plants/')) {
      printWarning(`Plant "${p.commonName}" has non-standard image path: ${p.image}`);
      issues++;
    }
  });

  // ── Blog Audits ──
  printSubHeader('Blog Data Checks');

  // Check for missing fields
  const blogRequiredFields = ['id', 'title', 'metaDescription', 'featuredImage', 'tag', 'excerpt', 'date'];
  blogs.forEach((b, i) => {
    blogRequiredFields.forEach((field) => {
      if (!b[field]) {
        printWarning(`Blog #${i + 1} missing required field: ${field}`);
        issues++;
      }
    });
  });

  // Check relatedIds reference valid blog IDs
  const blogIds = new Set(blogs.map((b) => b.id));
  blogs.forEach((b) => {
    (b.relatedIds || []).forEach((relId) => {
      if (!blogIds.has(relId)) {
        printWarning(`Blog "${b.id}" references non-existent relatedId: "${relId}"`);
        issues++;
      }
    });
  });

  // Check for duplicate IDs
  const idMap = {};
  blogs.forEach((b) => {
    if (idMap[b.id]) {
      printWarning(`Duplicate blog ID: "${b.id}"`);
      issues++;
    }
    idMap[b.id] = true;
  });

  // ── Summary ──
  printSubHeader('Audit Summary');
  console.log(`  ${C.bold}Total Plants:${C.reset} ${plants.length}`);
  console.log(`  ${C.bold}Total Blogs:${C.reset}  ${blogs.length}`);
  console.log(`  ${C.bold}Categories:${C.reset}   ${[...new Set(plants.map((p) => p.category))].join(', ')}`);
  console.log(`  ${C.bold}Blog Tags:${C.reset}    ${[...new Set(blogs.map((b) => b.tag))].join(', ')}`);

  if (issues === 0) {
    printSuccess('No issues found! Data looks great.');
  } else {
    printError(`${issues} issue(s) found. Review the warnings above.`);
  }
  console.log('');
}

// ── Main Entry Point ──

async function main() {
  const args = process.argv.slice(2);
  const type = args[0]?.toLowerCase();
  const action = args[1]?.toLowerCase();
  const identifier = args[2];

  if (!type || (type !== 'audit' && !action)) {
    printHeader('Sri Veerabhadra Nursery — Data Manager');
    console.log(`  ${C.bold}Usage:${C.reset}`);
    console.log(`    node update-data.js ${C.cyan}<type>${C.reset} ${C.green}<action>${C.reset} ${C.dim}[identifier]${C.reset}\n`);
    console.log(`  ${C.bold}Types:${C.reset}    plant | blog | audit`);
    console.log(`  ${C.bold}Actions:${C.reset}   add | edit | remove | list\n`);
    console.log(`  ${C.bold}Examples:${C.reset}`);
    console.log(`    node update-data.js plant list`);
    console.log(`    node update-data.js plant add`);
    console.log(`    node update-data.js plant edit "Flame Tree"`);
    console.log(`    node update-data.js plant remove "Flame Tree"`);
    console.log(`    node update-data.js blog list`);
    console.log(`    node update-data.js blog add`);
    console.log(`    node update-data.js blog edit "best-avenue-trees-india"`);
    console.log(`    node update-data.js audit`);
    console.log('');
    return;
  }

  if (type === 'audit') {
    await runAudit();
    return;
  }

  if (type === 'plant') {
    switch (action) {
      case 'list':   await listPlants(); break;
      case 'add':    await addPlant(); break;
      case 'edit':   await editPlant(identifier); break;
      case 'remove': await removePlant(identifier); break;
      default:       printError(`Unknown action: ${action}. Use: add | edit | remove | list`); break;
    }
  } else if (type === 'blog') {
    switch (action) {
      case 'list':   await listBlogs(); break;
      case 'add':    await addBlog(); break;
      case 'edit':   await editBlog(identifier); break;
      case 'remove': await removeBlog(identifier); break;
      default:       printError(`Unknown action: ${action}. Use: add | edit | remove | list`); break;
    }
  } else {
    printError(`Unknown type: ${type}. Use: plant | blog | audit`);
  }
}

main().catch((err) => {
  console.error(`${C.red}Fatal error: ${err.message}${C.reset}`);
  process.exit(1);
});
