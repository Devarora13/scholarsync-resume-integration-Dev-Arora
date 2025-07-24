import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Publication {
  title: string
  authors: string
  journal?: string
  year?: string
  citations?: number
}

interface ScholarData {
  name: string
  affiliation?: string
  email?: string
  totalCitations: number
  hIndex: number
  i10Index: number
  researchInterests: string[]
  publications: Publication[]
}

interface ScholarState {
  data: ScholarData | null
  loading: boolean
  error: string | null
}

const initialState: ScholarState = {
  data: null,
  loading: false,
  error: null,
}

const scholarSlice = createSlice({
  name: "scholar",
  initialState,
  reducers: {
    setScholarData: (state, action: PayloadAction<ScholarData>) => {
      state.data = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearScholarData: (state) => {
      state.data = null
      state.error = null
    },
  },
})

export const { setScholarData, setLoading, setError, clearScholarData } = scholarSlice.actions
export default scholarSlice.reducer
