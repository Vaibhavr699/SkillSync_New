import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, banUser, unbanUser, softDeleteUser, updateUserStatus } from '../../store/slices/adminSlice';
import { UserIcon, NoSymbolIcon, CheckCircleIcon, TrashIcon, PowerIcon } from '@heroicons/react/24/solid';

export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.admin);
  const [sortField, setSortField] = useState('date_joined');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortField === 'role') {
      return sortDir === 'asc'
        ? a.role.localeCompare(b.role)
        : b.role.localeCompare(a.role);
    }
    if (sortField === 'date_joined') {
      return sortDir === 'asc'
        ? new Date(a.date_joined) - new Date(b.date_joined)
        : new Date(b.date_joined) - new Date(a.date_joined);
    }
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <UserIcon className="h-6 w-6 text-blue-500" /> User Management
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('role')}>Role {sortField === 'role' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('date_joined')}>Date Joined {sortField === 'date_joined' && (sortDir === 'asc' ? '▲' : '▼')}</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id} className={`border-t ${!user.is_active ? 'bg-gray-100 text-gray-400' : ''}`}>
                <td className="p-2 flex items-center gap-2">
                  <img src={user.photo} alt="" className="h-8 w-8 rounded-full" />
                  {user.name}
                </td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : user.role === 'company' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-2">{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}</td>
                <td className="p-2">
                  {user.is_banned ? (
                    <span className="flex items-center gap-1 text-red-600">
                      <NoSymbolIcon className="h-5 w-5" /> Banned
                    </span>
                  ) : user.is_active ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-5 w-5" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <PowerIcon className="h-5 w-5" /> Deactivated
                    </span>
                  )}
                </td>
                <td className="p-2 flex gap-2">
                  <button
                    className={`p-1 rounded hover:bg-blue-100 ${user.is_banned ? 'text-green-600' : 'text-red-600'}`}
                    onClick={() => user.is_banned ? dispatch(unbanUser(user.id)) : dispatch(banUser(user.id))}
                    title={user.is_banned ? 'Unban' : 'Ban'}
                  >
                    {user.is_banned ? <CheckCircleIcon className="h-5 w-5" /> : <NoSymbolIcon className="h-5 w-5" />}
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                    onClick={() => dispatch(softDeleteUser(user.id))}
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    className={`p-1 rounded hover:bg-yellow-100 ${user.is_active ? 'text-yellow-600' : 'text-green-600'} ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => user.role !== 'admin' && dispatch(updateUserStatus({ userId: user.id, isActive: !user.is_active }))}
                    title={user.role === 'admin' ? 'Admin accounts cannot be deactivated' : user.is_active ? 'Deactivate' : 'Activate'}
                    disabled={user.role === 'admin'}
                  >
                    <PowerIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
            {sortedUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}