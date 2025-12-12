// Key management utilities for SFS
// Uses localStorage for key storage (task specifies localStorage / indexedDB, localStorage used for simplicity)

export interface KeyEntry {
  fileId: string;
  key: string;
  fileName?: string;
  timestamp: number;
}

// Store a key in localStorage
export function storeKey(fileId: string, key: string, fileName?: string): void {
  const entry: KeyEntry = {
    fileId,
    key,
    fileName,
    timestamp: Date.now(),
  };
  localStorage.setItem(`sfs_key_${fileId}`, JSON.stringify(entry));
}

// Retrieve a key from localStorage
export function getKey(fileId: string): string | null {
  const stored = localStorage.getItem(`sfs_key_${fileId}`);
  if (stored) {
    const entry: KeyEntry = JSON.parse(stored);
    return entry.key;
  }
  return null;
}

// Get all stored keys
export function getAllKeys(): KeyEntry[] {
  const keys: KeyEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sfs_key_')) {
      const stored = localStorage.getItem(key);
      if (stored) {
        keys.push(JSON.parse(stored));
      }
    }
  }
  return keys;
}

// Delete a key
export function deleteKey(fileId: string): void {
  localStorage.removeItem(`sfs_key_${fileId}`);
}

// Export a key as a downloadable file
export function exportKey(key: string, fileName: string = 'encryption_key.txt'): void {
  const blob = new Blob([key], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import a key from a file (for future use)
export function importKey(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const key = e.target?.result as string;
      resolve(key.trim());
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}