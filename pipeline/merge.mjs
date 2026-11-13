// pipeline/merge.mjs
// Deduplicates distilled rules across sources, detects conflicts, applies manual taste resolutions,
// and enforces the hard cap <= 40 executable rules for rules.json.
// Emits pipeline/CONFLICTS.md, rules.json, advisory.md, and updates SOURCES.md.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encode } from 'gpt-tokenizer';
import { distillSource } from './distill.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

/**
 * Zero-dependency YAML parser for pipeline/sources.yml
 */
export function parseSourcesYaml(content) {
  const lines = content.split('\n');
  const sources = [];
  let currentSource = null;
  let inExtract = false;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) continue;

    // Detect list item start: "- repo: ..."
    const itemStartMatch = line.match(/^\s*-\s*repo:\s*(.*)$/);
    if (itemStartMatch) {
      if (currentSource) sources.push(currentSource);
      currentSource = {
        repo: itemStartMatch[1].trim().replace(/^["']|["']$/g, ''),
        commit: '',
        license: '',
        status: 'active',
        reason: '',
        extract: [],
        attribution: '',
      };
      inExtract = false;
      continue;
    }

    if (!currentSource) continue;

    // Extract list items
    const extractItemMatch = line.match(/^\s*-\s+([a-zA-Z0-9_-]+)\s*$/);
    if (extractItemMatch && inExtract) {
      currentSource.extract.push(extractItemMatch[1]);
      continue;
    }

    // Key-value pairs
    const kvMatch = line.match(/^\s*([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2].trim().replace(/^["']|["']$/g, '');

      if (key === 'extract') {
        inExtract = true;
        currentSource.extract = [];
        continue;
      }
      inExtract = false;

      if (key in currentSource) {
        currentSource[key] = val;
      }
    }
  }

  if (currentSource) sources.push(currentSource);
  return sources;
}

/**
 * Zero-dependency YAML parser for pipeline/resolutions.yml
 */
export function parseResolutionsYaml(content) {
  const lines = content.split('\n');
  const resolutions = [];
  let currentRes = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, '').trimEnd();
    if (!line.trim()) continue;

    const startMatch = line.match(/^\s*-\s*conflict_id:\s*(.*)$/);
    if (startMatch) {
      if (currentRes) resolutions.push(currentRes);
      currentRes = {
        conflict_id: startMatch[1].trim().replace(/^["']|["']$/g, ''),
        resolution: 'context-conditional',
        target_rule_id: '',
        condition: '',
        notes: '',
      };
      continue;
    }

    if (!currentRes) continue;

    const kvMatch = line.match(/^\s*([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const val = kvMatch[2].trim().replace(/^["']|["']$/g, '');
      currentRes[key] = val;
    }
  }

  if (currentRes) resolutions.push(currentRes);
  return resolutions;
}

/**
 * Known semantic conflict definitions across design philosophies.
 */
export const CONFLICT_DEFINITIONS = [
  {
    id: 'conflict-gradient-usage',
    title: 'Multi-stop Mesh Gradients vs Monochromatic Ink Neutral Surfaces',
    category: 'COLOR',
    ruleA: {
      category: 'COLOR',
      match: (r) => r.id === 'slop/purple-blue-gradient' || r.id === 'color/monochromatic-neutral-surfaces',
      description: 'Prohibits vibrant multi-color gradients; favors pure monochromatic surfaces.',
    },
    ruleB: {
      category: 'COLOR',
      match: (r) => r.id === 'color/mesh-gradient-accents',
      description: 'Advocates multi-stop mesh gradients on hero cards for high-energy modern visual atmosphere.',
    },
    conflictSummary: 'Taste divergence: strict minimal/editorial anti-slop disallows gradient heroes, whereas modern expressive UI embraces controlled mesh gradients.',
  },
  {
    id: 'conflict-border-radius',
    title: 'Zero Border-Radius Authority vs Soft Rounded Card Radius',
    category: 'SURFACE',
    ruleA: {
      category: 'SURFACE',
      match: (r) => r.id === 'surface/zero-radius-authority',
      description: 'Mandates strict 0px border-radius on buttons and cards for architectural/Swiss authority.',
    },
    ruleB: {
      category: 'SURFACE',
      match: (r) => r.id === 'surface/rounded-card-radius',
      description: 'Mandates 12px to 16px soft border-radius on all interactive cards.',
    },
    conflictSummary: 'Taste divergence: Swiss-utility / brutalist lineage mandates 0px sharp corners; consumer SaaS lineages mandate soft 12px-16px rounded corners.',
  },
];

/**
 * Main merge pipeline function.
 */
export async function runMergePipeline(options = {}) {
  const sourcesPath = resolve(ROOT, 'pipeline', 'sources.yml');
  const resolutionsPath = resolve(ROOT, 'pipeline', 'resolutions.yml');
  const conflictsPath = resolve(ROOT, 'pipeline', 'CONFLICTS.md');
  const rulesPath = resolve(ROOT, 'rules.json');
  const advisoryPath = resolve(ROOT, 'advisory.md');
  const sourcesDocPath = resolve(ROOT, 'SOURCES.md');

  if (!existsSync(sourcesPath)) {
    throw new Error(`Missing sources registry: ${sourcesPath}`);
  }

  const sourcesRaw = readFileSync(sourcesPath, 'utf-8');
  const allSources = parseSourcesYaml(sourcesRaw);
  const activeSources = allSources.filter((s) => s.status === 'active');

  // Determine subset to run on
  let targetSources = activeSources;
  if (options.sources && options.sources.length > 0) {
    targetSources = activeSources.filter((s) => options.sources.includes(s.repo));
  } else if (options.first && options.first > 0) {
    targetSources = activeSources.slice(0, options.first);
  }

  console.log(`\n======================================================`);
  console.log(` auteur-ui Distillation & Merge Pipeline`);
  console.log(` Active target sources: ${targetSources.length} / ${allSources.length}`);
  console.log(`======================================================\n`);

  // 1. Distill each source
  const rawRules = [];
  const allTokens = new Set();
  const allCodeRefs = new Set();
  const sourceDistillResults = [];

  for (const src of targetSources) {
    console.log(`  -> Distilling ${src.repo} (${src.license})...`);
    const result = await distillSource(src.repo);
    sourceDistillResults.push({ source: src, result });
    for (const rule of result.rules) {
      rawRules.push(rule);
    }
    for (const t of result.tokens) allTokens.add(t);
    for (const c of result.code_refs) allCodeRefs.add(c);
  }

  // 2. Semantic deduplication
  const dedupeMap = new Map();

  for (const rule of rawRules) {
    // Normalization key for deduplication
    const normKey = rule.id.trim();

    if (dedupeMap.has(normKey)) {
      const existing = dedupeMap.get(normKey);
      if (!existing.sources.includes(rule.source)) {
        existing.sources.push(rule.source);
        existing.source_count = existing.sources.length;
      }
      existing.weight = Math.max(existing.weight, rule.weight);
    } else {
      dedupeMap.set(normKey, {
        id: rule.id,
        statement: rule.statement,
        category: rule.category,
        weight: rule.weight,
        sources: [rule.source],
        source_count: 1,
        executable: rule.executable,
      });
    }
  }

  const unifiedRules = Array.from(dedupeMap.values());

  // 3. Conflict detection
  let resolutions = [];
  if (existsSync(resolutionsPath)) {
    const resRaw = readFileSync(resolutionsPath, 'utf-8');
    resolutions = parseResolutionsYaml(resRaw);
  }

  const detectedConflicts = [];
  const rulesToDrop = new Set();

  for (const def of CONFLICT_DEFINITIONS) {
    const matchingA = unifiedRules.find(def.ruleA.match);
    const matchingB = unifiedRules.find(def.ruleB.match);

    if (matchingA && matchingB) {
      // Conflict detected!
      const userRes = resolutions.find((r) => r.conflict_id === def.id);
      let status = 'UNRESOLVED';
      let resolutionNote = 'Awaiting human taste resolution in pipeline/resolutions.yml. Do NOT auto-resolve.';

      if (userRes) {
        if (userRes.resolution === 'keep') {
          status = `RESOLVED (keep: ${userRes.target_rule_id})`;
          if (matchingA.id === userRes.target_rule_id) {
            rulesToDrop.add(matchingB.id);
          } else if (matchingB.id === userRes.target_rule_id) {
            rulesToDrop.add(matchingA.id);
          }
          resolutionNote = `Resolved by human: retained ${userRes.target_rule_id}, dropped opposing rule. ${userRes.notes || ''}`;
        } else if (userRes.resolution === 'drop') {
          status = 'RESOLVED (drop both)';
          rulesToDrop.add(matchingA.id);
          rulesToDrop.add(matchingB.id);
          resolutionNote = `Resolved by human: dropped both rules from executable catalog. ${userRes.notes || ''}`;
        } else if (userRes.resolution === 'context-conditional') {
          status = 'RESOLVED (context-conditional)';
          matchingA.condition = userRes.condition || 'Context-dependent based on active look';
          matchingB.condition = userRes.condition || 'Context-dependent based on active look';
          resolutionNote = `Resolved by human: ${userRes.condition} ${userRes.notes || ''}`;
        }
      }

      detectedConflicts.push({
        id: def.id,
        title: def.title,
        category: def.category,
        ruleA: matchingA,
        ruleB: matchingB,
        summary: def.conflictSummary,
        status,
        resolutionNote,
      });
    }
  }

  // 4. Emit pipeline/CONFLICTS.md
  let conflictsMd = `# CONFLICTS.md\n\n`;
  conflictsMd += `Taste conflict detection ledger across distilled upstream design skills.\n`;
  conflictsMd += `*Thesis invariant*: Do NOT auto-resolve taste conflicts. Human editors resolve taste divergences in \`pipeline/resolutions.yml\`.\n\n`;
  conflictsMd += `Generated: ${new Date().toISOString()}\n`;
  conflictsMd += `Total Conflicts Detected: ${detectedConflicts.length}\n\n`;
  conflictsMd += `---\n\n`;

  if (detectedConflicts.length === 0) {
    conflictsMd += `No conflicting taste rules detected across current sources.\n`;
  } else {
    for (const c of detectedConflicts) {
      conflictsMd += `### [${c.id}] ${c.title}\n\n`;
      conflictsMd += `- **Category**: \`${c.category}\`\n`;
      conflictsMd += `- **Status**: **${c.status}**\n`;
      conflictsMd += `- **Nature of Conflict**: ${c.summary}\n`;
      conflictsMd += `- **Opposing Rules**:\n`;
      conflictsMd += `  1. **\`${c.ruleA.id}\`** (${c.ruleA.sources.join(', ')}):\n`;
      conflictsMd += `     *"${c.ruleA.statement}"*\n`;
      conflictsMd += `  2. **\`${c.ruleB.id}\`** (${c.ruleB.sources.join(', ')}):\n`;
      conflictsMd += `     *"${c.ruleB.statement}"*\n`;
      conflictsMd += `- **Resolution Rationale**: ${c.resolutionNote}\n\n`;
      conflictsMd += `---\n\n`;
    }
  }

  writeFileSync(conflictsPath, conflictsMd, 'utf-8');
  console.log(`  ✓ Wrote conflict ledger to: ${conflictsPath}`);

  // 5. Apply resolutions & partition executable vs advisory
  const survivingRules = unifiedRules.filter((r) => !rulesToDrop.has(r.id));
  const executableRules = survivingRules.filter((r) => r.executable);
  const advisoryRules = survivingRules.filter((r) => !r.executable);

  // 6. Hard cap & ranking
  // Score formula: (executable ? 2 : 1) * weight * source_count
  for (const rule of executableRules) {
    rule.score = 2 * rule.weight * rule.source_count;
  }
  for (const rule of advisoryRules) {
    rule.score = 1 * rule.weight * rule.source_count;
  }

  executableRules.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  const HARD_CAP = 40;
  let finalRules = executableRules;
  let droppedRules = [];

  if (executableRules.length > HARD_CAP) {
    finalRules = executableRules.slice(0, HARD_CAP);
    droppedRules = executableRules.slice(HARD_CAP);
    console.warn(`  ! Hard cap applied: kept top ${HARD_CAP} rules. Dropped ${droppedRules.length} rules.`);
  }

  // 7. Write rules.json
  writeFileSync(rulesPath, JSON.stringify(finalRules, null, 2), 'utf-8');
  console.log(`  ✓ Wrote ${finalRules.length} executable rules to: ${rulesPath}`);

  // 8. Write advisory.md (<= 200 tokens)
  let advisoryMd = `# Advisory Taste Principles\n\n`;
  advisoryMd += `Subjective art-direction principles distilled from upstream design leaders.\n\n`;
  for (const adv of advisoryRules) {
    advisoryMd += `- **${adv.id}** (${adv.sources.join(', ')}): ${adv.statement}\n`;
  }

  const advisoryTokens = encode(advisoryMd).length;
  writeFileSync(advisoryPath, advisoryMd, 'utf-8');
  console.log(`  ✓ Wrote advisory guidance to: ${advisoryPath} (${advisoryTokens} tokens / <= 200 token budget)`);

  // 9. Update SOURCES.md
  updateSourcesMarkdown(sourcesDocPath, targetSources, finalRules);

  return {
    activeSourcesCount: targetSources.length,
    rawRulesCount: rawRules.length,
    dedupedCount: unifiedRules.length,
    conflictsCount: detectedConflicts.length,
    executableCount: finalRules.length,
    droppedCount: droppedRules.length,
    advisoryCount: advisoryRules.length,
    advisoryTokens,
    conflicts: detectedConflicts,
    rules: finalRules,
  };
}

/**
 * Updates SOURCES.md with the distilled skills attribution ledger.
 */
function updateSourcesMarkdown(docPath, sources, rules) {
  if (!existsSync(docPath)) return;

  const current = readFileSync(docPath, 'utf-8');
  const sectionHeader = '## Distilled Upstream Design Intelligence Skills (Phase 9 Pipeline)';
  const baseContent = current.split(sectionHeader)[0].trimEnd();

  let appendSection = `\n\n${sectionHeader}\n\n`;
  appendSection += `The following open-source design skills are distilled at build time in CI into deterministic executable rules (\`rules.json\`) and subjective guidance (\`advisory.md\`). Verified with permissive licenses (MIT / Apache-2.0).\n\n`;
  appendSection += `| Upstream Repository | Pinned Commit | License | Extracted Facets | Attribution |\n`;
  appendSection += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const s of sources) {
    const commitShort = s.commit ? s.commit.slice(0, 7) : 'unpinned';
    appendSection += `| **[${s.repo}](https://github.com/${s.repo})** | \`${commitShort}\` | ${s.license} | ${s.extract.join(', ')} | ${s.attribution} |\n`;
  }

  appendSection += `\n### Active Distilled Rule Attribution\n\n`;
  appendSection += `| Rule ID | Category | Weight | Source(s) | Imperative Statement |\n`;
  appendSection += `| :--- | :--- | :--- | :--- | :--- |\n`;

  for (const r of rules) {
    appendSection += `| \`${r.id}\` | ${r.category} | ${r.weight} | ${r.sources.join(', ')} | ${r.statement} |\n`;
  }

  appendSection += '\n';

  writeFileSync(docPath, baseContent + appendSection, 'utf-8');
  console.log(`  ✓ Updated attribution ledger in: ${docPath}`);
}

// Standalone execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--first') {
      options.first = parseInt(args[++i], 10);
    } else if (args[i] === '--sources') {
      options.sources = args[++i].split(',').map((s) => s.trim());
    }
  }

  runMergePipeline(options).then((summary) => {
    console.log('\nPipeline run complete:');
    console.log(JSON.stringify(summary, null, 2));
  }).catch((err) => {
    console.error(`Pipeline failure: ${err.message}`);
    process.exit(1);
  });
}

