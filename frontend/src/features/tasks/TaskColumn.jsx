// components/tasks/TaskColumn.jsx
import React from 'react';
import PropTypes from 'prop-types';
import TaskCard from '../../components/tasks/TaskCard'; // Assuming you'll have a TaskCard component
import { useSelector } from 'react-redux';

const TaskColumn = ({ title, tasks, columnId, onAddTask, onEditTask, onDeleteTask, droppableRef, projectId }) => {
  const { user } = useSelector(state => state.auth);
  return (
    <div className="w-72 bg-gray-50 rounded-lg p-3 mx-2 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-gray-800 font-medium text-base m-0">{title}</h3>
        <span className="bg-gray-200 rounded-full px-2 text-xs">
          {tasks.length}
        </span>
        <button 
          onClick={() => onAddTask(columnId)} 
          className="bg-green-500 text-white border-none rounded w-6 h-6 cursor-pointer text-base flex items-center justify-center hover:bg-green-600"
          aria-label={`Add task to ${title} column`}
        >
          +
        </button>
      </div>
      <div
        ref={droppableRef}
        className="min-h-[100px] bg-gray-100 rounded p-2"
      >
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            userRole={user?.role}
            projectId={projectId}
          />
        ))}
      </div>
    </div>
  );
};

TaskColumn.propTypes = {
  title: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      // Add other task properties as needed
    })
  ).isRequired,
  columnId: PropTypes.string.isRequired,
  onAddTask: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  droppableRef: PropTypes.object,
  projectId: PropTypes.string.isRequired,
};

export default TaskColumn;