// ProjectCard component placeholder 

return (
  <div className="bg-white dark:bg-indigo-900 rounded-2xl mx-5 shadow-lg flex flex-col h-full border border-gray-100 dark:border-indigo-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
    {/* Card Header */}
    <div className="rounded-t-2xl p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white dark:bg-gradient-to-r dark:from-indigo-900 dark:via-indigo-800 dark:to-indigo-700 dark:text-white">
      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-200 dark:group-hover:text-indigo-300">
        Project Title
      </h3>
      <p className="mb-0 line-clamp-2">
        Project description goes here.
      </p>
    </div>
    {/* Card Body */}
    <div className="p-6 flex flex-col flex-1 bg-white dark:bg-indigo-950 rounded-b-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded dark:bg-indigo-800 dark:text-indigo-100">
          Tag 1
        </span>
        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded dark:bg-indigo-800 dark:text-indigo-100">
          Tag 2
        </span>
      </div>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-green-600 font-semibold text-sm dark:text-green-300">
          Start Date: January 1, 2024
        </span>
        <span className="text-gray-500 text-sm ml-4 dark:text-indigo-100">
          End Date: December 31, 2024
        </span>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-100 text-indigo-900 font-semibold text-sm hover:bg-indigo-200 transition-colors dark:bg-indigo-700 dark:text-white dark:hover:bg-indigo-800">
        View Project
      </button>
    </div>
  </div>
) 