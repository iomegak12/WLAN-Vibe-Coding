const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {
  validate,
  validateQuery,
  validateParams,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} = require('../validators/user.validator');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/authorize.middleware');
const { PERMISSIONS } = require('../utils/constants');

/**
 * User Management Routes
 * Base path: /api/v1/users
 * All routes require authentication
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create new user
 *     description: Create a new user account (requires USERS_CREATE permission)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - roleId
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               roleId:
 *                 type: string
 *                 example: 695f548f865bbca8d88e2b89
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Insufficient permissions
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  authenticate,
  authorize([PERMISSIONS.USERS_CREATE]),
  validate(createUserSchema),
  userController.createUser
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users
 *     description: Get paginated list of users with search and filters (requires USERS_READ permission)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *         description: Filter by role ID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [firstName, lastName, email, createdAt]
 *           default: firstName
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/',
  authenticate,
  authorize([PERMISSIONS.USERS_READ]),
  validateQuery(listUsersQuerySchema),
  userController.listUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed user information (requires USERS_READ permission)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_READ]),
  validateParams(userIdParamSchema),
  userController.getUserById
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update user information (requires USERS_UPDATE permission)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.put(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateParams(userIdParamSchema),
  validate(updateUserSchema),
  userController.updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user account (requires USERS_DELETE permission)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.USERS_DELETE]),
  validateParams(userIdParamSchema),
  userController.deleteUser
);

/**
 * @swagger
 * /api/v1/users/{id}/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Change password for a user (users can change their own password)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       403:
 *         description: Cannot change other user's password
 */
router.patch(
  '/:id/change-password',
  authenticate,
  validateParams(userIdParamSchema),
  validate(changePasswordSchema),
  userController.changePassword
);

/**
 * @swagger
 * /api/v1/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status
 *     description: Activates or deactivates a user account. Requires USERS_UPDATE permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                 message:
 *                   type: string
 *                   example: "User status updated successfully"
 *       403:
 *         description: Forbidden - User lacks USERS_UPDATE permission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:id/toggle-status',
  authenticate,
  authorize([PERMISSIONS.USERS_UPDATE]),
  validateParams(userIdParamSchema),
  userController.toggleUserStatus
);

module.exports = router;
