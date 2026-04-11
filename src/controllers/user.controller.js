const db = require('../config/db');

class UserController {
  async getProfile(req, res) {
    try {
      const result = await db.query(
        `SELECT u.id, u.name, u.email, u.phone_number, u.display_id, u.life_cycle_status,
         array_agg(r.role_name) as roles
         FROM tender.users u
         LEFT JOIN tender.user_role_access ura ON u.id = ura.user_id
         LEFT JOIN tender.roles r ON ura.role_id = r.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile fetched successfully',
        data: result.rows[0]
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, phone_number } = req.body;

      const result = await db.query(
        `UPDATE tender.users
         SET name = COALESCE($1, name),
             phone_number = COALESCE($2, phone_number),
             updated_at = NOW()
         WHERE id = $3
         RETURNING id, name, email, phone_number, display_id`,
        [name, phone_number, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

module.exports = new UserController();
