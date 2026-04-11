const db = require('../config/db');

class UserService {
  async getProfile(userId) {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.phone_number, u.display_id, u.life_cycle_status,
       array_agg(r.role_name) as roles
       FROM tender.users u
       LEFT JOIN tender.user_role_access ura ON u.id = ura.user_id
       LEFT JOIN tender.roles r ON ura.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }

  async updateProfile(userId, updateData) {
    const { name, phone_number } = updateData;
    
    const result = await db.query(
      `UPDATE tender.users 
       SET name = COALESCE($1, name), 
           phone_number = COALESCE($2, phone_number),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, email, phone_number, display_id`,
      [name, phone_number, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  }
}

module.exports = new UserService();
