import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '../../api/auth';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      if (!token) {
        setError('Invalid reset token');
        toast.error('Invalid reset token. Please check your email link.', {
          position: 'top-right',
          autoClose: 3456,
        });
        setSubmitting(false);
        return;
      }
      try {
        await resetPassword({ token, password: values.password });
        setSuccess(true);
        toast.success('Password reset successfully! You can now login with your new password.', {
          position: 'top-right',
          autoClose: 3456,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Password reset failed';
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
        {success ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Password Reset Success</h2>
            <div className="w-full mb-2 text-xs sm:text-sm text-green-700 bg-green-100 dark:bg-green-900/40 rounded px-3 py-2 text-center">
              Your password has been successfully reset.
            </div>
            <button
              className="w-full py-2 sm:py-3 mt-2 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Reset Password</h2>
            {error && <div className="w-full mb-2 text-xs sm:text-sm text-red-600 bg-red-100 dark:bg-red-900/40 rounded px-3 py-2 text-center">{error}</div>}
            {!token ? (
              <div className="w-full mb-2 text-xs sm:text-sm text-red-600 bg-red-100 dark:bg-red-900/40 rounded px-3 py-2 text-center">
                Invalid or missing reset token. Please make sure you're using the correct link from your email.
              </div>
            ) : (
              <>
                <p className="text-center text-sm sm:text-base mb-4">
                  Please enter your new password below.
                </p>
                <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-1">
                  <input
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
                    name="password"
                    type="password"
                    placeholder="New Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete="new-password"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <span className="text-red-500 text-xs">{formik.errors.password}</span>
                  )}
                  <input
                    className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm New Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    autoComplete="new-password"
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <span className="text-red-500 text-xs">{formik.errors.confirmPassword}</span>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 sm:py-3 mt-2 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
