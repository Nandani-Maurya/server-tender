const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      return successResponse(res, 'Profile fetched successfully', user);
    } catch (error) {
      return errorResponse(res, error.message, 404, error);
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, 'Profile updated successfully', user);
    } catch (error) {
      return errorResponse(res, error.message, 400, error);
    }
  }
}

module.exports = new UserController();
