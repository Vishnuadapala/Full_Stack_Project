import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import api from '../hooks/useApi';

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  tasks: Task[];
}

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: { id: string; name: string };
}

export const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id) return;

    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        projectId: id,
        status: 'TODO',
        priority: 'MEDIUM',
      });
      setNewTaskTitle('');
      setShowNewTask(false);
      fetchProject();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  const isOwner = project.ownerId === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
            {isOwner && (
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={18} />
                Delete Project
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
            <div key={status} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {status === 'TODO'
                  ? 'To Do'
                  : status === 'IN_PROGRESS'
                  ? 'In Progress'
                  : 'Done'}
              </h2>
              <div className="space-y-2">
                {project.tasks
                  .filter((t) => t.status === status)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => {
                            const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];
                            const currentIndex = statuses.indexOf(status);
                            const nextStatus =
                              statuses[(currentIndex + 1) % statuses.length];
                            handleUpdateTaskStatus(task.id, nextStatus);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition"
                        >
                          {status === 'DONE' ? (
                            <CheckCircle size={20} className="text-green-600" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <div>
                          <p className="text-gray-800 font-medium">{task.title}</p>
                          {task.assignedTo && (
                            <p className="text-sm text-gray-600">
                              Assigned to: {task.assignedTo.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {project.tasks.filter((t) => t.status === status).length === 0 && (
                  <p className="text-gray-500 text-sm">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {isOwner && (
          <div className="mt-8">
            {!showNewTask ? (
              <button
                onClick={() => setShowNewTask(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                Add Task
              </button>
            ) : (
              <form onSubmit={handleAddTask} className="bg-white rounded-lg shadow p-6">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTask(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
