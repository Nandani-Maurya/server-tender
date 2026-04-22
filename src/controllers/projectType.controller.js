const db = require('../config/db');

const normalizeText = (value) => (value || '').trim();
const normalizeForCompare = (value) => normalizeText(value).toLowerCase();

class ProjectTypeController {
  async getProjectTypes(req, res) {
    try {
      const result = await db.query(
        'SELECT * FROM tender.project_types WHERE life_cycle_status = $1 ORDER BY created_at DESC',
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

  async createProjectType(req, res) {
    const userId = req.user ? req.user.id : null;

    try {
      const typeName = normalizeText(req.body.type_name);

      if (!typeName) {
        return res.status(400).json({
          success: false,
          message: 'Project type name is required'
        });
      }

      const duplicateCheck = await db.query(
        `SELECT EXISTS(
          SELECT 1
          FROM tender.project_types
          WHERE life_cycle_status = 'ACTIVE'
            AND lower(btrim(type_name)) = lower(btrim($1))
        ) AS type_exists`,
        [typeName]
      );

      if (duplicateCheck.rows[0]?.type_exists) {
        return res.status(409).json({
          success: false,
          message: 'This project type already exists'
        });
      }

      const result = await db.query(
        `INSERT INTO tender.project_types (
          record_uid, type_name, created_by, created_at, updated_at, life_cycle_status
        )
         VALUES (nextval('tender.project_types_record_uid_seq'), $1, $2, NOW(), NULL, 'ACTIVE')
         RETURNING *`,
        [typeName, userId]
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

  async updateProjectType(req, res) {
    const client = await db.pool.connect();
    const userId = req.user ? req.user.id : null;
    let inTransaction = false;

    try {
      const { id } = req.params;
      const typeName = normalizeText(req.body.type_name);

      if (!typeName) {
        return res.status(400).json({
          success: false,
          message: 'Project type name is required'
        });
      }

      await client.query('BEGIN');
      inTransaction = true;

      const existingType = await client.query(
        `SELECT id, record_uid, type_name
         FROM tender.project_types
         WHERE id = $1 AND life_cycle_status = 'ACTIVE'
         FOR UPDATE`,
        [id]
      );

      if (existingType.rows.length === 0) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(404).json({
          success: false,
          message: 'Project type not found'
        });
      }

      const currentType = existingType.rows[0];
      const isSameAsCurrent =
        normalizeForCompare(currentType.type_name) === normalizeForCompare(typeName);

      if (isSameAsCurrent) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(400).json({
          success: false,
          message: 'No changes found. Please modify project type name.'
        });
      }

      const duplicateCheck = await client.query(
        `SELECT EXISTS(
          SELECT 1
          FROM tender.project_types
          WHERE life_cycle_status = 'ACTIVE'
            AND id <> $1
            AND lower(btrim(type_name)) = lower(btrim($2))
        ) AS type_exists`,
        [id, typeName]
      );

      if (duplicateCheck.rows[0]?.type_exists) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(409).json({
          success: false,
          message: 'This project type already exists'
        });
      }

      await client.query(
        `UPDATE tender.project_types
         SET life_cycle_status = 'INACTIVE', updated_at = NOW(), updated_by = $1
         WHERE id = $2`,
        [userId, id]
      );

      const result = await client.query(
        `INSERT INTO tender.project_types (
          record_uid, type_name, life_cycle_status, created_by, created_at, updated_at
        ) VALUES ($1, $2, 'ACTIVE', $3, NOW(), NULL)
        RETURNING *`,
        [currentType.record_uid, typeName, userId]
      );

      await client.query('COMMIT');
      inTransaction = false;

      return res.status(200).json({
        success: true,
        message: 'Project type updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'This project type already exists'
        });
      }

      if (inTransaction) {
        await client.query('ROLLBACK');
      }

      console.error('Error updating project type:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project type',
        error: error.message
      });
    } finally {
      client.release();
    }
  }

  async deleteProjectType(req, res) {
    const userId = req.user ? req.user.id : null;

    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE tender.project_types
         SET life_cycle_status = $1, updated_at = NOW(), updated_by = $2
         WHERE id = $3 AND life_cycle_status = 'ACTIVE'
         RETURNING id`,
        ['INACTIVE', userId, id]
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
