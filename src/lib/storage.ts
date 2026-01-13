import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Project {
  id: string;
  name: string;
  blocklyXml: string;
  generatedCode: string;
  board: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  blocklyXml: string;
  generatedCode: string;
  createdAt: Date;
}

interface ArduinoIDEDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-updated': Date };
  };
  versions: {
    key: string;
    value: ProjectVersion;
    indexes: { 'by-project': string; 'by-created': Date };
  };
}

const DB_NAME = 'arduino-ide-db';
const DB_VERSION = 1;
const MAX_VERSIONS = 5;

let dbInstance: IDBPDatabase<ArduinoIDEDB> | null = null;

export const getDB = async (): Promise<IDBPDatabase<ArduinoIDEDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ArduinoIDEDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Projects store
      const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('by-updated', 'updatedAt');

      // Versions store for history
      const versionStore = db.createObjectStore('versions', { keyPath: 'id' });
      versionStore.createIndex('by-project', 'projectId');
      versionStore.createIndex('by-created', 'createdAt');
    }
  });

  return dbInstance;
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Project CRUD operations
export const createProject = async (
  name: string,
  blocklyXml: string,
  generatedCode: string,
  board: string
): Promise<Project> => {
  const db = await getDB();
  const now = new Date();
  
  const project: Project = {
    id: generateId(),
    name,
    blocklyXml,
    generatedCode,
    board,
    createdAt: now,
    updatedAt: now
  };

  await db.put('projects', project);
  
  // Create initial version
  await createVersion(project.id, blocklyXml, generatedCode);
  
  return project;
};

export const getProject = async (id: string): Promise<Project | undefined> => {
  const db = await getDB();
  return db.get('projects', id);
};

export const getAllProjects = async (): Promise<Project[]> => {
  const db = await getDB();
  return db.getAllFromIndex('projects', 'by-updated');
};

export const updateProject = async (
  id: string,
  updates: Partial<Pick<Project, 'name' | 'blocklyXml' | 'generatedCode' | 'board'>>
): Promise<Project | undefined> => {
  const db = await getDB();
  const project = await db.get('projects', id);
  
  if (!project) return undefined;
  
  const updatedProject: Project = {
    ...project,
    ...updates,
    updatedAt: new Date()
  };
  
  await db.put('projects', updatedProject);
  
  // Create version snapshot if code changed
  if (updates.blocklyXml || updates.generatedCode) {
    await createVersion(
      id, 
      updates.blocklyXml || project.blocklyXml,
      updates.generatedCode || project.generatedCode
    );
  }
  
  return updatedProject;
};

export const deleteProject = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.delete('projects', id);
  
  // Delete all versions for this project
  const versions = await db.getAllFromIndex('versions', 'by-project', id);
  for (const version of versions) {
    await db.delete('versions', version.id);
  }
};

// Version management
export const createVersion = async (
  projectId: string,
  blocklyXml: string,
  generatedCode: string
): Promise<ProjectVersion> => {
  const db = await getDB();
  
  const version: ProjectVersion = {
    id: generateId(),
    projectId,
    blocklyXml,
    generatedCode,
    createdAt: new Date()
  };
  
  await db.put('versions', version);
  
  // Clean up old versions (keep only MAX_VERSIONS)
  const versions = await db.getAllFromIndex('versions', 'by-project', projectId);
  if (versions.length > MAX_VERSIONS) {
    const toDelete = versions
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, versions.length - MAX_VERSIONS);
    
    for (const v of toDelete) {
      await db.delete('versions', v.id);
    }
  }
  
  return version;
};

export const getProjectVersions = async (projectId: string): Promise<ProjectVersion[]> => {
  const db = await getDB();
  const versions = await db.getAllFromIndex('versions', 'by-project', projectId);
  return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Export/Import
export const exportProject = (project: Project): string => {
  return JSON.stringify({
    name: project.name,
    blocklyXml: project.blocklyXml,
    board: project.board,
    exportedAt: new Date().toISOString()
  }, null, 2);
};

export const importProject = async (jsonContent: string): Promise<Project> => {
  const data = JSON.parse(jsonContent);
  
  if (!data.name || !data.blocklyXml) {
    throw new Error('Invalid project file');
  }
  
  return createProject(
    data.name,
    data.blocklyXml,
    '', // Will be regenerated
    data.board || 'arduino:avr:uno'
  );
};

export const exportAsIno = (code: string, projectName: string): string => {
  const header = `// Generated by Arduino Web IDE
// Project: ${projectName}
// Date: ${new Date().toISOString()}

`;
  return header + code;
};
