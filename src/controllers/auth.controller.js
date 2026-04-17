const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

class AuthController {
  constructor() {
    this.signup = this.signup.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
  }


  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN}
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN}
    );

    return { accessToken, refreshToken };
  }


  async signup(req, res) {
    const client = await db.pool.connect();
    try {
      const { name, email, password, phone_number } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      }

      await client.query('BEGIN');

      const userExists = await client.query('SELECT id FROM tender.users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const displayId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const newUser = await client.query(
        `INSERT INTO tender.users (name, email, password, phone_number, display_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, display_id, phone_number`,
        [name, email, hashedPassword, phone_number || null, displayId]
      );

      const userId = newUser.rows[0].id;
      let roleResult = await client.query('SELECT id FROM tender.roles WHERE role_name = $1', ['STANDARD USER']);
      let roleId = roleResult.rows[0]?.id;

      if (!roleId) {
        const newRole = await client.query("INSERT INTO tender.roles (role_name) VALUES ($1) RETURNING id", ['STANDARD USER']);
        roleId = newRole.rows[0].id;
      }

      await client.query('INSERT INTO tender.user_role_access (user_id, role_id) VALUES ($1, $2)', [userId, roleId]);


      const { accessToken, refreshToken } = this.generateTokens({ id: userId, email, roles: ['STANDARD USER'] });


      await client.query('UPDATE tender.users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token: accessToken,
          refreshToken,
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
      return res.status(500).json({ success: false, message: 'Internal server error during registration' });
    } finally {
      client.release();
    }
  }


  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const userResult = await db.query(
        `SELECT u.id, u.name, u.email, u.password, u.display_id,
                COALESCE(array_agg(r.role_name) FILTER (WHERE r.role_name IS NOT NULL AND r.life_cycle_status = 'ACTIVE'), '{}') as roles
         FROM tender.users u
         LEFT JOIN tender.user_role_access ura ON u.id = ura.user_id
         LEFT JOIN tender.roles r ON ura.role_id = r.id
         WHERE u.email = $1 AND u.life_cycle_status = 'ACTIVE'
         GROUP BY u.id`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = userResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const { accessToken, refreshToken } = this.generateTokens(user);


      await db.query('UPDATE tender.users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

      delete user.password;
      return res.status(200).json({
        success: true,
        message: 'Welcome back!',
        data: { user, token: accessToken, refreshToken }
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(500).json({ success: false, message: 'Internal server error during login' });
    }
  }


  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
      const userResult = await db.query(
        `SELECT u.id, u.name, u.email, u.display_id, u.refresh_token,
                COALESCE(array_agg(r.role_name) FILTER (WHERE r.role_name IS NOT NULL AND r.life_cycle_status = 'ACTIVE'), '{}') as roles
         FROM tender.users u
         LEFT JOIN tender.user_role_access ura ON u.id = ura.user_id
         LEFT JOIN tender.roles r ON ura.role_id = r.id
         WHERE u.id = $1 AND u.life_cycle_status = 'ACTIVE'
         GROUP BY u.id`,
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User not found or account not active' });
      }

      if (userResult.rows[0].refresh_token !== refreshToken) {
        return res.status(403).json({ success: false, message: 'Invalid refresh token' });
      }

      const user = userResult.rows[0];


      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);


      await db.query('UPDATE tender.users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

      delete user.refresh_token;

      return res.status(200).json({
        success: true,
        data: {
          token: accessToken,
          refreshToken: newRefreshToken,
          user
        }
      });
    } catch (error) {
      console.error('Refresh Token error:', error);
      return res.status(403).json({ success: false, message: 'Session expired. Please login again.' });
    }
  }
}

module.exports = new AuthController();

