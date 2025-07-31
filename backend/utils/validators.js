const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = {
  isEmail: (email) => emailRegex.test(email),
  isStrongPassword: (pw) => typeof pw === 'string' && pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw),
  isRequired: (val) => val !== undefined && val !== null && val !== '',
};
