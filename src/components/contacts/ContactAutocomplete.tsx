"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Chip } from '@mui/material';
import { User } from 'phosphor-react';

export interface ContactOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: {
    name: string;
  };
}

interface ContactAutocompleteProps {
  value: ContactOption | null;
  onChange: (contact: ContactOption | null) => void;
  placeholder?: string;
  label?: string;
  minSearchLength?: number;
  disabled?: boolean;
}

export default function ContactAutocomplete({
  value,
  onChange,
  placeholder = "Type to search contacts...",
  label = "Select Contact",
  minSearchLength = 2,
  disabled = false
}: ContactAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ContactOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (searchTerm.length >= minSearchLength) {
          fetchContacts(searchTerm);
        } else {
          setOptions([]);
        }
      }, 300);
    };
  }, [minSearchLength]);

  const fetchContacts = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/contacts?search=${encodeURIComponent(searchTerm)}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOptions(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inputValue.length >= minSearchLength) {
      debouncedSearch(inputValue);
    } else {
      setOptions([]);
    }
  }, [inputValue, debouncedSearch]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: ContactOption | null) => {
    onChange(newValue);
  };

  const getOptionLabel = (option: ContactOption | string) => {
    if (typeof option === 'string') return option;
    const fullName = `${option.firstName || ''} ${option.lastName || ''}`.trim();
    return `${fullName} (${option.email || 'No email'})`;
  };

  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: ContactOption) => {
    const fullName = `${option.firstName || ''} ${option.lastName || ''}`.trim();
    
    return (
      <Box component="li" {...props} key={option.id}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-green-600" />
            </div>
            <div>
              <div className="font-medium text-zinc-800">{fullName}</div>
              <div className="text-sm text-zinc-500">{option.email || 'No email'}</div>
              {option.company?.name && (
                <div className="text-xs text-zinc-400">{option.company.name}</div>
              )}
            </div>
          </div>
        </div>
      </Box>
    );
  };

  const renderInput = (params: any) => (
    <TextField
      {...params}
      label={label}
      placeholder={placeholder}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
      error={!!error}
      helperText={error}
    />
  );

  return (
    <div className="space-y-2">
      <Autocomplete
        value={value}
        onChange={handleChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}
        renderInput={renderInput}
        loading={loading}
        disabled={disabled}
        isOptionEqualToValue={(option, value) => {
          if (typeof option === 'string' || typeof value === 'string') return false;
          return option.id === value.id;
        }}
        noOptionsText={
          inputValue.length < minSearchLength 
            ? `Type at least ${minSearchLength} character${minSearchLength > 1 ? 's' : ''} to search`
            : loading 
              ? 'Searching...'
              : 'No contacts found'
        }
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        className="w-full"
      />
      
      {value && (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-green-600" />
              </div>
              <div>
                <span className="font-medium text-green-800">
                  {`${value.firstName || ''} ${value.lastName || ''}`.trim()}
                </span>
                <span className="text-green-600 ml-2">({value.email || 'No email'})</span>
              </div>
            </div>
            <button
              onClick={() => onChange(null)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
