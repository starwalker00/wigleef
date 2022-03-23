import { useReducer, useContext, createContext } from 'react'
import { ethers } from 'ethers';
import {
    UNSET_CONTEXT_PROFILE_ID,
    UNSET_CONTEXT_ACCESS_TOKEN,
    UNSET_CONTEXT_REFRESH_TOKEN
} from '../../lib/config';
import { namedConsoleLog } from '../../lib/helpers';

const AppStateContext = createContext();
const AppDispatchContext = createContext();
const initialState = {
    profileIDApp: UNSET_CONTEXT_PROFILE_ID,
    authenticateApp: {
        accessToken: UNSET_CONTEXT_ACCESS_TOKEN,
        refreshToken: UNSET_CONTEXT_ACCESS_TOKEN
    }
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'set_profileID':
            console.log(`context profileIDApp: ${action.payload}`);
            // namedConsoleLog('state', state)
            // namedConsoleLog('state', state)
            return { profileIDApp: action.payload, authenticateApp: initialState.authenticateApp }
        case 'set_authenticateApp':
            console.log(`context authenticateApp: ${action.payload}`);
            // namedConsoleLog('state', state)
            // namedConsoleLog('state', state)
            return { profileIDApp: state.profileIDApp, authenticateApp: action.payload }
        default:
            throw new Error(`Unknown action: ${action.type}`)
    }
}

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <AppDispatchContext.Provider value={dispatch}>
            <AppStateContext.Provider value={state}>
                {children}
            </AppStateContext.Provider>
        </AppDispatchContext.Provider>
    )
}

export const useProfileID = () => useContext(AppStateContext)
export const useDispatchProfileID = () => useContext(AppDispatchContext)
