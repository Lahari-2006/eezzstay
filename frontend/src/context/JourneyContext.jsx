import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { journeyApi } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const JourneyContext = createContext(null);

export const JourneyProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJourney = useCallback(async (showCelebration = false) => {
    if (!isAuthenticated || (user?.role !== 'student' && user?.role !== 'parent')) {
      setJourney(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await journeyApi.getMyJourney();
      const newJourney = res.data;
      setJourney(newJourney);

      if (showCelebration && newJourney?.readiness?.total_score >= 85) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Failed to load student relocation journey:", err);
      setError("Unable to load student dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  const refreshJourney = (celebrate = false) => {
    return fetchJourney(celebrate);
  };

  return (
    <JourneyContext.Provider
      value={{
        journey,
        readiness: journey?.readiness || null,
        milestones: journey?.milestones || [],
        alerts: journey?.alerts || [],
        loading,
        error,
        refreshJourney,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
