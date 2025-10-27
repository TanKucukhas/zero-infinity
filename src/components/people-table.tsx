"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/contexts/notification-context";
import { NoPeopleEmptyState, NoSearchResultsEmptyState, ErrorEmptyState } from "@/components/empty-state";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  secondEmail: string;
  company: string;
  website: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  priority: string;
  assignedTo: string;
  contacted: boolean;
  location: string;
  fullName: string;
  hemalNotes: string;
  yetkinNotes: string;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Stats = {
  totalPeople: number;
  totalCompanies: number;
  contacted: number;
  notContacted: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
};

export default function PeopleTable() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [contactedFilter, setContactedFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState<Stats | null>(null);
  
  const { addNotification } = useNotifications();

  // Fetch data with server-side pagination and filters
  const fetchPeople = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        priority: priorityFilter,
        assigned_to: assignedFilter,
        contacted: contactedFilter,
      });

      const response = await fetch(`/api/people?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setPeople(result.data);
        setPagination(result.pagination);
        setStats(result.stats);
      } else {
        setError(result.error || "Failed to load people");
        addNotification({
          type: "error",
          title: "Error loading people",
          message: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error fetching people:", error);
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

  // Initial load
  useEffect(() => {
    fetchPeople(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPeople(1);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, priorityFilter, assignedFilter, contactedFilter]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchPeople(newPage);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "LOW": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Handle CSV import
  const handleImport = () => {
    addNotification({
      type: "info",
      title: "CSV Import",
      message: "CSV import feature coming soon!",
    });
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setPriorityFilter("all");
    setAssignedFilter("all");
    setContactedFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading people data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState 
          onRetry={() => fetchPeople(1)}
          error={error}
        />
      </div>
    );
  }

  if (people.length === 0 && !loading) {
    if (searchTerm || priorityFilter !== "all" || assignedFilter !== "all" || contactedFilter !== "all") {
      return (
        <div className="p-6">
          <NoSearchResultsEmptyState onClearSearch={handleClearSearch} />
        </div>
      );
    }
    
    return (
      <div className="p-6">
        <NoPeopleEmptyState onImport={handleImport} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            People Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {pagination.total} people found
            {stats && (
              <span className="ml-2 text-sm">
                • {stats.contacted} contacted • {stats.highPriority} high priority
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search people, companies, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="all">All Assignees</option>
            <option value="CK">CK</option>
            <option value="BINA">BINA</option>
          </select>
          
          <select
            value={contactedFilter}
            onChange={(e) => setContactedFilter(e.target.value)}
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-sm"
          >
            <option value="all">All Status</option>
            <option value="true">Contacted</option>
            <option value="false">Not Contacted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {people.map((person) => (
                <tr key={person.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {person.fullName}
                      </div>
                      {person.location && (
                        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {person.location}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      {person.company && (
                        <div className="flex items-center text-sm text-zinc-900 dark:text-zinc-100">
                          <Building className="h-3 w-3 mr-1" />
                          {person.company}
                        </div>
                      )}
                      {person.website && (
                        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          <Globe className="h-3 w-3 mr-1" />
                          <a 
                            href={person.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {person.email && (
                        <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                          <Mail className="h-3 w-3 mr-1" />
                          <a 
                            href={`mailto:${person.email}`}
                            className="hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            {person.email}
                          </a>
                        </div>
                      )}
                      {person.linkedin && person.linkedin !== "Search LinkedIn" && (
                        <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                          <a 
                            href={person.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {person.priority && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(person.priority)}`}>
                        {person.priority}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {person.assignedTo || "Unassigned"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        person.contacted 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}>
                        {person.contacted ? "Contacted" : "Not Contacted"}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={pagination.page === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
