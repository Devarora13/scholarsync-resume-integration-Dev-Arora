import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface ProjectSuggestion {
  title: string
  description: string
  skillsRequired: string[]
  researchAreas: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedDuration: string
  category: string
  matchScore: number
}

interface SuggestionsState {
  data: ProjectSuggestion[] | null
  loading: boolean
  error: string | null
}

const initialState: SuggestionsState = {
  data: null,
  loading: false,
  error: null,
}

const suggestionsSlice = createSlice({
  name: "suggestions",
  initialState,
  reducers: {
    setSuggestions: (state, action: PayloadAction<ProjectSuggestion[]>) => {
      state.data = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearSuggestions: (state) => {
      state.data = null
      state.error = null
    },
  },
})

export const { setSuggestions, setLoading, setError, clearSuggestions } = suggestionsSlice.actions
export default suggestionsSlice.reducer
