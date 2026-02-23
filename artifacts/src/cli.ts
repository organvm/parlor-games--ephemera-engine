import * as path from 'path';
import * as fs from 'fs';
import { renderPDF, getTemplateInfo, getAllTemplateNames } from './render';

// ============================================================
// CLI Argument Parsing
// ============================================================

interface CLIArgs {
  template: string | null;
  dataPath: string | null;
  outputPath: string | null;
  all: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CLIArgs {
  const args: CLIArgs = {
    template: null,
    dataPath: null,
    outputPath: null,
    all: false,
    help: false,
  };

  let i = 2; // skip node and script path
  while (i < argv.length) {
    const arg = argv[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--all') {
      args.all = true;
    } else if (arg === '--data' && i + 1 < argv.length) {
      args.dataPath = argv[++i];
    } else if (arg === '--out' && i + 1 < argv.length) {
      args.outputPath = argv[++i];
    } else if (!arg.startsWith('-') && !args.template) {
      args.template = arg;
    }

    i++;
  }

  return args;
}

function printUsage(): void {
  const templates = getAllTemplateNames();
  console.log(`
Ephemera Engine — Artifact Renderer
====================================

Usage: npx ts-node src/cli.ts <template> [options]

Templates:
  ${templates.join('\n  ')}

Options:
  --data <path>   Path to JSON data file (default: fixtures/<game>.json)
  --out <path>    Output PDF path (default: output/<template>.pdf)
  --all           Render all templates using fixture data
  --help, -h      Show this help message

Examples:
  npx ts-node src/cli.ts the-album
  npx ts-node src/cli.ts the-album --data fixtures/confession-album.json
  npx ts-node src/cli.ts the-dossier --out output/my-dossier.pdf
  npx ts-node src/cli.ts --all
`);
}

// ============================================================
// Data Loading
// ============================================================

function loadData(dataPath: string | null, templateName: string): Record<string, unknown> {
  const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

  if (dataPath) {
    const resolved = path.resolve(dataPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Data file not found: ${resolved}`);
    }
    return JSON.parse(fs.readFileSync(resolved, 'utf-8'));
  }

  // Infer fixture from template's game
  const info = getTemplateInfo(templateName);
  const fixturePath = path.join(fixturesDir, `${info.game}.json`);

  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture file not found: ${fixturePath}. Use --data to specify a data file.`);
  }

  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
}

// ============================================================
// Main
// ============================================================

async function renderOne(templateName: string, dataPath: string | null, outputPath: string | null): Promise<void> {
  console.log(`  Rendering: ${templateName}...`);
  const data = loadData(dataPath, templateName);
  const result = await renderPDF({
    templateName,
    data,
    outputPath: outputPath || undefined,
  });
  console.log(`  ✓ ${templateName} → ${result.path} (${(result.sizeBytes / 1024).toFixed(1)}KB)`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  if (args.all) {
    console.log('Rendering all templates...\n');
    const templates = getAllTemplateNames();
    for (const name of templates) {
      try {
        await renderOne(name, null, null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ ${name}: ${msg}`);
      }
    }
    console.log('\nDone.');
    process.exit(0);
  }

  if (!args.template) {
    printUsage();
    console.error('Error: No template specified. Use --all to render everything.\n');
    process.exit(1);
  }

  try {
    await renderOne(args.template, args.dataPath, args.outputPath);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    process.exit(1);
  }
}

main();
