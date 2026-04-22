const db = require('../config/db');

const normalizeText = (value) => (value || '').trim();
const normalizeForCompare = (value) => normalizeText(value).toLowerCase();

class CategoryController {

  async getTenderCategories(req, res) {
    try {
      const result = await db.query(
        'SELECT * FROM tender.tender_categories WHERE life_cycle_status = $1 ORDER BY created_at DESC',
        ['ACTIVE']
      );
    
      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tender categories',
        error: error.message
      });
    }
  }

  async createTenderCategory(req, res) {
    const userId = req.user ? req.user.id : null;
    try {
      const categoryName = normalizeText(req.body.category_name);
      const categoryDescription = normalizeText(req.body.category_description);

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: 'Category value is required'
        });
      }
      if (!categoryDescription) {
        return res.status(400).json({
          success: false,
          message: 'Category description is required'
        });
      }

      const duplicateCheck = await db.query(
        `SELECT
          EXISTS(
            SELECT 1
            FROM tender.tender_categories
            WHERE life_cycle_status = 'ACTIVE'
              AND lower(btrim(category_name)) = lower(btrim($1))
          ) AS name_exists,
          EXISTS(
            SELECT 1
            FROM tender.tender_categories
            WHERE life_cycle_status = 'ACTIVE'
              AND lower(btrim(category_description)) = lower(btrim($2))
          ) AS description_exists`,
        [categoryName, categoryDescription]
      );

      const { name_exists: nameExists, description_exists: descriptionExists } = duplicateCheck.rows[0];

      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'This category name already exists. Please use a different name.'
        });
      }

      if (descriptionExists) {
        return res.status(409).json({
          success: false,
          message: 'This category description already exists. Please use a different description.'
        });
      }

      const result = await db.query(
        `INSERT INTO tender.tender_categories (category_name, category_description, created_by)
         VALUES ($1, $2, $3) RETURNING *`,
        [categoryName, categoryDescription, userId]
      );

      return res.status(201).json({
        success: true,
        message: 'Tender category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      if (error.code === '23505') {
        const duplicateMessage = error.constraint === 'tender_categories_active_description_uq'
          ? 'This category description already exists. Please use a different description.'
          : 'This category name already exists. Please use a different name.';

        return res.status(400).json({
          success: false,
          message: duplicateMessage
        });
      }

      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating category',
        error: error.message
      });
    }
  }

  async deleteTenderCategory(req, res) {
    const userId = req.user ? req.user.id : null;
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE tender.tender_categories
         SET life_cycle_status = $1, updated_at = NOW(), updated_by = $2
         WHERE id = $3 AND life_cycle_status = 'ACTIVE'
         RETURNING id`,
        ['INACTIVE', userId, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category'
      });
    }
  }

  async updateTenderCategory(req, res) {
    const client = await db.pool.connect();
    const userId = req.user ? req.user.id : null;
    let inTransaction = false;

    try {
      const { id } = req.params;
      const categoryName = normalizeText(req.body.category_name);
      const categoryDescription = normalizeText(req.body.category_description);

      if (!categoryName) {
        return res.status(400).json({
          success: false,
          message: 'Category value is required'
        });
      }
      if (!categoryDescription) {
        return res.status(400).json({
          success: false,
          message: 'Category description is required'
        });
      }

      await client.query('BEGIN');
      inTransaction = true;

      const existingCategory = await client.query(
        `SELECT id, category_name, category_description
         FROM tender.tender_categories
         WHERE id = $1 AND life_cycle_status = 'ACTIVE'
         FOR UPDATE`,
        [id]
      );
      
      if (existingCategory.rows.length === 0) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      const currentCategory = existingCategory.rows[0];
      const isSameAsCurrent =
        normalizeForCompare(currentCategory.category_name) === normalizeForCompare(categoryName)
        && normalizeForCompare(currentCategory.category_description) === normalizeForCompare(categoryDescription);

      if (isSameAsCurrent) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(400).json({
          success: false,
          message: 'No changes found. Please modify category name or description.'
        });
      }

      const duplicateCheck = await client.query(
        `SELECT
          EXISTS(
            SELECT 1
            FROM tender.tender_categories
            WHERE life_cycle_status = 'ACTIVE'
              AND id <> $1
              AND lower(btrim(category_name)) = lower(btrim($2))
          ) AS name_exists,
          EXISTS(
            SELECT 1
            FROM tender.tender_categories
            WHERE life_cycle_status = 'ACTIVE'
              AND id <> $1
              AND lower(btrim(category_description)) = lower(btrim($3))
          ) AS description_exists`,
        [id, categoryName, categoryDescription]
      );

      const { name_exists: nameExists, description_exists: descriptionExists } = duplicateCheck.rows[0];

      if (nameExists) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(409).json({
          success: false,
          message: 'This category name already exists. Please use a different name.'
        });
      }

      if (descriptionExists) {
        await client.query('ROLLBACK');
        inTransaction = false;
        return res.status(409).json({
          success: false,
          message: 'This category description already exists. Please use a different description.'
        });
      }

      await client.query(
        `UPDATE tender.tender_categories
         SET life_cycle_status = 'INACTIVE', updated_at = NOW(), updated_by = $1
         WHERE id = $2`,
        [userId, id]
      );

      const newActiveCategory = await client.query(
        `INSERT INTO tender.tender_categories (
          category_name, category_description, life_cycle_status, created_by, updated_at
        ) VALUES ($1, $2, 'ACTIVE', $3, NULL)
        RETURNING *`,
        [categoryName, categoryDescription, userId]
      );

      await client.query('COMMIT');
      inTransaction = false;

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: newActiveCategory.rows[0]
      });
    } catch (error) {
      if (inTransaction) {
        await client.query('ROLLBACK');
      }

      if (error.code === '23505') {
        const duplicateMessage = error.constraint === 'tender_categories_active_description_uq'
          ? 'This category description already exists. Please use a different description.'
          : 'This category name already exists. Please use a different name.';

        return res.status(400).json({
          success: false,
          message: duplicateMessage
        });
      }

      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    } finally {
      client.release();
    }
  }
}


module.exports = new CategoryController();
