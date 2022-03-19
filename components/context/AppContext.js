import { useReducer, useContext, createContext } from 'react'
import { ethers } from 'ethers';

const AppStateContext = createContext()
const AppDispatchContext = createContext()

const reducer = (state, action) => {
    switch (action.type) {
        case 'set_profileID':
            console.log(`profileIDApp: ${action.payload}`)
            return action.payload
        default:
            throw new Error(`Unknown action: ${action.type}`)
    }
}

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, ethers.BigNumber.from(0))
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
