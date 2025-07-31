import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#0a2a5c] flex flex-col">
      {/* Top nav with logo and buttons */}
      <nav className="w-full flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/public/logo.svg" alt="SkillSync Logo" className="w-10 h-10" />
          <span className="text-white text-2xl font-bold tracking-tight">SkillSync</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login">
            <button className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-[#0a2a5c] font-semibold rounded-lg shadow transition-all text-base">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition-all text-base">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>
      {/* Main hero section */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-between flex-1 w-full max-w-7xl mx-auto px-6 py-8 gap-8">
        {/* Left: Headline and description */}
        <div className="flex-1 flex flex-col justify-center items-start max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-xl">
            Get More Done with <span className="text-blue-300">SkillSync</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Project management software that enables your teams to collaborate, plan, analyze, and manage everyday tasks. Experience seamless teamwork, smart task management, and AI-powered productivity.
          </p>
          <Link to="/signup">
            <button className="px-8 py-3 bg-blue-400 hover:bg-blue-300 text-[#0a2a5c] font-bold rounded-xl shadow-lg transition-all text-lg flex items-center gap-2">
              Try SkillSync free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </Link>
        </div>
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center items-center max-w-lg w-full mb-8 md:mb-0">
          {/* Placeholder SVG illustration */}
          <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[340px]">
            <rect x="30" y="60" width="340" height="180" rx="24" fill="#fff" />
            <rect x="60" y="90" width="120" height="30" rx="8" fill="#e0e7ef" />
            <rect x="200" y="90" width="120" height="30" rx="8" fill="#e0e7ef" />
            <rect x="60" y="140" width="260" height="20" rx="6" fill="#b6d0f7" />
            <rect x="60" y="170" width="180" height="20" rx="6" fill="#b6d0f7" />
            <circle cx="320" cy="200" r="24" fill="#facc15" />
            <circle cx="100" cy="210" r="18" fill="#60a5fa" />
            <rect x="150" y="200" width="80" height="16" rx="6" fill="#e0e7ef" />
            {/* People */}
            <ellipse cx="90" cy="270" rx="24" ry="10" fill="#e0e7ef" />
            <ellipse cx="310" cy="270" rx="24" ry="10" fill="#e0e7ef" />
            <circle cx="90" cy="250" r="14" fill="#60a5fa" />
            <rect x="80" y="260" width="20" height="20" rx="6" fill="#facc15" />
            <circle cx="310" cy="250" r="14" fill="#facc15" />
            <rect x="300" y="260" width="20" height="20" rx="6" fill="#60a5fa" />
          </svg>
        </div>
      </main>
      {/* Decorative background waves */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg className="absolute left-0 top-0 w-full h-full" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#2563eb" fillOpacity="0.08" d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,133.3C840,107,960,85,1080,101.3C1200,117,1320,171,1380,197.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>
    </div>
  );
};

export default HomePage; 