// Twin Isles: Spot the Difference — the hand-in program.
// Node 22, standard library only. Copies game/ and screenshots/ into the
// output directory and writes dossier.json with the vendored kit library.
// Running it twice produces byte-identical output.
import { mkdirSync, readdirSync, rmSync, cpSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Make the output directory (recursive) and clear ONLY its contents:
// the grader's /output is a bind mount, so removing the directory
// itself would throw EBUSY. Every entry inside it goes instead.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

const gameDir = join(repoRoot, 'game');
cpSync(gameDir, join(outDir, 'game'), { recursive: true });

const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
