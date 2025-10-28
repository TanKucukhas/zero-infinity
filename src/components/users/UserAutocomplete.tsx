"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress, Box, Typography, Chip } from '@mui/material';
import { User } from 'phosphor-react';
import { useUser } from '@/contexts/user-context';

export interface UserOption {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

interface UserAutocompleteProps {
  value: UserOption | null;
  onChange: (user: UserOption | null) => void;
  placeholder?: string;
  label?: string;
  minSearchLength?: number;
  disabled?: boolean;
}

export default function UserAutocomplete({
  value,
  onChange,
  placeholder = "Type to search users...",
  label = "Select User",
  minSearchLength = 1,
  disabled = false
}: UserAutocompleteProps) {
  const { user } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (searchTerm: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (searchTerm.length >= minSearchLength) {
          fetchUsers(searchTerm);
        } else {
          setOptions([]);
        }
      }, 300);
    };
  }, [minSearchLength]);

  const fetchUsers = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'x-user': JSON.stringify(user)
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOptions(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
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

  const handleChange = (event: React.SyntheticEvent, newValue: UserOption | null) => {
    onChange(newValue);
  };

  const getOptionLabel = (option: UserOption | string) => {
    if (typeof option === 'string') return option;
    const fullName = `${option.name} ${option.lastName || ''}`.trim();
    return `${fullName} (${option.email})`;
  };

  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: UserOption) => {
    const fullName = `${option.name} ${option.lastName || ''}`.trim();
    
    return (
      <Box component="li" {...props} key={option.id}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-zinc-800">{fullName}</div>
              <div className="text-sm text-zinc-500">{option.email}</div>
            </div>
          </div>
          <Chip 
            label={option.role} 
            size="small" 
            color={option.role === 'admin' ? 'error' : option.role === 'editor' ? 'warning' : 'default'}
            variant="outlined"
          />
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
              : 'No users found'
        }
        clearOnBlur={false}
        selectOnFocus
        handleHomeEndKeys
        className="w-full"
      />
      
      {value && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-blue-600" />
              </div>
              <div>
                <span className="font-medium text-blue-800">
                  {`${value.name} ${value.lastName || ''}`.trim()}
                </span>
                <span className="text-blue-600 ml-2">({value.email})</span>
              </div>
            </div>
            <button
              onClick={() => onChange(null)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
