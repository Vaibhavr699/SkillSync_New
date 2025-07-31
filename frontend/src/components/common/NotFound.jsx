import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Icon Wrapper */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto rounded-full bg-red-100 dark:bg-red-900 shadow-md animate-fade-in">
          <ErrorOutlineIcon className="text-red-600 dark:text-red-300" style={{ fontSize: 64 }} />
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce">🚫</div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
          The page you are looking for might have been removed, renamed, or is temporarily unavailable.
        </p>

        {/* Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg px-6 py-3 rounded-lg transition-all shadow-md"
        >
          <span>Go to Dashboard</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
