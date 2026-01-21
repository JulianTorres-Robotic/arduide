/**
 * Cloud Storage - Wrapper for ArduIDE API
 * This replaces the Supabase cloud storage with the custom backend
 */

import { projectsApi, compileApi, authApi, type Project, type ProjectVersion } from './api-client';

// Re-export types with adapted names for compatibility
export interface CloudProject {
  id: string;
  user_id: string;
  name: string;
  blockly_xml: string;
  generated_code: string;
  board: string;
  created_at: string;
  updated_at: string;
}

export interface CloudProjectVersion {
  id: string;
  project_id: string;
  blockly_xml: string;
  generated_code: string;
  created_at: string;
}

// ============================================
// Authentication Helpers
// ============================================

export const isAuthenticated = async (): Promise<boolean> => {
  return authApi.isAuthenticated();
};

export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await authApi.getCurrentUser();
  return user?.id || null;
};

// ============================================
// Project CRUD Operations
// ============================================

export const createCloudProject = async (
  name: string,
  blocklyXml: string,
  generatedCode: string,
  board: string
): Promise<CloudProject | null> => {
  try {
    const project = await projectsApi.create({
      name,
      blocklyXml,
      generatedCode,
      board,
    });
    return project as CloudProject;
  } catch (error) {
    console.error('Error creating cloud project:', error);
    return null;
  }
};

export const getCloudProject = async (id: string): Promise<CloudProject | null> => {
  try {
    const project = await projectsApi.getById(id);
    return project as CloudProject;
  } catch (error) {
    console.error('Error fetching cloud project:', error);
    return null;
  }
};

export const getAllCloudProjects = async (): Promise<CloudProject[]> => {
  try {
    const projects = await projectsApi.getAll();
    return projects as CloudProject[];
  } catch (error) {
    console.error('Error fetching cloud projects:', error);
    return [];
  }
};

export const updateCloudProject = async (
  id: string,
  updates: Partial<Pick<CloudProject, 'name' | 'blockly_xml' | 'generated_code' | 'board'>>
): Promise<CloudProject | null> => {
  try {
    // Convert snake_case to camelCase for API
    const apiUpdates: {
      name?: string;
      blocklyXml?: string;
      generatedCode?: string;
      board?: string;
    } = {};

    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.blockly_xml !== undefined) apiUpdates.blocklyXml = updates.blockly_xml;
    if (updates.generated_code !== undefined) apiUpdates.generatedCode = updates.generated_code;
    if (updates.board !== undefined) apiUpdates.board = updates.board;

    const project = await projectsApi.update(id, apiUpdates);
    return project as CloudProject;
  } catch (error) {
    console.error('Error updating cloud project:', error);
    return null;
  }
};

export const deleteCloudProject = async (id: string): Promise<boolean> => {
  try {
    await projectsApi.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting cloud project:', error);
    return false;
  }
};

// ============================================
// Version Management
// ============================================

export const createCloudVersion = async (
  projectId: string,
  blocklyXml: string,
  generatedCode: string
): Promise<CloudProjectVersion | null> => {
  // Versions are created automatically when updating projects
  // This is a no-op for compatibility
  console.log('Version created automatically with project update');
  return null;
};

export const getCloudProjectVersions = async (projectId: string): Promise<CloudProjectVersion[]> => {
  try {
    const versions = await projectsApi.getVersions(projectId);
    return versions as CloudProjectVersion[];
  } catch (error) {
    console.error('Error fetching cloud versions:', error);
    return [];
  }
};

// ============================================
// Sync Local Project to Cloud
// ============================================

export const syncProjectToCloud = async (
  localProject: {
    id?: string;
    name: string;
    blocklyXml: string;
    generatedCode: string;
    board: string;
  },
  cloudProjectId?: string
): Promise<CloudProject | null> => {
  if (cloudProjectId) {
    return updateCloudProject(cloudProjectId, {
      name: localProject.name,
      blockly_xml: localProject.blocklyXml,
      generated_code: localProject.generatedCode,
      board: localProject.board,
    });
  } else {
    return createCloudProject(
      localProject.name,
      localProject.blocklyXml,
      localProject.generatedCode,
      localProject.board
    );
  }
};

// ============================================
// Compile API
// ============================================

export interface CompileResult {
  success: boolean;
  hex?: string;
  output?: string;
  error?: string;
}

export const compileArduinoCode = async (
  code: string,
  board: string
): Promise<CompileResult> => {
  try {
    const result = await compileApi.compile(code, board);
    return result;
  } catch (error) {
    console.error('Compile request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to compile code',
    };
  }
};
