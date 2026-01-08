const mongoose = require('mongoose');
const { ROLES, PERMISSIONS, COLLECTIONS } = require('../utils/constants');

/**
 * Role Model
 * Defines user roles and their associated permissions
 */

const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Role name must be at least 2 characters'],
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: function(permissions) {
          // Validate that all permissions are valid
          const validPermissions = Object.values(PERMISSIONS);
          return permissions.every(perm => validPermissions.includes(perm));
        },
        message: 'Invalid permission(s) provided',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTIONS.ROLES,
  }
);

// Indexes
roleSchema.index({ isActive: 1 });

// Transform output
roleSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Role', roleSchema);
