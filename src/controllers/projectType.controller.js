const db = require('../config/db');

class ProjectTypeController {
  /**
   * Get all active project types
   */
  async getProjectTypes(req, res) {
    try {
      const result = await db.query(
        'SELECT * FROM tender.project_types WHERE life_cycle_status = $1 ORDER BY type_name ASC',
        ['ACTIVE']
      );

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching project types:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project types',
        error: error.message
      });
    }
  }

  /**
   * Create a new project type
   */
  async createProjectType(req, res) {
    try {
      const { type_name } = req.body;

      if (!type_name) {
        return res.status(400).json({
          success: false,
          message: 'Project type name is required'
        });
      }

      // Check if already exists
      const existing = await db.query(
        'SELECT id FROM tender.project_types WHERE type_name = $1',
        [type_name]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This project type already exists'
        });
      }

      const result = await db.query(
        `INSERT INTO tender.project_types (type_name) 
         VALUES ($1) RETURNING *`,
        [type_name]
      );

      return res.status(201).json({
        success: true,
        message: 'Project type created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating project type:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating project type',
        error: error.message
      });
    }
  }

  /**
   * Update a project type
   */
  async updateProjectType(req, res) {
    try {
      const { id } = req.params;
      const { type_name } = req.body;

      if (!type_name) {
        return res.status(400).json({
          success: false,
          message: 'Project type name is required'
        });
      }

      const result = await db.query(
        `UPDATE tender.project_types 
         SET type_name = $1, updated_at = NOW() 
         WHERE id = $2 RETURNING *`,
        [type_name, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project type not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project type updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating project type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project type',
        error: error.message
      });
    }
  }

  /**
   * Soft delete a project type (Inactivate)
   */
  async deleteProjectType(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'UPDATE tender.project_types SET life_cycle_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        ['INACTIVE', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Project type not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Project type deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project type'
      });
    }
  }
}

module.exports = new ProjectTypeController();
