import React, { createContext, useContext } from 'react';
import { AppDependencies, initDependencies } from './AppDependencies';

// Création du contexte
const ServiceContext = createContext<AppDependencies | null>(null);

// Le Provider qui enveloppera l'application
export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // On initialise les dépendances une seule fois
  // Note : en prod, on pourrait utiliser useMemo, mais ici l'objet est statique
  const dependencies = initDependencies();

  return (
    <ServiceContext.Provider value={dependencies}>
      {children}
    </ServiceContext.Provider>
  );
};

// Un Hook custom pour consommer les services facilement dans les composants
export const useServices = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};
