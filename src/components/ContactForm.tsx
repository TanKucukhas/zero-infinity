"use client";
import * as React from 'react';
import { 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Grid,
  Box,
  Typography,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import Modal from '@/components/ui/modal';
import { 
  LinkedinLogo, 
  FacebookLogo, 
  InstagramLogo, 
  Globe, 
  Envelope,
  Phone,
  MapPin,
  User,
  Buildings,
  BookOpen,
  Play
} from 'phosphor-react';
import LocationSelect, { LocationValue } from '@/components/locations/LocationSelect';
import CompanySelect, { Company } from '@/components/companies/CompanySelect';
import { useNotifications } from '@/contexts/notification-context';

type ContactFormData = {
  firstName: string;
  lastName: string;
  emailPrimary: string;
  emailSecondary: string;
  phoneNumber: string;
  company: Company | null;
  imdb: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  wikipedia: string;
  biography: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  seenFilm: boolean;
  docBranchMember: boolean;
  location: LocationValue;
  assignedToUserId?: number;
  relationshipType?: string;
  relationshipStrength?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => Promise<void>;
  initialData?: Partial<ContactFormData>;
  title?: string;
};

const steps = [
  'Basic Information',
  'Social Media',
  'Priority & Biography', 
  'Assignment & Relationships'
];

export default function ContactForm({ open, onClose, onSave, initialData, title = "Add Contact" }: Props) {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  
  const [formData, setFormData] = React.useState<ContactFormData>({
    firstName: '',
    lastName: '',
    emailPrimary: '',
    emailSecondary: '',
    phoneNumber: '',
    company: null,
    imdb: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    wikipedia: '',
    biography: '',
    priority: 'NONE',
    seenFilm: false,
    docBranchMember: false,
    location: {
      countryCode: 'US',
      stateCode: null,
      cityId: null,
      stateText: null,
      cityText: null
    },
    assignedToUserId: undefined,
    relationshipType: 'custom',
    relationshipStrength: undefined,
    ...initialData
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (field: keyof ContactFormData) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (field: keyof ContactFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleLocationChange = (location: LocationValue) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(formData);
      addNotification({
        type: "success",
        title: "Success",
        message: "Contact saved successfully"
      });
      onClose();
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to save contact"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setActiveStep(0);
      onClose();
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  // Step components
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Basic Information</h2>
              <p className="text-zinc-600">Let's start with the essential contact details</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white"
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white"
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Envelope size={16} className="text-blue-600" />
                  Primary Email
                </label>
                <input
                  type="email"
                  value={formData.emailPrimary}
                  onChange={handleChange('emailPrimary')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white"
                  placeholder="Enter primary email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Envelope size={16} className="text-blue-600" />
                  Secondary Email
                </label>
                <input
                  type="email"
                  value={formData.emailSecondary}
                  onChange={handleChange('emailSecondary')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white"
                  placeholder="Enter secondary email"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Phone size={16} className="text-green-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange('phoneNumber')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white"
                  placeholder="Enter phone number"
                />
              </div>
              
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                <MapPin size={16} className="text-red-600" />
                Location
              </label>
              <div className="border border-zinc-300 rounded-lg p-2 bg-white">
                <LocationSelect
                  value={formData.location}
                  onChange={handleLocationChange}
                />
              </div>
            </div>
          </div>
        );
        
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Company Information</h2>
              <p className="text-zinc-600">Add company details and professional information</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Buildings size={16} className="text-purple-600" />
                  Company
                </label>
                <CompanySelect
                  value={formData.company}
                  onChange={(company) => setFormData(prev => ({ ...prev, company }))}
                  placeholder="Search for a company..."
                />
              </div>
              
              {formData.company && (
                <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-zinc-800 flex items-center gap-2">
                    <Buildings size={16} className="text-brand-600" />
                    Selected Company
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-zinc-600">Name:</span>
                      <span className="ml-2 text-zinc-800">{formData.company.name}</span>
                    </div>
                    {formData.company.website && (
                      <div>
                        <span className="font-medium text-zinc-600">Website:</span>
                        <a 
                          href={formData.company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {formData.company.website}
                        </a>
                      </div>
                    )}
                    {formData.company.linkedinUrl && (
                      <div>
                        <span className="font-medium text-zinc-600">LinkedIn:</span>
                        <a 
                          href={formData.company.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    {formData.company.industry && (
                      <div>
                        <span className="font-medium text-zinc-600">Industry:</span>
                        <span className="ml-2 text-zinc-800">{formData.company.industry}</span>
                      </div>
                    )}
                    {formData.company.size && (
                      <div>
                        <span className="font-medium text-zinc-600">Size:</span>
                        <span className="ml-2 text-zinc-800">{formData.company.size} employees</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Social Media Links</h2>
              <p className="text-zinc-600">Add their social media presence and online profiles</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <LinkedinLogo size={16} className="text-blue-600" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange('linkedin')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <FacebookLogo size={16} className="text-blue-700" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={handleChange('facebook')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="https://facebook.com/username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <InstagramLogo size={16} className="text-pink-600" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={handleChange('instagram')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="https://instagram.com/username"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <Play size={16} className="text-orange-600" />
                  IMDB
                </label>
                <input
                  type="url"
                  value={formData.imdb}
                  onChange={handleChange('imdb')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="https://imdb.com/name/nm123456"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 flex items-center gap-2">
                  <BookOpen size={16} className="text-green-600" />
                  Wikipedia
                </label>
                <input
                  type="url"
                  value={formData.wikipedia}
                  onChange={handleChange('wikipedia')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="https://en.wikipedia.org/wiki/Name"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Flags & Biography</h2>
              <p className="text-zinc-600">Set flags and add biographical information</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700">Flags</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.seenFilm}
                      onChange={handleCheckboxChange('seenFilm')}
                      className="w-5 h-5 text-brand-600 border-zinc-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-zinc-700">Seen Film</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.docBranchMember}
                      onChange={handleCheckboxChange('docBranchMember')}
                      className="w-5 h-5 text-brand-600 border-zinc-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-zinc-700">Doc Branch Member</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700">Biography</label>
              <textarea
                value={formData.biography}
                onChange={handleChange('biography')}
                rows={4}
                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 resize-none"
                placeholder="Enter biographical information..."
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Priority & Assignment</h2>
              <p className="text-zinc-600">Set priority level, assign contact and set relationship details</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={handleChange('priority')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Relationship Type</label>
                <select
                  value={formData.relationshipType || 'custom'}
                  onChange={handleChange('relationshipType')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                >
                  <option value="surface_level">Surface Level</option>
                  <option value="mentor">Mentor</option>
                  <option value="supporter">Supporter</option>
                  <option value="colleague">Colleague</option>
                  <option value="friend">Friend</option>
                  <option value="exec">Executive</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Relationship Strength (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.relationshipStrength || ''}
                  onChange={handleChange('relationshipStrength')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="Rate relationship strength"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Assigned To User ID</label>
                <input
                  type="number"
                  value={formData.assignedToUserId || ''}
                  onChange={handleChange('assignedToUserId')}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                  placeholder="Enter user ID"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} className="max-w-4xl">
      <div className="bg-white rounded-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-brand-100 mt-1">Step {activeStep + 1} of {steps.length}</p>
        </div>
        
        {/* Progress Stepper */}
        <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-200">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel className="text-sm text-zinc-700">{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
        
        {/* Content */}
        <div className="p-6 min-h-[500px]">
          {renderStepContent(activeStep)}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-50 rounded-b-lg">
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2 text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors duration-200 disabled:opacity-50"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {activeStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Contact</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
