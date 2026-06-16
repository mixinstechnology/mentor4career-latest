import React, { createContext, useContext, useState, useEffect } from 'react';
import { setGlobalLoaderFunctions } from '../utils/globalLoader';

type LoaderContextType = {
  isLoading: boolean;
  show: () => void;
  hide: () => void;
};

const LoaderContext = createContext<LoaderContextType>({
  isLoading: false,
  show: () => {},
  hide: () => {},
});

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const show = () => setIsLoading(true);
  const hide = () => setIsLoading(false);

  useEffect(() => {
    setGlobalLoaderFunctions(show, hide);
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, show, hide }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
