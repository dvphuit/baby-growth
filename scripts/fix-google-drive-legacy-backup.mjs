import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  const index = source.indexOf(before);
  if (index === -1) throw new Error(`Expected ${label} fragment was not found.`);
  if (source.indexOf(before, index + 1) !== -1) throw new Error(`Expected exactly one ${label} fragment.`);
  return source.slice(0, index) + after + source.slice(index + before.length);
}

const syncPath = 'app/src/features/sync/googleDriveSync.ts';
let sync = fs.readFileSync(syncPath, 'utf8');

sync = replaceOnce(
  sync,
  "const SYNC_FILE_NAME = 'babygrowth-sync.json';",
  "const SYNC_FILE_NAME = 'babygrowth-sync-v2.json';\nconst LEGACY_SYNC_FILE_NAME = 'babygrowth-sync.json';",
  'sync file name',
);

sync = replaceOnce(
  sync,
  `async function findSyncFile(interactive: boolean): Promise<DriveFile | null> {\n  const query = encodeURIComponent(\`'appDataFolder' in parents and name = '\${SYNC_FILE_NAME}' and trashed = false\`);\n  const result = await driveRequest<DriveFileList>(\n    \`https://www.googleapis.com/drive/v3/files?q=\${query}&spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1&fields=files(id,name,modifiedTime)\`,\n    {},\n    interactive,\n  );\n  return result.files?.[0] ?? null;\n}\n`,
  `async function findSyncFileByName(fileName: string, interactive: boolean): Promise<DriveFile | null> {\n  const query = encodeURIComponent(\`'appDataFolder' in parents and name = '\${fileName}' and trashed = false\`);\n  const result = await driveRequest<DriveFileList>(\n    \`https://www.googleapis.com/drive/v3/files?q=\${query}&spaces=appDataFolder&orderBy=modifiedTime desc&pageSize=1&fields=files(id,name,modifiedTime)\`,\n    {},\n    interactive,\n  );\n  return result.files?.[0] ?? null;\n}\n\nfunction getSyncSnapshotSchemaVersion(value: unknown): number | null {\n  if (typeof value !== 'object' || value === null || !('schemaVersion' in value)) return null;\n  const schemaVersion = value.schemaVersion;\n  return typeof schemaVersion === 'number' ? schemaVersion : null;\n}\n\nasync function findSyncFile(interactive: boolean): Promise<DriveFile | null> {\n  const currentFile = await findSyncFileByName(SYNC_FILE_NAME, interactive);\n  if (currentFile) return currentFile;\n\n  const legacyFile = await findSyncFileByName(LEGACY_SYNC_FILE_NAME, interactive);\n  if (!legacyFile) return null;\n\n  const legacyPayload = await driveRequest<unknown>(\n    \`https://www.googleapis.com/drive/v3/files/\${encodeURIComponent(legacyFile.id)}?alt=media\`,\n    {},\n    interactive,\n  );\n  if (getSyncSnapshotSchemaVersion(legacyPayload) === 1) {\n    logDiagnostic('drive-sync', 'info', 'Ignoring legacy Google Drive backup', {\n      fileId: legacyFile.id,\n      schemaVersion: 1,\n    });\n    return null;\n  }\n\n  parseSyncSnapshot(legacyPayload);\n  return legacyFile;\n}\n`,
  'sync file lookup',
);

fs.writeFileSync(syncPath, sync);

const testPath = 'app/src/features/sync/googleDriveSync.test.ts';
let test = fs.readFileSync(testPath, 'utf8');

test = replaceOnce(
  test,
  "      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'remote-1', name: 'babygrowth-sync.json' }] }))\n      .mockResolvedValueOnce(jsonResponse({ id: 'remote-1', name: 'babygrowth-sync.json' }));",
  "      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'remote-1', name: 'babygrowth-sync-v2.json' }] }))\n      .mockResolvedValueOnce(jsonResponse({ id: 'remote-1', name: 'babygrowth-sync-v2.json' }));",
  'current backup test fixture',
);

