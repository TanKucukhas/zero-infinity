"use client";
import { useState, useEffect } from 'react';
import { Company } from '@/components/companies/CompanySelect';
import CompaniesTable from '@/components/companies/CompaniesTable';
import TableContainer from '@/components/ui/TableContainer';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.data);
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
    fetchCompanies();
  }, []);

  const handleCompanyUpdated = () => {
    fetchCompanies(); // Refresh the list
  };

  const handleCompanyDeleted = () => {
    fetchCompanies(); // Refresh the list
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
            onClick={fetchCompanies}
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
        onCompanyUpdated={handleCompanyUpdated}
        onCompanyDeleted={handleCompanyDeleted}
      />
    </TableContainer>
  );
}
