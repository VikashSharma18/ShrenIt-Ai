import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  const admin_logout = () => {
    setAdmin(null); // Clear admin data
    setStudent(null); // Optionally clear student data if needed
  };

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent));
      } catch (error) {
        console.error('Error parsing student data:', error);
        localStorage.removeItem('student');
      }
    }
    setLoading(false);
  }, []);

  const login = (studentData) => {
    localStorage.setItem('student', JSON.stringify(studentData));
    setStudent(studentData);
  };

  const logout = () => {
    localStorage.removeItem('student');
    setStudent(null);
  };

  return (
    <AuthContext.Provider value={{ student, login, logout, loading, admin, setAdmin, admin_logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};