import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const defaultProfile = {
  age: null,
  monthly_income: null,
  monthly_expenses: null,
  health_score: null,
  health_score_dimensions: null,
  risk_appetite: 'moderate',
  tax_bracket: null,
  has_completed_onboarding: false
};

export const UserProvider = ({ children }) => {
  const [profile, setProfile] = useState(defaultProfile);

  const updateProfile = (newData) => {
    setProfile(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};
