const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class AuthController {
  async signup(req, res) {
    try {
      const userData = req.body;
      const user = await authService.signup(userData);
      return successResponse(res, 'User registered successfully', user, 201);
    } catch (error) {
      console.error('Signup Error:', error);
      return errorResponse(res, error.message, 400, error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }
      const result = await authService.login(email, password);
      return successResponse(res, 'Login successful', result);
    } catch (error) {
      console.error('Login Error:', error);
      return errorResponse(res, error.message, 401, error);
    }
  }
}

module.exports = new AuthController();
