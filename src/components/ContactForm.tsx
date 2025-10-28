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
  StepLabel,
  Slider
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
import UserAutocomplete, { UserOption } from '@/components/users/UserAutocomplete';
import ContactAutocomplete, { ContactOption } from '@/components/contacts/ContactAutocomplete';
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
  assignedToUser?: UserOption; // Full user data for assignment
  // Relationship fields
  hasRelationship: boolean;
  relationshipType?: string;
  relationshipStrength?: number;
  relationshipWith?: 'internal_user' | 'external_contact' | 'internal_contact';
  relatedUserId?: number; // For internal user relationships
  relatedUser?: UserOption; // Full user data for relationship
  relatedContactId?: number; // For internal contact relationships
  relatedContact?: ContactOption; // Full contact data for relationship
  relatedExternalName?: string; // For external contact relationships
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
  'Company & Social Media',
  'Biography & Flags', 
  'Relationships',
  'Assignment'
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
    assignedToUser: undefined,
    // Relationship defaults
    hasRelationship: false,
    relationshipType: 'custom',
    relationshipStrength: 5,
    relationshipWith: undefined,
    relatedUserId: undefined,
    relatedUser: undefined,
    relatedContactId: undefined,
    relatedContact: undefined,
    relatedExternalName: undefined,
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
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Company & Social Media</h2>
              <p className="text-zinc-600">Add company details and social media profiles</p>
            </div>
            
            {/* Company Section */}
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

            {/* Social Media Section */}
            <div className="space-y-6">
              <div className="border-t border-zinc-200 pt-6">
                <h3 className="text-lg font-semibold text-zinc-800 mb-4">Social Media Links</h3>
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
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Biography & Flags</h2>
              <p className="text-zinc-600">Add biographical information and set contact flags</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700">Biography</label>
                <textarea
                  value={formData.biography}
                  onChange={handleChange('biography')}
                  rows={6}
                  className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 resize-none"
                  placeholder="Enter biographical information about this contact..."
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700">Contact Flags</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.seenFilm}
                        onChange={handleCheckboxChange('seenFilm')}
                        className="w-5 h-5 text-brand-600 border-zinc-300 rounded focus:ring-brand-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-zinc-700">Seen Film</span>
                        <p className="text-xs text-zinc-500">Contact has seen our film</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.docBranchMember}
                        onChange={handleCheckboxChange('docBranchMember')}
                        className="w-5 h-5 text-brand-600 border-zinc-300 rounded focus:ring-brand-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-zinc-700">Doc Branch Member</span>
                        <p className="text-xs text-zinc-500">Member of documentary branch</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Relationships</h2>
              <p className="text-zinc-600">Define relationship details and connections</p>
            </div>
            
            {/* Relationship Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Relationship Details
              </h3>
              
              <div className="space-y-6">
                {/* Has Relationship Yes/No */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-700">Any relationship with the contact?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasRelationship"
                        checked={formData.hasRelationship === true}
                        onChange={() => setFormData(prev => ({ ...prev, hasRelationship: true }))}
                        className="w-4 h-4 text-brand-600 border-zinc-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-zinc-700">Yes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasRelationship"
                        checked={formData.hasRelationship === false}
                        onChange={() => setFormData(prev => ({ 
                          ...prev, 
                          hasRelationship: false,
                          relationshipWith: undefined,
                          relatedUserId: undefined,
                          relatedContactId: undefined,
                          relatedExternalName: undefined
                        }))}
                        className="w-4 h-4 text-brand-600 border-zinc-300 focus:ring-brand-500"
                      />
                      <span className="text-sm text-zinc-700">No</span>
                    </label>
                  </div>
                  <p className="text-xs text-zinc-500">Select Yes to define relationship details</p>
                </div>

                {/* Conditional Relationship Fields */}
                {formData.hasRelationship && (
                  <div className="space-y-6 border-t border-purple-200 pt-6">
                    {/* Relationship With */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-700">Relationship With</label>
                      <select
                        value={formData.relationshipWith || ''}
                        onChange={handleChange('relationshipWith')}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                      >
                        <option value="">Select relationship type</option>
                        <option value="internal_user">Internal User</option>
                        <option value="external_contact">External Contact</option>
                        <option value="internal_contact">Internal Contact</option>
                      </select>
                      <p className="text-xs text-zinc-500">Choose who this contact has a relationship with</p>
                    </div>

                    {/* Internal User Selection */}
                    {formData.relationshipWith === 'internal_user' && (
                      <div className="space-y-2">
                        <UserAutocomplete
                          value={formData.relatedUser || null}
                          onChange={(user) => setFormData(prev => ({ 
                            ...prev, 
                            relatedUserId: user?.id,
                            relatedUser: user || undefined,
                            relatedContactId: undefined,
                            relatedContact: undefined,
                            relatedExternalName: undefined
                          }))}
                          label="Select Internal User"
                          placeholder="Type to search users..."
                          minSearchLength={1}
                        />
                        <p className="text-xs text-zinc-500">Search and select an internal user</p>
                      </div>
                    )}

                    {/* Internal Contact Selection */}
                    {formData.relationshipWith === 'internal_contact' && (
                      <div className="space-y-2">
                        <ContactAutocomplete
                          value={formData.relatedContact || null}
                          onChange={(contact) => setFormData(prev => ({ 
                            ...prev, 
                            relatedContactId: contact?.id,
                            relatedContact: contact || undefined,
                            relatedUserId: undefined,
                            relatedUser: undefined,
                            relatedExternalName: undefined
                          }))}
                          label="Select Internal Contact"
                          placeholder="Type to search contacts..."
                          minSearchLength={2}
                        />
                        <p className="text-xs text-zinc-500">Search and select an internal contact</p>
                      </div>
                    )}

                    {/* External Contact Input */}
                    {formData.relationshipWith === 'external_contact' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700">External Contact Name</label>
                        <input
                          type="text"
                          value={formData.relatedExternalName || ''}
                          onChange={handleChange('relatedExternalName')}
                          className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
                          placeholder="Enter external contact name"
                        />
                        <p className="text-xs text-zinc-500">Enter the name of the external contact</p>
                      </div>
                    )}

                    {/* Relationship Type */}
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
                      <p className="text-xs text-zinc-500">Define the nature of the relationship</p>
                    </div>

                    {/* Relationship Strength Slider */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-zinc-700">
                        Relationship Strength: {formData.relationshipStrength || 5}/10
                      </label>
                      <div className="px-2">
                        <Slider
                          value={formData.relationshipStrength || 5}
                          onChange={(_, value) => setFormData(prev => ({ ...prev, relationshipStrength: value as number }))}
                          min={1}
                          max={10}
                          step={1}
                          marks={[
                            { value: 1, label: '1' },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' }
                          ]}
                          className="text-brand-600"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Weak</span>
                        <span>Strong</span>
                      </div>
                      <p className="text-xs text-zinc-500">Rate the strength of this relationship</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">Assignment</h2>
              <p className="text-zinc-600">Set priority level and assign contact to team members</p>
            </div>
            
            {/* Priority Level Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Priority Level
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'NONE', label: 'None', color: 'bg-gray-100 text-gray-800 border-gray-200' },
                  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
                  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' }
                ].map((option) => (
                  <label key={option.value} className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 hover:shadow-sm ${formData.priority === option.value ? option.color + ' border-opacity-100' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                    <input
                      type="radio"
                      name="priority"
                      value={option.value}
                      checked={formData.priority === option.value}
                      onChange={handleChange('priority')}
                      className="sr-only"
                    />
                    <div className="font-medium text-sm">{option.label}</div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">Set the priority level for this contact</p>
            </div>

            {/* Assignment Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Assign Contact
              </h3>
              
              <div className="space-y-4">
                {/* Assignment Status */}
                <div className="bg-white rounded-lg border border-zinc-200 p-4">
                  <h4 className="font-medium text-zinc-800 mb-2">Assignment Status</h4>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${formData.assignedToUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm text-zinc-600">
                      {formData.assignedToUser ? 'Contact is assigned' : 'Contact is unassigned'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <UserAutocomplete
                    value={formData.assignedToUser || null}
                    onChange={(user) => setFormData(prev => ({ 
                      ...prev, 
                      assignedToUserId: user?.id,
                      assignedToUser: user || undefined
                    }))}
                    label="Assign to"
                    placeholder="Type to search users..."
                    minSearchLength={1}
                  />
                  <p className="text-xs text-zinc-500">Assign this contact to a system user for management and follow-up</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} className="max-w-6xl">
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
        <div className="p-6 min-h-[500px] max-h-[80vh] overflow-y-auto">
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
