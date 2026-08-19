import crypto from 'crypto';

/**
 * Utility to generate a secure random OTP
 */
export const otpGenerator = {
  /**
   * Generates a numeric OTP of specified length
   * @param length Length of the OTP (default: 6)
   * @returns String containing the numeric OTP
   */
  generate(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      // Use crypto for secure random number generation
      const randomIndex = crypto.randomInt(0, digits.length);
      otp += digits[randomIndex];
    }
    return otp;
  },
};
