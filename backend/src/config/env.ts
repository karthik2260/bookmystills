export const ENV = {
  OTP_EXPIRY_TIME: parseInt(process.env.OTP_EXPIRY_TIME || '300000'),
  RESEND_COOLDOWN: parseInt(process.env.RESEND_COOLDOWN || '60000'),
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE || '604800000'),
};