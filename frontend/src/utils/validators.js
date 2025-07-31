import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string()
    .oneOf(['freelancer', 'company'], 'Invalid role')
    .required('Role is required'),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

export const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
  hourlyRate: Yup.number().min(0, 'Hourly rate must be positive'),
  skills: Yup.array().of(Yup.string()),
});