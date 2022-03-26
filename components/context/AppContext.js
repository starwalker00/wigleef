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
        // case 'set_profileID':
        //     console.log(`context profileIDApp: ${action.payload}`);
        //     namedConsoleLog('oldStateProfile', state)
        //     let newStateProfile = {
        //         profileIDApp: action.payload,
        //         // authenticateApp: state?.payload?.authenticateApp || initialState.authenticateApp
        //     };
        //     namedConsoleLog('newStateProfile', newStateProfile)
        //     debugger;
        //     return newStateProfile;
        // case 'set_authenticateApp':
        //     debugger;
        //     console.log(`set_authenticateApp authenticateApp: ${action.payload}`);
        //     namedConsoleLog('oldStateAccess', state)
        //     let newStateAccess = {
        //         // profileIDApp: state.profileIDApp, 
        //         authenticateApp: action.payload
        //     };
        //     namedConsoleLog('newStateAccess', newStateAccess)
        //     return newStateAccess;
        case 'set_appContext':
            console.log(`set_appContext payload: ${action.payload}`);
            namedConsoleLog('oldset_appContext', state)
            let newProfile = action.payload?.profileIDApp ?? state.profileIDApp;
            let newAccess = action.payload?.authenticateApp ?? state.authenticateApp;
            let newStateAppContext = {
                profileIDApp: newProfile,
                authenticateApp: newAccess,
            };
            namedConsoleLog('newset_appContext', newStateAppContext)
            debugger;
            return newStateAppContext;
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
