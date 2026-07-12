import 'dotenv/config';
import Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  MONGO_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .default('mongodb://127.0.0.1:27017/elevate_task'),

  JWT_ACCESS_TTL: Joi.number().integer().positive().default(3600),

  JWT_ISSUER: Joi.string().default('elevate-task'),

  JWT_AUDIENCE: Joi.string().default('elevate-task-users'),

  JWT_PRIVATE_KEY_PATH: Joi.string().default('keys/private.pem'),

  JWT_PUBLIC_KEY_PATH: Joi.string().default('keys/public.pem'),

  SMTP_HOST: Joi.string().default('smtp.ethereal.email'),

  SMTP_PORT: Joi.number().port().default(587),

  SMTP_USER: Joi.string().allow('', null),

  SMTP_PASS: Joi.string().allow('', null),

  EMAIL_FROM: Joi.string().email().default('no-reply@elevate-task.com'),

  OTP_LENGTH: Joi.number().integer().min(4).max(10).default(6),

  OTP_TTL_MINUTES: Joi.number().integer().positive().default(10),

  RATE_LIMIT_WINDOW_MS: Joi.number().integer().positive().default(900000),

  RATE_LIMIT_MAX: Joi.number().integer().positive().default(100),

  UPLOAD_DIR: Joi.string().default('uploads'),
})
  .unknown(true)
  .required();

const { value, error } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true,
});

if (error) {
  throw new Error(
    `Environment validation failed:\n${error.details
      .map((detail) => `- ${detail.message}`)
      .join('\n')}`,
  );
}

export const env = {
  nodeEnv: value.NODE_ENV,
  port: value.PORT,
  mongoUri: value.MONGO_URI,
  jwt: {
    accessTokenTtl: value.JWT_ACCESS_TTL,
    issuer: value.JWT_ISSUER,
    audience: value.JWT_AUDIENCE,
    privateKeyPath: value.JWT_PRIVATE_KEY_PATH,
    publicKeyPath: value.JWT_PUBLIC_KEY_PATH,
  },
  email: {
    host: value.SMTP_HOST,
    port: value.SMTP_PORT,
    user: value.SMTP_USER || undefined,
    pass: value.SMTP_PASS || undefined,
    from: value.EMAIL_FROM,
  },
  otp: {
    length: value.OTP_LENGTH,
    ttlMinutes: value.OTP_TTL_MINUTES,
  },
  rateLimit: {
    windowMs: value.RATE_LIMIT_WINDOW_MS,
    max: value.RATE_LIMIT_MAX,
  },
  uploadDir: value.UPLOAD_DIR,
};

export default env;
