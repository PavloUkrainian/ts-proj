import { createContext, useContext, ReactNode } from 'react';

interface UserContextType {
  userId: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * User context provider.
 * TODO: In a real application, this should be populated from authentication.
 * For now, it defaults to user ID 1 as a placeholder.
 */
export function UserProvider({ children }: UserProviderProps) {
  // In a real app, this would come from authentication state
  const userId = 1;

  return (
    <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

