import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const requireFromApp = createRequire(join(root, 'app', 'package.json'));
const sharp = requireFromApp('sharp');

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function moveSource(input, output) {
  await mkdir(dirname(output), { recursive: true });
  if (await exists(input)) {
    await rename(input, output);
  }
  if (!(await exists(output))) {
    throw new Error(`Missing source asset: ${input}`);
  }
}

async function replaceRequired(path, replacements) {
  let source = await readFile(path, 'utf8');
  for (const [from, to] of replacements) {
    if (!source.includes(from)) {
      throw new Error(`Expected source fragment not found in ${path}: ${from}`);
    }
    source = source.replace(from, to);
  }
  await writeFile(path, source);
}

const decorAssets = [
  { name: 'care-milk', size: 320 },
  { name: 'care-sleep', size: 320 },
  { name: 'care-diaper', size: 128 },
  { name: 'care-clock', size: 128 },
];

for (const { name, size } of decorAssets) {
  const publicPng = join(root, 'app', 'public', 'assets', 'decor', `${name}.png`);
  const sourcePng = join(root, 'app', 'assets-source', 'decor', `${name}.png`);
  const publicWebp = join(root, 'app', 'public', 'assets', 'decor', `${name}.webp`);
  await moveSource(publicPng, sourcePng);
  await sharp(sourcePng)
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78, alphaQuality: 88, effort: 6 })
    .toFile(publicWebp);
}

for (const name of ['app-icon-plant-v1.png', 'app-icon-source.png']) {
  await moveSource(
    join(root, 'app', 'public', name),
    join(root, 'app', 'assets-source', 'icons', name),
  );
}

await replaceRequired(
  join(root, 'app', 'src', 'features', 'home', 'components', 'BabyHomeView.tsx'),
  [
    [
      '<img className="haven-card-decor" src="/assets/decor/care-milk.png" alt="" aria-hidden="true" />',
      '<img className="haven-card-decor" src="/assets/decor/care-milk.webp" alt="" width={320} height={320} loading="lazy" decoding="async" aria-hidden="true" />',
    ],
    [
      '<img className="haven-card-decor" src="/assets/decor/care-sleep.png" alt="" aria-hidden="true" />',
      '<img className="haven-card-decor" src="/assets/decor/care-sleep.webp" alt="" width={320} height={320} loading="lazy" decoding="async" aria-hidden="true" />',
    ],
    [
      '<img className="haven-card-decor" src="/assets/decor/care-diaper.png" alt="" aria-hidden="true" />',
      '<img className="haven-card-decor" src="/assets/decor/care-diaper.webp" alt="" width={128} height={128} loading="lazy" decoding="async" aria-hidden="true" />',
    ],
    [
      '<img className="haven-card-decor" src="/assets/decor/care-clock.png" alt="" aria-hidden="true" />',
      '<img className="haven-card-decor" src="/assets/decor/care-clock.webp" alt="" width={128} height={128} loading="lazy" decoding="async" aria-hidden="true" />',
    ],
  ],
);

await replaceRequired(
  join(root, 'app', 'vite.config.ts'),
  [[
    "globPatterns: ['**/*.{js,css,html,svg,png,ico}'],",
    "globPatterns: [\n          '**/*.{js,css,html,svg,ico}',\n          'pwa-*.png',\n          'maskable-icon-*.png',\n          'apple-touch-icon-*.png',\n        ],",
  ]],
);

await replaceRequired(
  join(root, 'app', 'src', 'sw.ts'),
  [
    [
      "import { NavigationRoute, registerRoute } from 'workbox-routing'",
      "import { NavigationRoute, registerRoute } from 'workbox-routing'\nimport { CacheFirst } from 'workbox-strategies'",
    ],
    [
      'cleanupOutdatedCaches()\n',
      "cleanupOutdatedCaches()\n\nregisterRoute(\n  ({ request, url }) => request.destination === 'image' && url.origin === self.location.origin,\n  new CacheFirst({ cacheName: 'babygrowth-runtime-images' }),\n)\n",
    ],
  ],
);

const auditPath = join(root, 'app', 'src', 'architecture', 'performanceAudit.test.mjs');
let auditSource = await readFile(auditPath, 'utf8');
const auditInsertion = `\n  it('keeps large public images out of precache and optimizes Home decor delivery', () => {\n    const viteConfig = appFile('vite.config.ts');\n    const serviceWorker = source('sw.ts');\n    const babyHome = source('features/home/components/BabyHomeView.tsx');\n\n    expect(viteConfig).not.toContain("'**/*.{js,css,html,svg,png,ico}'");\n    expect(viteConfig).toContain("'pwa-*.png'");\n    expect(serviceWorker).toContain("new CacheFirst({ cacheName: 'babygrowth-runtime-images' })");\n    expect(babyHome).toContain('/assets/decor/care-milk.webp');\n    expect(babyHome).toContain('/assets/decor/care-sleep.webp');\n    expect(babyHome).not.toContain('/assets/decor/care-milk.png');\n    expect((babyHome.match(/decoding="async"/g) ?? [])).toHaveLength(4);\n  });\n`;
const auditEnd = auditSource.lastIndexOf('\n});\n');
if (auditEnd < 0) throw new Error('Unable to locate performance audit suite end');
auditSource = `${auditSource.slice(0, auditEnd)}${auditInsertion}${auditSource.slice(auditEnd)}`;
await writeFile(auditPath, auditSource);

await rm(join(root, '.github', 'workflows', 'optimize-home-assets.yml'));
await rm(fileURLToPath(import.meta.url));
