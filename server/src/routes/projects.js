const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

const MAX_VERSIONS = 5;

/**
 * GET /api/projects
 * Get all projects for authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const projects = await query(
      'SELECT id, name, board, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', [
  param('id').isUUID()
], async (req, res) => {
  try {
    const projects = await query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: projects[0] });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', [
  body('name').trim().notEmpty().isLength({ max: 255 }),
  body('blocklyXml').optional().default(''),
  body('generatedCode').optional().default(''),
  body('board').optional().default('arduino:avr:uno')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, blocklyXml, generatedCode, board } = req.body;
    const projectId = uuidv4();

    await query(
      'INSERT INTO projects (id, user_id, name, blockly_xml, generated_code, board) VALUES (?, ?, ?, ?, ?, ?)',
      [projectId, req.user.id, name, blocklyXml || '', generatedCode || '', board]
    );

    // Create initial version
    await createVersion(projectId, blocklyXml || '', generatedCode || '');

    const projects = await query('SELECT * FROM projects WHERE id = ?', [projectId]);

    res.status(201).json({ project: projects[0] });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ max: 255 }),
  body('blocklyXml').optional(),
  body('generatedCode').optional(),
  body('board').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify ownership
    const existing = await query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { name, blocklyXml, generatedCode, board } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (blocklyXml !== undefined) {
      updates.push('blockly_xml = ?');
      values.push(blocklyXml);
    }
    if (generatedCode !== undefined) {
      updates.push('generated_code = ?');
      values.push(generatedCode);
    }
    if (board !== undefined) {
      updates.push('board = ?');
      values.push(board);
    }

    if (updates.length > 0) {
      values.push(req.params.id);
      await query(
        `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Create version if code changed
      if (blocklyXml !== undefined || generatedCode !== undefined) {
        const project = await query('SELECT blockly_xml, generated_code FROM projects WHERE id = ?', [req.params.id]);
        await createVersion(req.params.id, project[0].blockly_xml, project[0].generated_code);
      }
    }

    const projects = await query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

    res.json({ project: projects[0] });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', [
  param('id').isUUID()
], async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * GET /api/projects/:id/versions
 * Get version history for a project
 */
router.get('/:id/versions', [
  param('id').isUUID()
], async (req, res) => {
  try {
    // Verify ownership
    const project = await query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const versions = await query(
      'SELECT id, created_at FROM project_versions WHERE project_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

/**
 * GET /api/projects/:id/versions/:versionId
 * Get a specific version
 */
router.get('/:id/versions/:versionId', [
  param('id').isUUID(),
  param('versionId').isUUID()
], async (req, res) => {
  try {
    // Verify ownership
    const project = await query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const versions = await query(
      'SELECT * FROM project_versions WHERE id = ? AND project_id = ?',
      [req.params.versionId, req.params.id]
    );

    if (versions.length === 0) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json({ version: versions[0] });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ error: 'Failed to fetch version' });
  }
});

/**
 * Helper: Create a version snapshot
 */
async function createVersion(projectId, blocklyXml, generatedCode) {
  const versionId = uuidv4();
  
  await query(
    'INSERT INTO project_versions (id, project_id, blockly_xml, generated_code) VALUES (?, ?, ?, ?)',
    [versionId, projectId, blocklyXml, generatedCode]
  );

  // Clean up old versions (keep only MAX_VERSIONS)
  const versions = await query(
    'SELECT id FROM project_versions WHERE project_id = ? ORDER BY created_at DESC',
    [projectId]
  );

  if (versions.length > MAX_VERSIONS) {
    const toDelete = versions.slice(MAX_VERSIONS).map(v => v.id);
    await query(
      `DELETE FROM project_versions WHERE id IN (${toDelete.map(() => '?').join(',')})`,
      toDelete
    );
  }

  return versionId;
}

module.exports = router;
