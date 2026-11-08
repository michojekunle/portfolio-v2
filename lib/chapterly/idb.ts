import { get, set, del, keys } from 'idb-keyval';

/**
 * Saves a file blob to IndexedDB under a given key.
 */
export async function saveFileLocally(id: string, file: File | Blob): Promise<void> {
  await set(`local_file_${id}`, file);
}

/**
 * Retrieves a file blob from IndexedDB.
 */
export async function getLocalFile(id: string): Promise<File | Blob | undefined> {
  return await get(`local_file_${id}`);
}

/**
 * Deletes a file blob from IndexedDB.
 */
export async function deleteLocalFile(id: string): Promise<void> {
  await del(`local_file_${id}`);
}

/**
 * Gets all local file IDs stored in IndexedDB.
 */
export async function getAllLocalFileIds(): Promise<string[]> {
  const allKeys = await keys();
  return allKeys
    .filter((k) => typeof k === 'string' && k.startsWith('local_file_'))
    .map((k) => (k as string).replace('local_file_', ''));
}
