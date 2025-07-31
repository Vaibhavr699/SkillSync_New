import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { token: paramToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const email = location.state?.email || '';

  useEffect(() => {
    const token = paramToken || searchParams.get('token');
    if (token) {
      const verify = async () => {
        try {
          await verifyEmail(token);
          setSuccess(true);
        } catch (err) {
          setError(err.response?.data?.message || 'Email verification failed');
        } finally {
          setLoading(false);
        }
      };
      verify();
    } else {
      setLoading(false);
    }
  }, [paramToken, searchParams]);

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center overflow-y-auto overflow-x-hidden bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10 dark:before:bg-[#0a2a5c]/95">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg bg-white/95 dark:bg-indigo-950/95 rounded-3xl shadow-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-14 mb-2 sm:mb-3" />
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : success ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Email Verified</h2>
            <p className="text-center text-sm sm:text-base mb-4">Your email has been successfully verified. You can now sign in to your account.</p>
            <button
              className="w-full py-2 sm:py-3 mt-2 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </>
        ) : error ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Verification Failed</h2>
            <div className="w-full mb-2 text-xs sm:text-sm text-red-600 bg-red-100 dark:bg-red-900/40 rounded px-3 py-2 text-center">{error}</div>
            <p className="text-center text-sm sm:text-base mb-4">Please try again or contact support if the problem persists.</p>
          </>
        ) : email ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Verify Your Email</h2>
            <p className="text-center text-sm sm:text-base mb-2">We've sent a verification link to <strong>{email}</strong>. Please check your email and click the link to verify your account.</p>
            <p className="text-center text-sm sm:text-base mb-4">Didn't receive the email? Check your spam folder or request a new verification link.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a2a5c] dark:text-white mb-2 text-center">Invalid Verification Link</h2>
            <p className="text-center text-sm sm:text-base mb-4">The verification link is invalid or has expired. Please try registering again.</p>
            <button
              className="w-full py-2 sm:py-3 mt-2 bg-blue-600 dark:bg-indigo-700 hover:bg-blue-700 dark:hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md transition-all text-base disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => navigate('/register')}
            >
              Go to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
