const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password, phone_number } = req.body;

      // Check if user already exists
      const userExists = await db.query('SELECT * FROM tender.users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate a simple display_id (since it's required)
      const displayId = `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Insert user
      const newUser = await db.query(
        `INSERT INTO tender.users (name, email, password, phone_number, display_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, display_id`,
        [name, email, hashedPassword, phone_number, displayId]
      );

      const userId = newUser.rows[0].id;

      // Assign default role (e.g., 'user' or based on name if admin)
      // First, let's find the 'user' role id from roles table
      let roleResult = await db.query('SELECT id FROM tender.roles WHERE role_name = $1', ['USER']);

      // If 'USER' role doesn't exist, maybe create it or use first one?
      // Usually, we expect roles to exist.
      if (roleResult.rows.length === 0) {
        // For now, let's assume roles will be seeded. If not, we might need a fallback.
        // But in production, roles should be predefined.
      } else {
        const roleId = roleResult.rows[0].id;
        await db.query(
          'INSERT INTO tender.user_role_access (user_id, role_id) VALUES ($1, $2)',
          [userId, roleId]
        );
      }

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: newUser.rows[0]
      });
    } catch (error) {
      console.error('Signup Error:', error);
      return res.status(400).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      const userResult = await db.query(
        `SELECT u.*, array_agg(r.role_name) as roles
         FROM tender.users u
         LEFT JOIN tender.user_role_access ura ON u.id = ura.user_id
         LEFT JOIN tender.roles r ON ura.role_id = r.id
         WHERE u.email = $1
         GROUP BY u.id`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: process.env.NODE_ENV === 'development' ? null : undefined
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          roles: user.roles || []
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Remove password from returned user object
      delete user.password;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, token }
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(401).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}

module.exports = new AuthController();
