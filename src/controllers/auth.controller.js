const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

class AuthController {
  /**
   * Register a new user
   * Default role: Standard user
   */
  async signup(req, res) {
    const client = await db.pool.connect();
    try {
      const { name, email, password, phone_number } = req.body;

      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      await client.query('BEGIN');

      // Check if user already exists
      const userExists = await client.query('SELECT id FROM tender.users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Securely generate display_id
      const displayId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Insert user
      const newUser = await client.query(
        `INSERT INTO tender.users (name, email, password, phone_number, display_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, display_id, phone_number`,
        [name, email, hashedPassword, phone_number || null, displayId]
      );

      const userId = newUser.rows[0].id;

      // Ensure 'Standard user' role exists and assign it
      let roleResult = await client.query('SELECT id FROM tender.roles WHERE role_name = $1', ['STANDARD USER']);
      
      let roleId;
      if (roleResult.rows.length === 0) {
        // Create the role if it doesn't exist (production safety)
        const newRole = await client.query(
          "INSERT INTO tender.roles (role_name) VALUES ($1) RETURNING id",
          ['STANDARD USER']
        );
        roleId = newRole.rows[0].id;
      } else {
        roleId = roleResult.rows[0].id;
      }

      // Assign the role
      await client.query(
        'INSERT INTO tender.user_role_access (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId]
      );

      await client.query('COMMIT');

      // Generate JWT for immediate login after signup
      const token = jwt.sign(
        { id: userId, email, roles: ['STANDARD USER'] },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: {
            id: newUser.rows[0].id,
            name: newUser.rows[0].name,
            email: newUser.rows[0].email,
            display_id: newUser.rows[0].display_id,
            roles: ['STANDARD USER']
          }
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Signup Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Fetch user with roles
      const userResult = await db.query(
        `SELECT u.id, u.name, u.email, u.password, u.display_id, 
                COALESCE(array_agg(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), '{}') as roles
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
          message: 'Invalid credentials'
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          roles: user.roles
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Long lived for demo/production convenience, can be shorter
      );

    
      delete user.password;

      return res.status(200).json({
        success: true,
        message: 'Welcome back!',
        data: { user, token }
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AuthController();

