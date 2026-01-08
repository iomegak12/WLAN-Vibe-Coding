/**
 * JWT Configuration
 * Configuration for JSON Web Token settings
 */

const jwtConfig = {
  // Access Token Configuration
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    algorithm: 'HS256',
  },

  // Refresh Token Configuration
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    algorithm: 'HS256',
  },

  // JWT Options
  options: {
    issuer: 'wlan-auth-service',
    audience: 'wlan-services',
  },
};

// Validate JWT secrets in production
if (process.env.NODE_ENV === 'production') {
  const defaultSecrets = [
    'default-access-secret-change-in-production',
    'default-refresh-secret-change-in-production',
    'your-super-secret-access-key-change-in-production',
    'your-super-secret-refresh-key-change-in-production',
  ];

  if (
    defaultSecrets.includes(jwtConfig.accessToken.secret) ||
    defaultSecrets.includes(jwtConfig.refreshToken.secret)
  ) {
    console.error('❌ FATAL ERROR: Default JWT secrets detected in production!');
    console.error('Please set strong JWT secrets in environment variables.');
    process.exit(1);
  }

  // Validate secret length (minimum 32 characters)
  if (
    jwtConfig.accessToken.secret.length < 32 ||
    jwtConfig.refreshToken.secret.length < 32
  ) {
    console.error('❌ FATAL ERROR: JWT secrets must be at least 32 characters long in production!');
    process.exit(1);
  }
}

module.exports = jwtConfig;
