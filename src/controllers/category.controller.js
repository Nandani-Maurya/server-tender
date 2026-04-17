const db = require('../config/db');

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
    try {
      const { category_name, category_description } = req.body;

      if (!category_name) {
        return res.status(400).json({
          success: false,
          message: 'Category value (short name) is required'
        });
      }


      const existing = await db.query(
        'SELECT id FROM tender.tender_categories WHERE category_name = $1',
        [category_name]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'This category value already exists'
        });
      }

      const result = await db.query(
        `INSERT INTO tender.tender_categories (category_name, category_description)
         VALUES ($1, $2) RETURNING *`,
        [category_name, category_description]
      );

      return res.status(201).json({
        success: true,
        message: 'Tender category created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error while creating category',
        error: error.message
      });
    }
  }


  async deleteTenderCategory(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        'UPDATE tender.tender_categories SET life_cycle_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        ['INACTIVE', id]
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
    try {
      const { id } = req.params;
      const { category_name, category_description } = req.body;

      if (!category_name) {
        return res.status(400).json({
          success: false,
          message: 'Category value is required'
        });
      }

      const result = await db.query(
        `UPDATE tender.tender_categories
         SET category_name = $1, category_description = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [category_name, category_description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update category',
        error: error.message
      });
    }
  }
}


module.exports = new CategoryController();
