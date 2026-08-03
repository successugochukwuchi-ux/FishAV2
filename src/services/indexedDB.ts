import { GenerationProject, ScriptChunk, CustomVoiceModel } from '../types';

const DB_NAME = 'FishAudioTTSDB';
const DB_VERSION = 1;

export class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects Store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Chunks Store
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('projectId', 'projectId', { unique: false });
        }

        // Custom Models Store
        if (!db.objectStoreNames.contains('custom_models')) {
          db.createObjectStore('custom_models', { keyPath: 'id' });
        }

        // Favorites Store
        if (!db.objectStoreNames.contains('favorites')) {
          db.createObjectStore('favorites', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Project Operations ---

  async saveProject(project: GenerationProject): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['projects', 'chunks'], 'readwrite');
      const projectStore = tx.objectStore('projects');
      const chunkStore = tx.objectStore('chunks');

      // Clone project for storage (blobs store fine in IDB)
      const projectData = { ...project };
      projectStore.put(projectData);

      // Save each chunk
      project.chunks.forEach((chunk) => {
        const chunkData = {
          ...chunk,
          projectId: project.id,
        };
        chunkStore.put(chunkData);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllProjects(): Promise<GenerationProject[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const index = store.index('createdAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const projects = (request.result || []).reverse(); // latest first
        resolve(projects);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProjectById(id: string): Promise<GenerationProject | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteProject(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['projects', 'chunks'], 'readwrite');
      const projectStore = tx.objectStore('projects');
      const chunkStore = tx.objectStore('chunks');

      // Delete the project
      projectStore.delete(id);

      // Get associated chunk keys and delete them
      const chunkIndex = chunkStore.index('projectId');
      const getAllReq = chunkIndex.getAllKeys(id);

      getAllReq.onsuccess = () => {
        const keys = getAllReq.result || [];
        keys.forEach((key) => chunkStore.delete(key));
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteProjects(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['projects', 'chunks'], 'readwrite');
      const projectStore = tx.objectStore('projects');
      const chunkStore = tx.objectStore('chunks');

      ids.forEach((id) => {
        projectStore.delete(id);
      });

      // Clear matching chunks
      const chunkReq = chunkStore.getAll();
      chunkReq.onsuccess = () => {
        const allChunks = chunkReq.result || [];
        allChunks.forEach((c: any) => {
          if (ids.includes(c.projectId)) {
            chunkStore.delete(c.id);
          }
        });
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearAllProjects(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['projects', 'chunks'], 'readwrite');
      const projectStore = tx.objectStore('projects');
      const chunkStore = tx.objectStore('chunks');

      projectStore.clear();
      chunkStore.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Chunk Operations ---

  async saveChunk(projectId: string, chunk: ScriptChunk): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('chunks', 'readwrite');
      const store = tx.objectStore('chunks');
      store.put({
        ...chunk,
        projectId
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getChunksByProjectId(projectId: string): Promise<ScriptChunk[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('chunks', 'readonly');
      const store = tx.objectStore('chunks');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const chunks = (request.result || []).sort((a, b) => a.index - b.index);
        resolve(chunks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- Custom Models Operations ---

  async saveCustomModel(model: CustomVoiceModel): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_models', 'readwrite');
      const store = tx.objectStore('custom_models');
      store.put(model);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getCustomModels(): Promise<CustomVoiceModel[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_models', 'readonly');
      const store = tx.objectStore('custom_models');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCustomModel(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_models', 'readwrite');
      const store = tx.objectStore('custom_models');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- Favorites Operations ---

  async toggleFavoriteVoice(voiceId: string): Promise<boolean> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('favorites', 'readwrite');
      const store = tx.objectStore('favorites');
      const getReq = store.get(voiceId);

      getReq.onsuccess = () => {
        if (getReq.result) {
          store.delete(voiceId);
          tx.oncomplete = () => resolve(false);
        } else {
          store.put({ id: voiceId, addedAt: Date.now() });
          tx.oncomplete = () => resolve(true);
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async getFavoriteVoiceIds(): Promise<string[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('favorites', 'readonly');
      const store = tx.objectStore('favorites');
      const request = store.getAllKeys();
      request.onsuccess = () => resolve((request.result || []).map(k => String(k)));
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new IndexedDBService();
