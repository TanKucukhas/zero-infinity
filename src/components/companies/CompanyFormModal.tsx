"use client";
import * as React from 'react';
import { 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Box,
  Typography,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import Modal from '@/components/ui/modal';
import { 
  Buildings, 
  Globe, 
  LinkedinLogo,
  MapPin,
  Briefcase,
  Users,
  FileText
} from 'phosphor-react';
import LocationSelect, { LocationValue } from '@/components/locations/LocationSelect';
import { useNotifications } from '@/contexts/notification-context';
import { Company } from './CompanySelect';

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  onCompanyCreated: (company: Company) => void;
  initialName?: string;
  initialData?: Partial<Company>;
  isEdit?: boolean;
}

const INDUSTRY_OPTIONS = [
  // Media Categories
  'Media',
  'Media - Content Creation & Production',
  'Media - Broadcasting & Distribution', 
  'Media - Advertising, Marketing & PR',
  'Media - Media Tech & Infrastructure',
  'Media - News & Journalism',
  'Media - Creative & Design Services',
  'Media - Licensing & Rights Management',
  'Media - Events, Live Media & Experiential',
  'Media - Gaming & Interactive Media',
  
  // Non-Media Categories
  'Non-Media',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Non-profit',
  'Government',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Real Estate',
  'Travel & Hospitality',
  'Food & Beverage',
  'Fashion',
  'Sports',
  'Other'
];

const SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001-10000',
  '10000+'
];

type CompanyFormData = {
  name: string;
  website: string;
  linkedinUrl: string;
  industry: string;
  size: string;
  description: string;
  logoUrl: string;
  headquarters: LocationValue;
};

export default function CompanyFormModal({ 
  open, 
  onClose, 
  onCompanyCreated,
  initialName = '',
  initialData,
  isEdit = false
}: CompanyFormModalProps) {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = React.useState(false);
  
  const [formData, setFormData] = React.useState<CompanyFormData>({
    name: initialData?.name || initialName,
    website: initialData?.website || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    industry: initialData?.industry || 'Media',
    size: initialData?.size || '',
    description: initialData?.description || '',
    logoUrl: initialData?.logoUrl || '',
    headquarters: {
      countryCode: initialData?.headquartersCountry || 'US',
      stateCode: initialData?.headquartersState || null,
      cityId: initialData?.headquartersCity || null,
      stateText: null,
      cityText: null
    }
  });

  React.useEffect(() => {
    if (open && initialName) {
      setFormData(prev => ({ ...prev, name: initialName }));
    }
  }, [open, initialName]);

  // Update form data when initialData changes (for edit mode)
  React.useEffect(() => {
    if (open && initialData) {
      setFormData({
        name: initialData.name || '',
        website: initialData.website || '',
        linkedinUrl: initialData.linkedinUrl || '',
        industry: initialData.industry || 'Media',
        size: initialData.size || '',
        description: initialData.description || '',
        logoUrl: initialData.logoUrl || '',
        headquarters: {
          countryCode: initialData.headquartersCountry || 'US',
          stateCode: initialData.headquartersState || null,
          cityId: initialData.headquartersCity || null,
          stateText: null,
          cityText: null
        }
      });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof CompanyFormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLocationChange = (location: LocationValue) => {
    setFormData(prev => ({
      ...prev,
      headquarters: location
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const url = isEdit ? `/api/companies/${initialData?.id}` : '/api/companies';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: "success",
          title: "Success",
          message: isEdit ? "Company updated successfully" : "Company created successfully"
        });
        onCompanyCreated(result.data);
        onClose();
      } else {
        addNotification({
          type: "error",
          title: "Error",
          message: result.error || (isEdit ? "Failed to update company" : "Failed to create company")
        });
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : (isEdit ? "Failed to update company" : "Failed to create company")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        website: '',
        linkedinUrl: '',
        industry: '',
        size: '',
        description: '',
        logoUrl: '',
        headquarters: {
          countryCode: 'US',
          stateCode: null,
          cityId: null,
          stateText: null,
          cityText: null
        }
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} className="max-w-2xl">
      <div className="bg-white rounded-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Buildings size={24} />
            {isEdit ? 'Edit Company' : 'Add New Company'}
          </h2>
          <p className="text-brand-100 mt-1">
            {isEdit ? 'Update company information' : 'Create a new company profile'}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <Buildings size={20} className="text-brand-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange('name')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Globe size={16} className="text-green-600" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={handleChange('website')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    placeholder="https://company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <LinkedinLogo size={16} className="text-blue-600" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleChange('linkedinUrl')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    placeholder="https://linkedin.com/company/company-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-purple-600" />
                    Industry
                  </label>
                  <select
                    value={formData.industry}
                    onChange={handleChange('industry')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Users size={16} className="text-orange-600" />
                    Company Size
                  </label>
                  <select
                    value={formData.size}
                    onChange={handleChange('size')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  >
                    <option value="">Select size</option>
                    {SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                    <Globe size={16} className="text-green-600" />
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={handleChange('logoUrl')}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>
            
            <Divider />
            
            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-red-600" />
                Headquarters Location
              </h3>
              
              <div className="border border-zinc-300 rounded-lg p-4 bg-zinc-50">
                <LocationSelect
                  value={formData.headquarters}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
            
            <Divider />
            
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Description
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">
                  Company Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={handleChange('description')}
                  rows={4}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 resize-none"
                  placeholder="Enter company description..."
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end items-center px-6 py-4 bg-zinc-50 rounded-b-lg gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2 text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="px-8 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{isEdit ? 'Update Company' : 'Create Company'}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
