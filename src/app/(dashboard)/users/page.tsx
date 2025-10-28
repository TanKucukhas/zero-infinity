"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  UserCog,
  Shield,
  Mail,
  Calendar,
  Users as UsersIcon,
  AlertCircle,
  Plus,
  Trash2,
  UserX,
  UserCheck,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/user-context";
import { useNotifications } from "@/contexts/notification-context";

type User = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: number;
};

export default function UsersPage() {
  const { user } = useUser();
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    role: 'viewer'
  });

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      // Redirect to forbidden page or show access denied
      window.location.href = '/forbidden';
      return;
    }
  }, [user]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsMenu !== null) {
        setShowActionsMenu(null);
      }
    };

    if (showActionsMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showActionsMenu]);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users', {
        headers: {
          'x-user': JSON.stringify(user)
        }
      });

      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || "Failed to load users");
        addNotification({
          type: "error",
          title: "Error loading users",
          message: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Network error");
      addNotification({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": 
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "editor": 
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "viewer": 
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
      case "external": 
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "suspended": 
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default: 
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: "success",
          title: "User Created",
          message: "User has been created successfully",
        });
        setShowAddForm(false);
        setFormData({ name: '', lastName: '', email: '', role: 'viewer' });
        fetchUsers();
      } else {
        addNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to create user",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Network error occurred",
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user': JSON.stringify(user)
        }
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: "success",
          title: "User Deleted",
          message: "User has been deleted successfully",
        });
        fetchUsers();
      } else {
        addNotification({
          type: "error",
          title: "Error",
          message: result.error || "Failed to delete user",
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Network error occurred",
      });
    }
  };

  // Handle suspend/activate user
  const handleSuspendUser = async (userId: number, action: 'suspend' | 'activate') => {
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify({ action })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: "success",
          title: `User ${action === 'suspend' ? 'Suspended' : 'Activated'}`,
          message: `User has been ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
        });
        fetchUsers();
      } else {
        addNotification({
          type: "error",
          title: "Error",
          message: result.error || `Failed to ${action} user`,
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: "Network error occurred",
      });
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render if user is not admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Error Loading Users
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <Button onClick={fetchUsers} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Users Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {filteredUsers.length} of {users.length} users
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowAddForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Shield className="h-4 w-4" />
            <span>Admin Access Required</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 dark:text-zinc-400">
                    {searchTerm ? "No users found matching your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => (
                  <tr 
                    key={userItem.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    onMouseEnter={() => setHoveredRow(userItem.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                          <UsersIcon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {userItem.name} {userItem.lastName}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            ID: {userItem.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="truncate" title={userItem.email}>
                          {userItem.email}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(userItem.role)}`}>
                        {userItem.role.toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span>{formatDate(userItem.createdAt)}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsMenu(showActionsMenu === userItem.id ? null : userItem.id);
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {/* Actions Dropdown */}
                        {showActionsMenu === userItem.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg py-1 z-50"
                               onClick={(e) => e.stopPropagation()}>
                            {userItem.role === 'suspended' ? (
                              <button
                                onClick={() => {
                                  handleSuspendUser(userItem.id, 'activate');
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <UserCheck className="h-4 w-4" />
                                Activate User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleSuspendUser(userItem.id, 'suspend');
                                  setShowActionsMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <UserX className="h-4 w-4" />
                                Suspend User
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                handleDeleteUser(userItem.id);
                                setShowActionsMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{users.length}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Total Users</div>
          </div>
          
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Admins</div>
          </div>
          
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {users.filter(u => u.role === 'editor').length}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Editors</div>
          </div>
          
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {users.filter(u => u.role === 'viewer').length}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Viewers</div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add New User
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="external">External</option>
                </select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Create User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
