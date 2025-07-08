import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { forgotPassword } from '../../api/auth';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        await forgotPassword(values.email);
        setSuccess(true);
        toast.success('Password reset link has been sent to your email address!', {
          position: 'top-right',
          autoClose: 3456,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send reset link';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3456,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10 dark:before:bg-[#0a2a5c]/95">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/95 dark:bg-indigo-950/95 rounded-3xl shadow-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-14 mb-2 sm:mb-3" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Forgot Password</h2>
        {error && (
          <div className="w-full mb-2 text-xs sm:text-sm text-red-600 bg-red-100 dark:bg-red-900/40 rounded px-3 py-2 text-center">{error}</div>
        )}
        {success ? (
          <>
            <div className="w-full mb-2 text-xs sm:text-sm text-green-700 bg-green-100 dark:bg-green-900/40 rounded px-3 py-2 text-center">
              Password reset link has been sent to your email address.
            </div>
            <p className="text-center text-sm sm:text-base mb-2">Check your email and follow the instructions to reset your password.</p>
          </>
        ) : (
          <>
            <p className="text-center text-sm sm:text-base mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-1">
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
                <span className="text-red-500 text-xs">{formik.errors.email}</span>
              )}
              <button
                type="submit"
                className="w-full py-2 sm:py-3 mt-2 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
        <div className="mt-4 text-blue-900/70 dark:text-indigo-200 text-center text-xs sm:text-base">
          <Link to="/login" className="text-blue-500 dark:text-indigo-300 hover:underline font-semibold transition-all">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
