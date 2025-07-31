import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { login, setCredentials } from "../../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { getUserProfile } from '../../api/users';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpUserId, setOtpUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setOtpError('');
      try {
        const result = await dispatch(login(values)).unwrap();
        // Fetch full profile and update Redux
        const userId = result.user.id || result.user._id;
        const fullProfile = await getUserProfile(userId);
        dispatch(setCredentials({ user: fullProfile, token: result.accessToken }));
        toast.success("Login successful! Welcome back!", {
          position: "top-right",
          autoClose: 3000,
        });
        if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        toast.error(
          err.message || "Login failed. Please check your credentials.",
          {
            position: "top-right",
            autoClose: 3456,
          }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10 dark:before:bg-[#0a2a5c]/95">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/95 dark:bg-indigo-950/95 rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-14 mb-2 sm:mb-3" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2">Sign in to SkillSync</h2>
        <p className="text-blue-900/70 dark:text-indigo-200 mb-4 sm:mb-6 text-center text-sm sm:text-base">Welcome back! Please enter your details.</p>
        {!otpStep ? (
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
              <span className="text-red-500 text-xs sm:text-sm">{formik.errors.email}</span>
            )}
            <input
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
              name="password"
              type="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-red-500 text-xs sm:text-sm">{formik.errors.password}</span>
            )}
            <div className="flex justify-end w-full mb-1 sm:mb-2">
              <Link to="/forgot-password" className="text-blue-500 dark:text-indigo-300 hover:underline text-xs sm:text-sm transition-all">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2 sm:py-3 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-1 animate-fadeIn">
            <label className="text-blue-900 dark:text-indigo-200 font-semibold text-base sm:text-lg text-center">Enter the 6-digit code sent to your email</label>
            <input
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-400 dark:border-gray-500 focus:border-blue-700 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 outline-none transition-all text-sm sm:text-base bg-white dark:bg-gray-900 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white w-full"
              name="otp"
              type="text"
              placeholder="------"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
            />
            {otpError && <span className="text-red-500 text-xs sm:text-sm text-center">{otpError}</span>}
            <button
              type="submit"
              className="w-full py-2 sm:py-3 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              className="w-full py-2 bg-blue-100 dark:bg-indigo-800 hover:bg-blue-200 dark:hover:bg-indigo-700 text-blue-700 dark:text-indigo-200 font-semibold rounded-lg shadow-sm transition-all text-base mt-2"
              onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); setOtpUserId(null); }}
              disabled={otpLoading}
            >
              Back to Login
            </button>
          </form>
        )}
        <div className="mt-4 sm:mt-6 text-blue-900/70 dark:text-indigo-200 text-center text-xs sm:text-base">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 dark:text-indigo-300 hover:underline font-semibold transition-all">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
