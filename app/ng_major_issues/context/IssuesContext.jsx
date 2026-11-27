'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { getStoredAuth } from '@/lib/auth';

const USERS_API = 'https://gti-shift-scheduler.vercel.app/api/users';
const DROPDOWNS_API = '/api/issues/dropdowns';

const IssuesContext = createContext(null);

export function IssuesProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [currentUser, setCurrentUserState] = useState(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const auth = getStoredAuth();
        if (auth && auth.employeeId) {
          setCurrentUserState({
            EmployeeId: auth.employeeId,
            Username: auth.fullName || auth.employeeId,
            Position: auth.role || '',
            role: auth.role || '',
            Department: auth.department || '',
          });
        }
      } catch (err) {
        console.warn('Unable to read logged-in user from SecureLS:', err);
      }
    });
  }, []);

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user);
  }, []);

  const [dropdowns, setDropdowns] = useState({});
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(USERS_API)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data?.users ?? [];
          setUsers(list);
        }
      })
      .catch((err) => {
        console.error('[IssuesContext] Failed to load users:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(DROPDOWNS_API)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const map = {};
          (Array.isArray(data) ? data : []).forEach(({ FieldName, Options }) => {
            map[FieldName] = Options
              ? Options.split(',').map((o) => o.trim()).filter(Boolean)
              : [];
          });
          setDropdowns(map);
        }
      })
      .catch((err) => {
        console.error('[IssuesContext] Failed to load dropdowns:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingDropdowns(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hosUsers = users.filter((u) => u.Position === 'HOS');
  const allUsers = users;

  const value = {
    users,
    allUsers,
    hosUsers,
    loadingUsers,
    currentUser,
    setCurrentUser,
    dropdowns,
    loadingDropdowns,
  };

  return (
    <IssuesContext.Provider value={value}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssuesContext);
  if (!ctx) {
    throw new Error('useIssues() must be used within an <IssuesProvider>.');
  }
  return ctx;
}

export default IssuesContext;
