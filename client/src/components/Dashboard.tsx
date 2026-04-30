import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, LogOut, Plus } from 'lucide-react';
import api from '../hooks/useApi';

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  project: { id: string; name: string };
  assignedTo?: { id: string; name: string };
}

interface Project {
  id: string;
  name: string;
  description?: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const taskCounts = {
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  const upcomingTasks = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">{user?.name}</span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              {user?.role}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">To Do</p>
                <p className="text-3xl font-bold text-yellow-600">{taskCounts.todo}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-blue-600">{taskCounts.inProgress}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{taskCounts.done}</p>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Projects</h2>
                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/projects/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus size={18} />
                    New Project
                  </button>
                )}
              </div>
              {projects.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                  No projects yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <h3 className="font-semibold text-gray-800">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Tasks */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Deadlines</h2>
              {upcomingTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                  No upcoming tasks
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Task
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingTasks.map((task) => (
                        <tr key={task.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm text-gray-800">{task.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{task.project.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : 'No date'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                task.priority === 'HIGH'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
