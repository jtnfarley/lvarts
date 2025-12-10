'use client';

import User from '@/lib/models/user';
import { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
}

export const UserContext = createContext<UserContextType>({ 
  user: undefined, 
  setUser: (user) => {user} 
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);