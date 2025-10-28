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
  Calendar,
  X,
  Sparkles,
  User,
  TrendingUp,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/contexts/notification-context";
import { NoPeopleEmptyState, NoSearchResultsEmptyState, ErrorEmptyState } from "@/components/empty-state";
import ContactForm from "@/components/ContactForm";
import ContactDetailDrawer from "@/components/ContactDetailDrawer";
import { Company } from "@/components/companies/CompanySelect";

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // API'den gelen name field'ı
  email: string;
  secondEmail: string;
  company: Company | null;
  linkedin: string;
  facebook: string;
  instagram: string;
  imdb: string;
  wikipedia: string;
  priority: string;
  assignedTo: string;
  contacted: boolean;
  location: string;
  fullName: string;
  seenFilm: boolean;
  docBranchMember: boolean;
  isActive: boolean;
  createdAt: number;
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
  const API_PATH = '/api/contacts';
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [contactedFilter, setContactedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Person | null>(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  
  const { addNotification } = useNotifications();

  // Fetch data with server-side pagination and filters
  const fetchPeople = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20', // Fixed limit to avoid state issues
        search: searchTerm,
        priority: priorityFilter,
        assigned_to: assignedFilter,
        contacted: contactedFilter,
      });

      const response = await fetch(`${API_PATH}?${params}`);
      const result = await response.json();
      
      if (result.success) {
        // API'den gelen veriyi frontend formatına çevir
        const mappedData = result.data.map((contact: any) => ({
          id: contact.id.toString(),
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          name: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email: contact.emailPrimary || '',
          secondEmail: contact.emailSecondary || '',
          company: contact.company,
          linkedin: contact.linkedin || '',
          facebook: contact.facebook || '',
          instagram: contact.instagram || '',
          imdb: contact.imdb || '',
          wikipedia: contact.wikipedia || '',
          priority: contact.priority || 'NONE',
          assignedTo: contact.assignedTo?.name || '',
          contacted: contact.status === 'ACTIVE' && contact.lastOutreachAt ? true : false,
          location: '', // API'de location bilgisi yok
          fullName: contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          seenFilm: contact.flags?.seenFilm || false,
          docBranchMember: contact.flags?.docBranchMember || false,
          isActive: contact.isActive !== false,
          createdAt: new Date(contact.createdAt).getTime(),
        }));
        
        setPeople(mappedData);
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

  // Generate avatar color based on initials
  const getAvatarColor = (initials: string) => {
    const colors = [
      { bg: "bg-indigo-100", text: "text-indigo-700" },
      { bg: "bg-teal-100", text: "text-teal-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-emerald-100", text: "text-emerald-700" },
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400";
      case "MEDIUM": return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
      case "LOW": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const toDisplayString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(v => (typeof v === "string" ? v : "")).filter(Boolean).join(", ");
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const candidate = obj.name ?? obj.label ?? obj.title;
      if (typeof candidate === "string") return candidate;
    }
    return "";
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

  // Handle contact detail view
  const handleViewContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowContactDetail(true);
  };

  // Handle close contact detail
  const handleCloseContactDetail = () => {
    setShowContactDetail(false);
    setSelectedContactId(null);
  };

  // Handle stats click to filter
  const handleStatsFilter = (type: string, value: string) => {
    if (type === "contacted") {
      setContactedFilter(value);
    } else if (type === "priority") {
      setPriorityFilter(value);
    } else {
      handleClearSearch();
    }
  };

  // Handle contact form
  const handleAddContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleEditContact = (contact: Person) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleSaveContact = async (formData: any) => {
    try {
      if (editingContact) {
        // Update existing contact
        const response = await fetch(`/api/contacts/${editingContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update contact');
        }
      } else {
        // Create new contact
        const response = await fetch('/api/contacts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: [formData] })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create contact');
        }
      }
      
      // Refresh the table
      await fetchPeople(pagination.page);
      setShowContactForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCloseContactForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

  const activeFiltersCount = 
    (priorityFilter !== "all" ? 1 : 0) +
    (assignedFilter !== "all" ? 1 : 0) +
    (contactedFilter !== "all" ? 1 : 0);

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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            People Management
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            1–20 of {pagination.total} contacts
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleAddContact} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport} className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Insight Bar */}
      {stats && (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-950/20 dark:to-indigo-950/20 rounded-lg border border-brand-200 dark:border-brand-900">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Insight</span>
          </div>
          <div className="h-6 w-px bg-brand-300 dark:bg-brand-800" />
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            High priority contacts increased <span className="font-semibold text-brand-600 dark:text-brand-400">14%</span> this week
          </p>
        </div>
      )}

      {/* Interactive Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleStatsFilter("all", "all")}
            className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-brand-300 dark:hover:border-brand-700 transition cursor-pointer text-left"
          >
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalPeople}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Total Contacts</div>
          </button>
          
          <button
            onClick={() => handleStatsFilter("contacted", "true")}
            className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer text-left"
          >
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.contacted}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Contacted</div>
          </button>
          
          <button
            onClick={() => handleStatsFilter("priority", "HIGH")}
            className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer text-left"
          >
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.highPriority}</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">High Priority</div>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search people, emails, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-brand-600 text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearSearch}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Assigned To
                </label>
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
                >
                  <option value="all">All Assignees</option>
                  <option value="CK">CK</option>
                  <option value="BINA">BINA</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Status
                </label>
                <select
                  value={contactedFilter}
                  onChange={(e) => setContactedFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800"
                >
                  <option value="all">All Status</option>
                  <option value="true">Contacted</option>
                  <option value="false">Not Contacted</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  CONTACT
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  COMPANY
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  EMAIL
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  SOCIAL MEDIA
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  PRIORITY
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  ASSIGNED
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  FLAGS
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {people.map((person) => {
                const assignedText = toDisplayString(person.assignedTo as unknown);
                const initials = (assignedText ? assignedText.substring(0, 2) : "UN").toUpperCase();
                const avatarColor = getAvatarColor(initials);
                
                return (
                  <tr 
                    key={person.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    onMouseEnter={() => setHoveredRow(person.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-4 py-1.5">
                      <div>
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {person.fullName}
                        </div>
                        {person.location && (
                          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            <MapPin className="h-3 w-3 mr-1" />
                            {person.location}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-1.5">
                      <div>
                        {person.company && (
                          <div className="flex items-center text-sm text-zinc-900 dark:text-zinc-100">
                            <Building className="h-3 w-3 mr-1.5 flex-shrink-0" />
                            {person.company.name}
                          </div>
                        )}
                        {person.company?.website && (
                          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            <Globe className="h-3 w-3 mr-1 flex-shrink-0" />
                            <a 
                              href={person.company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-brand-600 dark:hover:text-brand-400 truncate"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-1.5">
                      <div className="space-y-0.5">
                        {person.email && (
                          <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <a 
                              href={`mailto:${person.email}`}
                              className="hover:text-brand-600 dark:hover:text-brand-400 truncate"
                              title={person.email}
                            >
                              {person.email}
                            </a>
                          </div>
                        )}
                        {person.secondEmail && (
                          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate" title={person.secondEmail}>
                              {person.secondEmail}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-1.5">
                      <div className="flex gap-1 flex-wrap">
                        {person.linkedin && person.linkedin !== "Search LinkedIn" && !person.linkedin.includes("Search") && (
                          <a 
                            href={person.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 px-1 py-0.5 bg-blue-50 dark:bg-blue-950/20 rounded"
                            title="LinkedIn"
                          >
                            LI
                          </a>
                        )}
                        {person.facebook && !person.facebook.includes("Search") && (
                          <a 
                            href={person.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-700 hover:text-blue-800 dark:text-blue-500 px-1 py-0.5 bg-blue-50 dark:bg-blue-950/20 rounded"
                            title="Facebook"
                          >
                            FB
                          </a>
                        )}
                        {person.instagram && !person.instagram.includes("Search") && (
                          <a 
                            href={person.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-pink-600 hover:text-pink-700 dark:text-pink-400 px-1 py-0.5 bg-pink-50 dark:bg-pink-950/20 rounded"
                            title="Instagram"
                          >
                            IG
                          </a>
                        )}
                        {person.imdb && (
                          <a 
                            href={person.imdb} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 px-1 py-0.5 bg-yellow-50 dark:bg-yellow-950/20 rounded"
                            title="IMDB"
                          >
                            IMDB
                          </a>
                        )}
                        {person.wikipedia && (
                          <a 
                            href={person.wikipedia} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 px-1 py-0.5 bg-gray-50 dark:bg-gray-950/20 rounded"
                            title="Wikipedia"
                          >
                            WIKI
                          </a>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-1.5">
                      {person.priority && (
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(person.priority)}`}>
                          {person.priority}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-1.5">
                      {assignedText ? (
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${avatarColor.bg} ${avatarColor.text}`}>
                            {initials}
                          </div>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400" title={`Assigned to ${assignedText}`}>
                            {assignedText}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-600">Unassigned</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        person.contacted 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {person.contacted ? "Contacted" : "Not Contacted"}
                      </span>
                    </td>
                    
                    <td className="px-4 py-1.5">
                      <div className="flex gap-1 flex-wrap">
                        {person.seenFilm && (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Seen Film
                          </span>
                        )}
                        {person.docBranchMember && (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Doc Branch
                          </span>
                        )}
                        {!person.isActive && (
                          <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-1.5 text-right">
                      <div className={`flex items-center justify-end gap-1 transition-opacity ${hoveredRow === person.id ? 'opacity-100' : 'opacity-0'}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          title="View"
                          onClick={() => handleViewContact(person.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          title="Edit"
                          onClick={() => handleEditContact(person)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} contacts
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
              {(() => {
                const totalPages = pagination.totalPages;
                const currentPage = pagination.page;
                const maxVisible = 7; // Show up to 7 page numbers
                
                if (totalPages <= maxVisible) {
                  // Show all pages if total is small
                  return Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  });
                } else {
                  // Show smart pagination with ellipsis
                  const pages = [];
                  
                  // Always show first page
                  pages.push(
                    <Button
                      key={1}
                      variant={currentPage === 1 ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      className="w-8 h-8 p-0"
                    >
                      1
                    </Button>
                  );
                  
                  if (currentPage > 3) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-zinc-500">
                        ...
                      </span>
                    );
                  }
                  
                  // Show pages around current page
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);
                  
                  for (let page = start; page <= end; page++) {
                    if (page !== 1 && page !== totalPages) {
                      pages.push(
                        <Button
                          key={page}
                          variant={currentPage === page ? "primary" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    }
                  }
                  
                  if (currentPage < totalPages - 2) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-zinc-500">
                        ...
                      </span>
                    );
                  }
                  
                  // Always show last page
                  if (totalPages > 1) {
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    );
                  }
                  
                  return pages;
                }
              })()}
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

      {/* Contact Form Modal */}
      <ContactForm
        open={showContactForm}
        onClose={handleCloseContactForm}
        onSave={handleSaveContact}
        initialData={editingContact ? {
          firstName: editingContact.firstName,
          lastName: editingContact.lastName,
          emailPrimary: editingContact.email,
          emailSecondary: editingContact.secondEmail,
          company: editingContact.company,
          linkedin: editingContact.linkedin,
          facebook: editingContact.facebook,
          instagram: editingContact.instagram,
          imdb: editingContact.imdb,
          wikipedia: editingContact.wikipedia,
          priority: editingContact.priority as any,
          seenFilm: editingContact.seenFilm,
          docBranchMember: editingContact.docBranchMember,
          location: {
            countryCode: null,
            stateCode: null,
            cityId: null,
            stateText: null,
            cityText: null
          },
          // Assignment bilgilerini ekle
          assignedUsers: editingContact.assignedTo ? [{
            id: 0, // API'den gelen assignedTo sadece string, ID yok
            name: editingContact.assignedTo.split(' ')[0] || '',
            lastName: editingContact.assignedTo.split(' ').slice(1).join(' ') || '',
            email: '',
            role: 'viewer',
            status: 'active' as const
          }] : [],
          assignedUserIds: editingContact.assignedTo ? [0] : []
        } : undefined}
        title={editingContact ? "Edit Contact" : "Add Contact"}
      />

      {/* Contact Detail Drawer */}
      <ContactDetailDrawer
        open={showContactDetail}
        onClose={handleCloseContactDetail}
        contactId={selectedContactId}
      />
    </div>
  );
}
