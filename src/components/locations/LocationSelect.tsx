"use client";
import * as React from 'react';
import { Box, TextField, Autocomplete } from '@mui/material';

type Country = { code: string; name: string };
type State = { code: string; name: string };
type City = { id: number; city: string; city_ascii: string };

export type LocationValue = {
  countryCode: string | null;
  stateCode: string | null;
  cityId: number | null;
  stateText?: string | null;
  cityText?: string | null;
};

type Props = {
  value?: LocationValue;
  onChange?: (value: LocationValue) => void;
};

export default function LocationSelect({ value, onChange }: Props) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);

  const [countryCode, setCountryCode] = React.useState<string | ''>(value?.countryCode || 'US');
  const [stateCode, setStateCode] = React.useState<string | ''>(value?.stateCode || '');
  const [cityId, setCityId] = React.useState<number | ''>(value?.cityId || '');
  const [stateText, setStateText] = React.useState<string>(value?.stateText || '');
  const [cityText, setCityText] = React.useState<string>(value?.cityText || '');

  React.useEffect(() => {
    fetch('/api/locations/countries').then(r => r.json()).then(res => {
      if (res.success) setCountries(res.data);
    });
  }, []);

  React.useEffect(() => {
    if (countryCode === 'US') {
      fetch(`/api/locations/states?country=${countryCode}`).then(r => r.json()).then(res => {
        if (res.success) setStates(res.data);
      });
    } else {
      setStates([]);
      setStateCode('');
      setCities([]);
      setCityId('');
    }
  }, [countryCode]);

  React.useEffect(() => {
    if (countryCode === 'US' && stateCode) {
      fetch(`/api/locations/cities?country=${countryCode}&state=${stateCode}`).then(r => r.json()).then(res => {
        if (res.success) setCities(res.data);
      });
    } else {
      setCities([]);
      setCityId('');
    }
  }, [countryCode, stateCode]);

  React.useEffect(() => {
    onChange?.({
      countryCode: countryCode || null,
      stateCode: countryCode === 'US' ? (stateCode || null) : null,
      cityId: countryCode === 'US' ? (cityId === '' ? null : Number(cityId)) : null,
      stateText: countryCode !== 'US' ? (stateText || null) : null,
      cityText: countryCode !== 'US' ? (cityText || null) : null
    });
  }, [countryCode, stateCode, cityId, stateText, cityText]);

  const onStateText = (e: React.ChangeEvent<HTMLInputElement>) => setStateText(e.target.value);
  const onCityText = (e: React.ChangeEvent<HTMLInputElement>) => setCityText(e.target.value);

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <Autocomplete
        size="small"
        options={countries}
        getOptionLabel={(option) => option.name}
        value={countries.find(c => c.code === countryCode) || null}
        onChange={(event, newValue) => {
          setCountryCode(newValue?.code || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Country"
            placeholder="Select country"
            sx={{ minWidth: 180 }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.name}
          </Box>
        )}
      />

      {countryCode === 'US' && (
        <Autocomplete
          size="small"
          options={states}
          getOptionLabel={(option) => option.name}
          value={states.find(s => s.code === stateCode) || null}
          onChange={(event, newValue) => {
            setStateCode(newValue?.code || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="State"
              placeholder="Select state"
              sx={{ minWidth: 180 }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option.name}
            </Box>
          )}
        />
      )}

      {countryCode === 'US' && stateCode && (
        <Autocomplete
          size="small"
          options={cities}
          getOptionLabel={(option) => option.city}
          value={cities.find(c => c.id === cityId) || null}
          onChange={(event, newValue) => {
            setCityId(newValue?.id || '');
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="City"
              placeholder="Select city"
              sx={{ minWidth: 180 }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              {option.city}
            </Box>
          )}
        />
      )}

      {countryCode && countryCode !== 'US' && (
        <>
          <TextField
            size="small"
            label="State/Province"
            value={stateText}
            onChange={onStateText}
            sx={{ minWidth: 180 }}
            placeholder="Enter state or province"
          />
          <TextField
            size="small"
            label="City"
            value={cityText}
            onChange={onCityText}
            sx={{ minWidth: 180 }}
            placeholder="Enter city name"
          />
        </>
      )}
    </Box>
  );
}

