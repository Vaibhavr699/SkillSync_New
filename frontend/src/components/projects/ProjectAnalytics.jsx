import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const ProjectAnalytics = ({ project }) => {
  const projectId = project?.id || project?._id;
  const tasksByProject = useSelector(state => state.tasks.tasks);
  const teamByProject = useSelector(state => state.tasks.team);
  const tasks = Array.isArray(tasksByProject?.[projectId]) ? tasksByProject[projectId] : [];
  const team = Array.isArray(teamByProject?.[projectId]) ? teamByProject[projectId] : [];

  // Always render charts, even if empty
  const safeTeam = team.length ? team : [{ id: 'none', name: 'No Team' }];
  const safeTasks = tasks.length ? tasks : [{ id: 'none', title: 'No Tasks', status: 'todo' }];

  // Tasks per user
  const tasksPerUser = safeTeam.map(user =>
    safeTasks.filter(t => t.assigned_to === user.id || t.assigned_to === user._id).length
  );

  // Tasks by status
  const statusLabels = ['todo', 'in-progress', 'review', 'done'];
  const tasksByStatus = statusLabels.map(status =>
    safeTasks.filter(t => t.status === status).length
  );

  // Time spent (input-driven, fallback to 0 if not present)
  const [timeData, setTimeData] = useState(safeTasks.map(t => t.time_spent || 0));

  const handleTimeChange = (idx, value) => {
    const newData = [...timeData];
    newData[idx] = Number(value);
    setTimeData(newData);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full items-stretch lg:max-w-5xl mx-auto lg:flex-nowrap lg:overflow-x-visible">
      {/* Tasks per User */}
      <div className="flex-1 bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 flex flex-col items-center w-full max-w-full md:max-w-md lg:max-w-xs">
        <h3 className="text-base font-bold mb-2 text-center">Tasks per User</h3>
        <div className="w-full flex justify-center relative h-48 sm:h-56 md:h-64">
          <Bar
            data={{
              labels: safeTeam.map(u => u.name || u.email || u.id),
              datasets: [
                {
                  label: 'Tasks',
                  data: tasksPerUser,
                  backgroundColor: '#6366f1',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
            }}
            height={192}
            width={320}
          />
        </div>
      </div>
      {/* Tasks by Status */}
      <div className="flex-1 bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 flex flex-col items-center w-full max-w-full md:max-w-md lg:max-w-xs">
        <h3 className="text-base font-bold mb-2 text-center">Tasks by Status</h3>
        <div className="w-full flex justify-center relative h-48 sm:h-56 md:h-64">
          <Pie
            data={{
              labels: statusLabels,
              datasets: [
                {
                  label: 'Tasks',
                  data: tasksByStatus,
                  backgroundColor: ['#10b981', '#f59e42', '#6366f1', '#a3e635'],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } },
              maintainAspectRatio: false,
            }}
            height={192}
            width={320}
          />
        </div>
      </div>
      {/* Time Spent per Task */}
      <div className="flex-1 bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 flex flex-col items-center w-full max-w-full md:max-w-md lg:max-w-xs">
        <h3 className="text-base font-bold mb-2 text-center">Time Spent per Task (hours)</h3>
        <div className="flex flex-col gap-2 mb-2 w-full">
          {safeTasks.map((task, idx) => (
            <div key={task.id || task._id} className="flex items-center gap-2">
              <span className="w-32 font-medium truncate">{task.title}</span>
              <input
                type="number"
                min={0}
                value={timeData[idx]}
                onChange={e => handleTimeChange(idx, e.target.value)}
                className="border rounded px-2 py-1 w-20"
              />
              <span className="text-xs text-gray-500">hours</span>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-center relative h-48 sm:h-56 md:h-64">
          <Bar
            data={{
              labels: safeTasks.map(t => t.title),
              datasets: [
                {
                  label: 'Time Spent (hours)',
                  data: timeData,
                  backgroundColor: '#f59e42',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
            }}
            height={192}
            width={320}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics; 