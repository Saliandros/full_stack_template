import { createContext, useState } from "react";
import type { ReactNode } from "react";

export interface AppContextType {
  value: string;
  setValue: (newValue: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState("default value");

  return (
    <AppContext.Provider value={{ value, setValue }}>
      {children}
    </AppContext.Provider>
  );
};
