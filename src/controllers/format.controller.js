const db = require('../config/db');

class FormatController {
  /**
   * Get all formats with their mapping details
   */
  async getAllFormats(req, res) {
    try {
      const result = await db.query(
        `SELECT f.*, 
                c.category_name, 
                pt.type_name as project_type_name
         FROM tender.tender_formats f
         LEFT JOIN tender.tender_categories c ON f.category_id = c.id
         LEFT JOIN tender.project_types pt ON f.project_type_id = pt.id
         WHERE f.life_cycle_status = 'ACTIVE'
         ORDER BY f.format_name ASC`
      );

      return res.status(200).json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching formats:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch formats' });
    }
  }

  /**
   * Link a format to a category, project type, state, or city
   */
  async updateFormatMapping(req, res) {
    try {
      const { id } = req.params;
      const { category_id, project_type_id, state, city } = req.body;

      const result = await db.query(
        `UPDATE tender.tender_formats 
         SET category_id = $1, 
             project_type_id = $2, 
             state = $3, 
             city = $4, 
             updated_at = NOW() 
         WHERE id = $5 RETURNING *`,
        [category_id, project_type_id, state, city, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Format not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Format mapping updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating format mapping:', error);
      return res.status(500).json({ success: false, message: 'Failed to update mapping' });
    }
  }

  /**
   * Get a specific format by ID or Name
   */
  async getFormatById(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM tender.tender_formats WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Format not found' });
      }

      return res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching format' });
    }
  }
  /**
   * Update full format content (Title, Name, Pages)
   */
  async updateFormatContent(req, res) {
    try {
      const { id } = req.params;
      const { template_pages, format_title, format_name } = req.body;

      const result = await db.query(
        `UPDATE tender.tender_formats 
         SET template_pages = $1, 
             format_title = $2,
             format_name = $3,
             updated_at = NOW() 
         WHERE id = $4 RETURNING *`,
        [JSON.stringify(template_pages), format_title, format_name, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Format not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Format updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating format content:', error);
      return res.status(500).json({ success: false, message: 'Failed to update format' });
    }
  }

  /**
   * Delete (Soft) a format template
   */
  async deleteFormat(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query(
        "UPDATE tender.tender_formats SET life_cycle_status = 'INACTIVE', updated_at = NOW() WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Format not found' });
      }

      return res.status(200).json({ success: true, message: 'Format deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete format' });
    }
  }
}

module.exports = new FormatController();
