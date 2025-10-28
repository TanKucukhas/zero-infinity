"use client";
import { useState, useEffect } from 'react';
import { Company } from '@/components/companies/CompanySelect';
import CompaniesTable from '@/components/companies/CompaniesTable';
import TableContainer from '@/components/ui/TableContainer';
import { Button } from '@/components/ui/button';

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchCompanies = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch companies');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1, searchTerm);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompanies(1, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    fetchCompanies(newPage, searchTerm);
  };

  const handleCompanyUpdated = () => {
    fetchCompanies(pagination.page, searchTerm);
  };

  const handleCompanyDeleted = () => {
    fetchCompanies(pagination.page, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <TableContainer title="Companies" description="Manage your company database">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <TableContainer title="Companies" description="Manage your company database">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => fetchCompanies()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
          >
            Try Again
          </button>
        </div>
      </TableContainer>
    );
  }

  return (
    <TableContainer 
      title="Companies" 
      description="Manage your company database"
      count={companies.length}
      countLabel="companies"
    >
        <CompaniesTable 
          companies={companies}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onPageChange={handlePageChange}
          onCompanyUpdated={handleCompanyUpdated}
          onCompanyDeleted={handleCompanyDeleted}
        />
    </TableContainer>
  );
}
