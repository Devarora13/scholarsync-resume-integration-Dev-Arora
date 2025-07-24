import { configureStore } from "@reduxjs/toolkit"
import resumeReducer from "./slices/resume-slice"
import scholarReducer from "./slices/scholar-slice"
import suggestionsReducer from "./slices/suggestions-slice"

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    scholar: scholarReducer,
    suggestions: suggestionsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
