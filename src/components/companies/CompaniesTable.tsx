"use client";
import { useState } from 'react';
import { Company } from '@/components/companies/CompanySelect';
import CompanyFormModal from '@/components/companies/CompanyFormModal';
import { useNotifications } from '@/contexts/notification-context';
import { 
  Buildings, 
  Globe, 
  LinkedinLogo, 
  PencilSimple, 
  Trash, 
  Eye,
  MagnifyingGlass,
  Funnel,
  Plus
} from 'phosphor-react';

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type CompaniesTableProps = {
  companies: Company[];
  pagination: PaginationInfo;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPageChange: (page: number) => void;
  onCompanyUpdated: () => void;
  onCompanyDeleted: () => void;
};

export default function CompaniesTable({ 
  companies, 
  pagination,
  searchTerm,
  onSearchChange,
  onPageChange,
  onCompanyUpdated, 
  onCompanyDeleted 
}: CompaniesTableProps) {
  const { addNotification } = useNotifications();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleDelete = async (company: Company) => {
    if (!confirm(`Are you sure you want to delete "${company.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Company deleted successfully'
        });
        onCompanyDeleted();
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to delete company'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete company'
      });
    }
  };

  const handleViewDetails = (company: Company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleCompanySaved = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setSelectedCompany(null);
    onCompanyUpdated();
  };

  const getIndustryColor = (industry: string) => {
    if (industry?.startsWith('Media')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    if (industry === 'Technology') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (industry === 'Finance') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="p-6 space-y-4">
      {/* Search and Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      {/* Companies Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Buildings size={20} className="text-zinc-400" />
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {company.name}
                        </div>
                        {company.description && (
                          <div className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                            {company.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.industry && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getIndustryColor(company.industry)}`}>
                        {company.industry}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                    {company.size || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm"
                      >
                        <Globe size={14} />
                        Visit
                      </a>
                    ) : (
                      <span className="text-zinc-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1 text-zinc-400 hover:text-blue-600"
                        title="Edit Company"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(company)}
                        className="p-1 text-zinc-400 hover:text-red-600"
                        title="Delete Company"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            {searchTerm ? 'No companies found matching your search.' : 'No companies found.'}
          </div>
        )}

      {/* Modals */}
      <CompanyFormModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCompanyCreated={handleCompanySaved}
      />

      <CompanyFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onCompanyCreated={handleCompanySaved}
        initialData={selectedCompany}
        isEdit={true}
      />

      {/* Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {selectedCompany.name}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedCompany.website && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Website
                  </label>
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Globe size={16} />
                    {selectedCompany.website}
                  </a>
                </div>
              )}

              {selectedCompany.linkedinUrl && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    LinkedIn
                  </label>
                  <a
                    href={selectedCompany.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <LinkedinLogo size={16} />
                    View Profile
                  </a>
                </div>
              )}

              {selectedCompany.industry && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Industry
                  </label>
                  <span className={`inline-flex px-2 py-1 text-sm font-medium rounded-full ${getIndustryColor(selectedCompany.industry)}`}>
                    {selectedCompany.industry}
                  </span>
                </div>
              )}

              {selectedCompany.size && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Company Size
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100">{selectedCompany.size} employees</p>
                </div>
              )}

              {selectedCompany.description && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Description
                  </label>
                  <p className="text-zinc-900 dark:text-zinc-100">{selectedCompany.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} companies
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 text-sm rounded-lg ${
                      pagination.page === page
                        ? 'bg-brand-600 text-white'
                        : 'border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
