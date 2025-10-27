"use client";
import * as React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';

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

  const [countryCode, setCountryCode] = React.useState<string | ''>(value?.countryCode || '');
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
      cityText: countryCode !== 'US' ? (cityText || null) : (countryCode === 'US' ? (cityText || null) : null)
    });
  }, [countryCode, stateCode, cityId, stateText, cityText]);

  const onCountry = (e: SelectChangeEvent) => setCountryCode(e.target.value as string);
  const onState = (e: SelectChangeEvent) => setStateCode(e.target.value as string);
  const onCity = (e: SelectChangeEvent) => {
    setCityId(Number(e.target.value));
    if (e.target.value) {
      setCityText(''); // Clear text input when selecting from dropdown
    }
  };
  const onStateText = (e: React.ChangeEvent<HTMLInputElement>) => setStateText(e.target.value);
  const onCityText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityText(e.target.value);
    if (e.target.value) {
      setCityId(''); // Clear dropdown selection when typing
    }
  };

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="country-label">Country</InputLabel>
        <Select labelId="country-label" label="Country" value={countryCode} onChange={onCountry}>
          <MenuItem value="">None</MenuItem>
          {countries.map(c => (
            <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {countryCode === 'US' && (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="state-label">State</InputLabel>
          <Select labelId="state-label" label="State" value={stateCode} onChange={onState}>
            <MenuItem value="">None</MenuItem>
            {states.map(s => (
              <MenuItem key={s.code} value={s.code}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {countryCode === 'US' && stateCode && (
        <Box display="flex" gap={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="city-label">City</InputLabel>
            <Select labelId="city-label" label="City" value={cityId === '' ? '' : String(cityId)} onChange={onCity}>
              <MenuItem value="">None</MenuItem>
              {cities.map(c => (
                <MenuItem key={c.id} value={String(c.id)}>{c.city}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Or type city"
            value={cityText}
            onChange={onCityText}
            sx={{ minWidth: 180 }}
            placeholder="Enter city name"
          />
        </Box>
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

