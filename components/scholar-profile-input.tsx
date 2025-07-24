"use client"

import { Loader2, Search, CheckCircle, AlertCircle, GraduationCap } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { setScholarData, setLoading, setError } from "@/lib/slices/scholar-slice"
import type { RootState } from "@/lib/store"

export function ScholarProfileInput() {
  const dispatch = useDispatch()
  const { loading, error, data } = useSelector((state: RootState) => state.scholar)
  const { toast } = useToast()
  const [profileUrl, setProfileUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileUrl.trim()) {
      const errorMessage = "Please enter a Google Scholar profile URL"
      dispatch(setError(errorMessage))
      toast({
        variant: "destructive",
        title: "URL Required",
        description: errorMessage,
      })
      return
    }

    // Validate URL format
    const scholarUrlPattern = /scholar\.google\.(com|co\.[a-z]{2}|[a-z]{2})\/citations.*user=/
    if (!scholarUrlPattern.test(profileUrl)) {
      const errorMessage = "Please enter a valid Google Scholar profile URL"
      dispatch(setError(errorMessage))
      toast({
        variant: "destructive",
        title: "Invalid URL Format",
        description: errorMessage,
      })
      return
    }

    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const response = await fetch("/api/fetch-scholar-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch Google Scholar profile")
      }

      const data = await response.json()
      dispatch(setScholarData(data))

      // Success toast
      toast({
        variant: "success",
        title: "Scholar Profile Fetched!",
        description: "Your Google Scholar profile has been successfully analyzed. Check the Scholar tab for details.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile"
      dispatch(setError(errorMessage))
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: errorMessage,
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="scholar-url" className="text-sm font-medium text-gray-700">
            Google Scholar Profile URL
          </Label>
          <div className="relative mt-1">
            <Input
              id="scholar-url"
              type="url"
              placeholder="https://scholar.google.com/citations?user=..."
              value={profileUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileUrl(e.target.value)}
              disabled={loading}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Example: https://scholar.google.com/citations?user=USERID</p>
        </div>

        <Button
          type="submit"
          disabled={loading || !profileUrl.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fetching Profile...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Fetch Profile
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {data && !loading && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Google Scholar profile fetched successfully! Check the Scholar tab to view the information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
