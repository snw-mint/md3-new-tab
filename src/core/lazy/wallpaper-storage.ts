import { WALLPAPER_STORE_NAME, openWallpaperDB } from '../boot/wallpaper-render';

export async function saveWallpaperToDB(fileOrBlob: Blob | File, keyName = 'custom_wallpaper'): Promise<boolean> {
  const db = await openWallpaperDB();

  await new Promise<void>((resolve, reject) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WALLPAPER_STORE_NAME);
    const request = store.put(fileOrBlob, keyName);

    request.onsuccess = done;
    transaction.oncomplete = done;
    transaction.onerror = () => reject(transaction.error || new Error('INDEXED_DB_WRITE_ERROR'));
    request.onerror = () => reject(request.error || new Error('INDEXED_DB_WRITE_ERROR'));
  });

  return true;
}

export async function deleteWallpaperFromDB(keyName = 'custom_wallpaper'): Promise<boolean> {
  const db = await openWallpaperDB();

  await new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction([WALLPAPER_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WALLPAPER_STORE_NAME);
    const request = store.delete(keyName);

    request.onsuccess = () => resolve(true);
    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error || new Error('INDEXED_DB_DELETE_ERROR'));
    request.onerror = () => reject(request.error || new Error('INDEXED_DB_DELETE_ERROR'));
  });

  return true;
}
