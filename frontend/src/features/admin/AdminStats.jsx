import { ChartBarIcon, UserGroupIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

export default function AdminStats() {
  const { stats } = useSelector(state => state.admin);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
        <UserGroupIcon className="h-8 w-8 text-blue-500" />
        <div>
          <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          <div className="text-gray-500">Total Users</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
        <BriefcaseIcon className="h-8 w-8 text-green-500" />
        <div>
          <div className="text-2xl font-bold">{stats.totalProjects || 0}</div>
          <div className="text-gray-500">Total Projects</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
        <ChartBarIcon className="h-8 w-8 text-purple-500" />
        <div>
          <div className="text-2xl font-bold">{stats.totalTasks || 0}</div>
          <div className="text-gray-500">Total Tasks</div>
        </div>
      </div>
    </div>
  );
}