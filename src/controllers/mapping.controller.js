const db = require('../config/db');

class MappingController {
  /**
   * Get mappings based on filters
   */
  async getMappings(req, res) {
    try {
      const { category_id, project_type_id, state, city } = req.query;
      
      let query = `
        SELECT m.*, f.format_name, f.format_title, f.template_pages,
               c.category_name, pt.type_name as project_type_name
        FROM tender.format_mappings m
        JOIN tender.tender_formats f ON m.format_id = f.id
        LEFT JOIN tender.tender_categories c ON m.category_id = c.id
        LEFT JOIN tender.project_types pt ON m.project_type_id = pt.id
        WHERE m.life_cycle_status = 'ACTIVE'
      `;
      
      const values = [];
      let paramCount = 1;

      if (category_id) {
        query += ` AND m.category_id = $${paramCount++}`;
        values.push(category_id);
      }
      if (project_type_id) {
        query += ` AND m.project_type_id = $${paramCount++}`;
        values.push(project_type_id);
      }
      if (state) {
        query += ` AND m.state = $${paramCount++}`;
        values.push(state);
      }
      if (city) {
        query += ` AND m.city = $${paramCount++}`;
        values.push(city);
      }

      query += ` ORDER BY m.created_at DESC`;

      const result = await db.query(query, values);
      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error fetching mappings:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch mappings' });
    }
  }

  /**
   * Create a new mapping
   */
  async createMapping(req, res) {
    try {
      const { format_id, category_id, project_type_id, state, city } = req.body;

      if (!format_id || !state || !city) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const result = await db.query(
        `INSERT INTO tender.format_mappings (format_id, category_id, project_type_id, state, city)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [format_id, category_id, project_type_id, state, city]
      );

      return res.status(201).json({ success: true, data: result.rows[0], message: 'Mapping created successfully' });
    } catch (error) {
      console.error('Error creating mapping:', error);
      return res.status(500).json({ success: false, message: 'Failed to create mapping' });
    }
  }

  /**
   * Delete (Soft) a mapping
   */
  async deleteMapping(req, res) {
    try {
      const { id } = req.params;
      const result = await db.query(
        'UPDATE tender.format_mappings SET life_cycle_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        ['INACTIVE', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Mapping not found' });
      }

      return res.status(200).json({ success: true, message: 'Mapping deleted successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to delete mapping' });
    }
  }

  /**
   * Get unique states/cities from existing mappings for dynamic filters
   */
  async getFilterOptions(req, res) {
    try {
      const states = await db.query('SELECT DISTINCT state FROM tender.format_mappings WHERE life_cycle_status = $1', ['ACTIVE']);
      const cities = await db.query('SELECT DISTINCT city FROM tender.format_mappings WHERE life_cycle_status = $1', ['ACTIVE']);
      
      return res.status(200).json({
        success: true,
        data: {
          states: states.rows.map(r => r.state),
          cities: cities.rows.map(r => r.city)
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch options' });
    }
  }
}

module.exports = new MappingController();
