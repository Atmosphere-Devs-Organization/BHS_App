// src/contexts/ClubContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Club } from '@/interfaces/club';

interface ClubContextType {
  clubsCache: Club[];
  setClubsCache: (clubs: Club[]) => void;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clubsCache, setClubsCache] = useState<Club[]>([]);
  return (
    <ClubContext.Provider value={{ clubsCache, setClubsCache }}>
      {children}
    </ClubContext.Provider>
  );
};

export const useClubContext = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClubContext must be used within a ClubProvider');
  }
  return context;
};
