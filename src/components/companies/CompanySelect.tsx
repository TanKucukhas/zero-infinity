"use client";
import * as React from 'react';
import { 
  Autocomplete, 
  TextField, 
  Box, 
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import { Buildings, Plus } from 'phosphor-react';
import CompanyFormModal from './CompanyFormModal';

export interface Company {
  id: number;
  name: string;
  website: string;
  linkedinUrl: string;
  industry: string;
  size: string;
  description: string;
  logoUrl: string;
  headquarters: {
    countryCode: string;
    stateCode: string;
    cityId: number;
    countryName: string;
    stateName: string;
    cityName: string;
  };
  createdAt: number;
  updatedAt: number;
}

interface CompanySelectProps {
  value: Company | null;
  onChange: (company: Company | null) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function CompanySelect({ 
  value, 
  onChange, 
  placeholder = "Search for a company...",
  disabled = false,
  error = false,
  helperText
}: CompanySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<Company[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [showAddNew, setShowAddNew] = React.useState(false);
  const [companyModalOpen, setCompanyModalOpen] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      setShowAddNew(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/companies?search=${encodeURIComponent(inputValue)}&limit=10`);
        const data = await response.json();
        
        if (data.success) {
          setOptions(data.data);
          // Show "Add New" option if no exact match found
          const exactMatch = data.data.some((company: Company) => 
            company.name.toLowerCase() === inputValue.toLowerCase()
          );
          setShowAddNew(!exactMatch);
        } else {
          setOptions([]);
          setShowAddNew(true);
        }
      } catch (error) {
        console.error('Error searching companies:', error);
        setOptions([]);
        setShowAddNew(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const handleCompanyCreated = (newCompany: Company) => {
    setOptions(prev => [newCompany, ...prev]);
    onChange(newCompany);
    setCompanyModalOpen(false);
  };

  const handleAddNewClick = () => {
    setCompanyModalOpen(true);
  };

  const renderOption = (props: any, option: any) => {
    if (option.isAddNew) {
      return (
        <Box
          {...props}
          key="add-new"
          onClick={handleAddNewClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Plus size={16} color="#666" />
          <Typography variant="body2" color="primary">
            Add "{inputValue}" as new company
          </Typography>
        </Box>
      );
    }

    return (
      <Box {...props} key={option.id}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Buildings size={16} color="#666" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="medium">
              {option.name}
            </Typography>
            {option.industry && (
              <Typography variant="caption" color="text.secondary">
                {option.industry}
                {option.size && ` • ${option.size}`}
              </Typography>
            )}
          </Box>
          {option.website && (
            <Chip 
              label="Website" 
              size="small" 
              variant="outlined" 
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      </Box>
    );
  };

  const optionsWithAddNew = React.useMemo(() => {
    if (showAddNew && inputValue.length >= 2) {
      return [...options, { isAddNew: true, name: inputValue, id: 'add-new' }];
    }
    return options;
  }, [options, showAddNew, inputValue]);

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (newValue === null) {
            // Clear selection
            onChange(null);
            setInputValue('');
          } else if (newValue && !newValue.isAddNew) {
            // Select a company
            onChange(newValue);
            setInputValue(newValue.name);
          }
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={optionsWithAddNew}
        getOptionLabel={(option) => {
          if (option.isAddNew) return '';
          return option.name || '';
        }}
        isOptionEqualToValue={(option, value) => {
          if (option.isAddNew || value.isAddNew) return false;
          return option.id === value.id;
        }}
        loading={loading}
        disabled={disabled}
        clearOnEscape={true}
        clearOnBlur={false}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <Buildings size={16} color="#666" />
                </Box>
              ),
              endAdornment: (
                <React.Fragment>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
        renderOption={renderOption}
        noOptionsText={
          inputValue.length < 2 
            ? "Type at least 2 characters to search..." 
            : "No companies found"
        }
        filterOptions={(x) => x} // Disable default filtering since we're doing server-side search
      />

      <CompanyFormModal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onCompanyCreated={handleCompanyCreated}
        initialName={inputValue}
      />
    </>
  );
}