test = replaceOnce(
  test,
  `  it('rejects schema-1 backups instead of importing legacy Zustand keys', async () => {\n    const fetchMock = vi.fn()\n      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'legacy', name: 'babygrowth-sync.json' }] }))\n      .mockResolvedValueOnce(jsonResponse({ schemaVersion: 1, records: { babygrowth_v2_baby: '{}' } }));\n    vi.stubGlobal('fetch', fetchMock);\n    const sync = await import('@/features/sync/googleDriveSync');\n    await sync.requestGoogleAccessToken();\n\n    await expect(sync.checkDriveBackup()).rejects.toThrow(/generation/i);\n  });\n`,
  `  it('ignores schema-1 backups instead of failing Google login', async () => {\n    const fetchMock = vi.fn()\n      .mockResolvedValueOnce(jsonResponse({ files: [] }))\n      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'legacy', name: 'babygrowth-sync.json' }] }))\n      .mockResolvedValueOnce(jsonResponse({ schemaVersion: 1, records: { babygrowth_v2_baby: '{}' } }));\n    vi.stubGlobal('fetch', fetchMock);\n    const sync = await import('@/features/sync/googleDriveSync');\n    await sync.requestGoogleAccessToken();\n\n    await expect(sync.checkDriveBackup()).resolves.toEqual({ found: false });\n    expect(fetchMock.mock.calls[0][0]).toContain('babygrowth-sync-v2.json');\n    expect(fetchMock.mock.calls[1][0]).toContain('babygrowth-sync.json');\n    expect(fetchMock).toHaveBeenCalledTimes(3);\n  });\n\n  it('adopts a generation-2 backup that still uses the legacy filename', async () => {\n    initializeChildProfile({ childName: 'Bé Bơ', birthDate: '2026-08-01' });\n    const sync = await import('@/features/sync/googleDriveSync');\n    const legacyNamedSnapshot = sync.createSyncSnapshot();\n    const fetchMock = vi.fn()\n      .mockResolvedValueOnce(jsonResponse({ files: [] }))\n      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'legacy-v2', name: 'babygrowth-sync.json' }] }))\n      .mockResolvedValueOnce(jsonResponse(legacyNamedSnapshot))\n      .mockResolvedValueOnce(jsonResponse({ id: 'legacy-v2', name: 'babygrowth-sync-v2.json' }));\n    vi.stubGlobal('fetch', fetchMock);\n\n    const snapshot = await sync.overwriteDriveBackupWithLocalData();\n\n    expect(snapshot.data.profile.familyData.childName).toBe('Bé Bơ');\n    expect(fetchMock.mock.calls[3][0]).toContain('/upload/drive/v3/files/legacy-v2?uploadType=multipart');\n    expect(fetchMock.mock.calls[3][1]).toMatchObject({ method: 'PATCH' });\n    expect(String(fetchMock.mock.calls[3][1]?.body)).toContain('babygrowth-sync-v2.json');\n  });\n`,
  'schema-1 backup regression test',
);

fs.writeFileSync(testPath, test);

const updatedSync = fs.readFileSync(syncPath, 'utf8');
const updatedTest = fs.readFileSync(testPath, 'utf8');
if (!updatedSync.includes("const SYNC_FILE_NAME = 'babygrowth-sync-v2.json';")) throw new Error('Current sync filename was not updated.');
if (!updatedSync.includes("const LEGACY_SYNC_FILE_NAME = 'babygrowth-sync.json';")) throw new Error('Legacy sync filename fallback is missing.');
if (!updatedSync.includes('Ignoring legacy Google Drive backup')) throw new Error('Legacy schema-1 backup handling is missing.');
if (!updatedTest.includes("ignores schema-1 backups instead of failing Google login")) throw new Error('Schema-1 regression test is missing.');
if (!updatedTest.includes("adopts a generation-2 backup that still uses the legacy filename")) throw new Error('Legacy filename generation-2 test is missing.');

console.log('Google Drive legacy backup hotfix applied.');
