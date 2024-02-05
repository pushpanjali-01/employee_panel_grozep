import React, { createContext, useEffect, useReducer } from 'react';
import { Loading } from 'app/components';
import { url } from 'app/constants';

const TOKEN_KEY = 'accessToken';

const initialState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
};

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

const clearSessionAfterTimeout = () => {

    setTimeout(() => {
      localStorage.removeItem(TOKEN_KEY);
    }, 10 * 60 * 60 * 1000); // 8 hours in milliseconds
  };
const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isAuthenticated, user } = action.payload;

      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;

      return {
        ...state,
        isAuthenticated: true,
        user,
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    }

    default: {
      return { ...state };
    }
  }
};

const AuthContext = createContext({
  ...initialState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = async (number, codeString) => {
    const code = parseInt(codeString);
    // typeof number
    const response = await url.post('v1/employee/login/phone-verification', {
      number,
      code,
    });

    if (response.data.status === false) {
      throw new Error('Invalid OTP');
    }

    setSession(response.data.token);
    clearSessionAfterTimeout(); // Set a timeout to clear token after 8 hours

    const responseuserData = await url.get('v1/in/employees/', {
      headers: {
        Authorization: 'Bearer ' + response.data.token,
      },
    });
    const user = responseuserData.data.data;
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = window.localStorage.getItem(TOKEN_KEY);
        if (accessToken) {
          setSession(accessToken);
          clearSessionAfterTimeout(); // Reset the timeout when initializing
          const responseuserData = await url.get('v1/in/employees/', {
            headers: {
              Authorization: 'Bearer ' + accessToken,
            },
          });
          const user = responseuserData.data.data;
          dispatch({
            type: 'INIT',
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: 'INIT',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'INIT',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    })();
  }, []);

  if (!state.isInitialised) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
