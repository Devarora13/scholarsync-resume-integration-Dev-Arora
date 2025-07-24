"use client"

import { Lightbulb, ExternalLink, Star, Clock, Users, AlertCircle, Loader2, RefreshCw, CheckCircle } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { setSuggestions, setLoading, setError } from "@/lib/slices/suggestions-slice"
import type { RootState } from "@/lib/store"

// Skeleton component for project suggestions
function ProjectSuggestionSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-18" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProjectSuggestions() {
  const dispatch = useDispatch()
  const { data: suggestions, loading, error } = useSelector((state: RootState) => state.suggestions)
  const resumeData = useSelector((state: RootState) => state.resume.data)
  const scholarData = useSelector((state: RootState) => state.scholar.data)
  const { toast } = useToast()

  useEffect(() => {
    if (resumeData || scholarData) {
      generateSuggestions()
    }
  }, [resumeData, scholarData])

  const generateSuggestions = async () => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const response = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData,
          scholarData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate project suggestions")
      }

      const data = await response.json()
      dispatch(setSuggestions(data.suggestions))

      // Success toast
      toast({
        variant: "success",
        title: "Suggestions Generated!",
        description: `Found ${data.suggestions.length} personalized project suggestions for you.`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate suggestions"
      dispatch(setError(errorMessage))
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: errorMessage,
      })
    } finally {
      dispatch(setLoading(false))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Generating Suggestions</h2>
          </div>
          <p className="text-gray-600">Analyzing your profile to find the perfect projects...</p>
        </div>

        <div className="grid gap-6">
          {[...Array(3)].map((_, index) => (
            <ProjectSuggestionSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={generateSuggestions} variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!resumeData && !scholarData) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Lightbulb className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                Please upload your resume and/or add your Google Scholar profile to get personalized project
                suggestions.
              </p>
            </div>
            <Button onClick={generateSuggestions} disabled={!resumeData && !scholarData} className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Generate Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suggestions Found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't generate project suggestions based on your current profile.
              </p>
            </div>
            <Button onClick={generateSuggestions} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personalized Project Suggestions</h2>
        <p className="text-gray-600">Based on your skills, experience, and research interests</p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
          <CheckCircle className="w-4 h-4 mr-1" />
          {suggestions.length} suggestions found
        </div>
      </div>

      <div className="grid gap-6">
        {suggestions.map((project, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-yellow-100 rounded">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                    </div>
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">{project.description}</CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-bold text-yellow-700">{project.matchScore}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Skills Required */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Skills Required
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired.map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="grid md:grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{project.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{project.difficulty} Level</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Lightbulb className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{project.category}</span>
                </div>
              </div>

              {/* Research Areas */}
              {project.researchAreas && project.researchAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Related Research Areas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.researchAreas.map((area, areaIndex) => (
                      <Badge
                        key={areaIndex}
                        variant="outline"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Start Project
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <ExternalLink className="w-4 h-4" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={generateSuggestions} className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Generate More Suggestions
        </Button>
      </div>
    </div>
  )
}
