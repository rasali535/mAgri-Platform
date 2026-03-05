import React, { createContext, useContext, useState } from 'react';

export type Country = {
  code: string;
  name: string;
  currency: string;
  flag: string;
  rate: number; // Conversion rate from base (ZMW)
};

export const COUNTRIES: Country[] = [
  { code: 'ZM', name: 'Zambia', currency: 'ZMW', flag: '🇿🇲', rate: 1 },
  { code: 'BW', name: 'Botswana', currency: 'BWP', flag: '🇧🇼', rate: 0.5 },
  { code: 'CI', name: 'Côte d\'Ivoire', currency: 'XOF', flag: '🇨🇮', rate: 25 },
  { code: 'CD', name: 'DRC', currency: 'CDF', flag: '🇨🇩', rate: 100 },
  { code: 'CM', name: 'Cameroon', currency: 'XAF', flag: '🇨🇲', rate: 25 },
];

type CurrencyContextType = {
  country: Country;
  setCountry: (c: Country) => void;
  formatCurrency: (baseAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);

  const formatCurrency = (baseAmount: number) => {
    const converted = Math.round(baseAmount * country.rate);
    return `${converted.toLocaleString()} ${country.currency}`;
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
