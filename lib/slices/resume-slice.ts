import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Experience {
  position: string
  company: string
  duration: string
  description?: string
}

interface Education {
  degree: string
  institution: string
  year: string
  gpa?: string
}

interface ResumeData {
  name: string
  email?: string
  phone?: string
  location?: string
  skills: string[]
  experience: Experience[]
  education: Education[]
}

interface ResumeState {
  data: ResumeData | null
  loading: boolean
  error: string | null
}

const initialState: ResumeState = {
  data: null,
  loading: false,
  error: null,
}

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumeData: (state, action: PayloadAction<ResumeData>) => {
      state.data = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearResumeData: (state) => {
      state.data = null
      state.error = null
    },
  },
})

export const { setResumeData, setLoading, setError, clearResumeData } = resumeSlice.actions
export default resumeSlice.reducer
