import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';

// Password strength helper
const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return { score, label: 'Too short', color: 'bg-gray-300' };
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score === 3) return { score, label: 'Fair', color: 'bg-yellow-400' };
  if (score === 4) return { score, label: 'Good', color: 'bg-blue-400' };
  if (score === 5) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Too short', color: 'bg-gray-300' };
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'freelancer',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
          'Password must be at least 8 characters, include uppercase, lowercase, number, and special character'
        )
        .required('Password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
      role: Yup.string().oneOf(['admin', 'company', 'freelancer'], 'Please select a valid role').required('Role is required'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await dispatch(register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        })).unwrap();
        toast.success('Registration successful! Please check your email for verification.', {
          position: 'top-right',
          autoClose: 3456,
        });
        navigate('/login');
      } catch (err) {
        toast.error(err.message || 'Registration failed. Please try again.', {
          position: 'top-right',
          autoClose: 3456,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordStrength = getPasswordStrength(formik.values.password);

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10 dark:before:bg-[#0a2a5c]/95">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/95 dark:bg-indigo-950/95 rounded-3xl shadow-xl p-1 sm:p-4 md:p-5 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-13  sm:mb-2" />
        <h2 className="text-xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-1 text-center">Create your SkillSync account</h2>
        <p className="text-blue-900/70 dark:text-indigo-200 mb-1 sm:mb-6 text-center text-sm sm:text-base">
          Sign up to get started and unlock your productivity.
        </p>

        <form onSubmit={formik.handleSubmit} className="w-full mt-0 flex flex-col gap-1">
          <input
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="name"
          />
          {formik.touched.name && formik.errors.name && (
            <span className="text-red-500 text-[11px] break-words max-w-full block leading-tight">{formik.errors.name}</span>
          )}

          <input
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
            name="email"
            type="email"
            placeholder="Email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="email"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-red-500 text-[11px] break-words max-w-full block leading-tight">{formik.errors.email}</span>
          )}

          <input
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
            name="password"
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {/* Password strength meter */}
          {formik.values.password && (
            <div className="w-full flex flex-col gap-1 mb-1">
              <div className="h-1 rounded transition-all duration-300" style={{ width: `${passwordStrength.score * 20}%` }}>
                <div className={`h-1 rounded ${passwordStrength.color} transition-all duration-300`} style={{ width: '100%' }}></div>
              </div>
              <span className={`text-[11px] font-semibold ${
                passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score === 3 ? 'text-yellow-600' : passwordStrength.score === 4 ? 'text-blue-600' : 'text-green-600'
              }`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
          {formik.touched.password && formik.errors.password && (
            <span className="text-red-500 text-[11px] break-words max-w-full block leading-tight px-0">{formik.errors.password}</span>
          )}

          <input
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-red-500 text-[11px] break-words max-w-full block leading-tight">{formik.errors.confirmPassword}</span>
          )}

          <select
            className="px-2 sm:px-4 py-1 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="freelancer">Freelancer</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <span className="text-red-500 text-[11px] break-words max-w-full block leading-tight">{formik.errors.role}</span>
          )}

          <button
            type="submit"
            className="w-full py-1 sm:py-3 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || submitting}
          >
            {loading || submitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-2 sm:mt-4 text-blue-900/70 dark:text-indigo-200 text-center text-xs sm:text-base">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 dark:text-indigo-300 hover:underline font-semibold transition-all">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
