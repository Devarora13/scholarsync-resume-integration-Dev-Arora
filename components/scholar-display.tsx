"use client"

import { GraduationCap, FileText, Quote, TrendingUp, Calendar, AlertTriangle } from "lucide-react"
import { useSelector } from "react-redux"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { RootState } from "@/lib/store"

export function ScholarDisplay() {
  const { data, loading, error } = useSelector((state: RootState) => state.scholar)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching Google Scholar profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No Google Scholar data available. Please fetch a profile first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Warning Alert if data is fallback */}
      {(data as any).warning && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{(data as any).warning}</AlertDescription>
        </Alert>
      )}

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Scholar Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
            {data.affiliation && <p className="text-gray-600">{data.affiliation}</p>}
            {data.email && <p className="text-gray-500 text-sm">{data.email}</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{data.totalCitations || 0}</div>
              <div className="text-sm text-gray-600">Total Citations</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.hIndex || 0}</div>
              <div className="text-sm text-gray-600">h-index</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{data.i10Index || 0}</div>
              <div className="text-sm text-gray-600">i10-index</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{data.publications?.length || 0}</div>
              <div className="text-sm text-gray-600">Publications</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Interests */}
      {data.researchInterests && data.researchInterests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Research Interests
            </CardTitle>
            <CardDescription>Areas of academic focus and expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.researchInterests.map((interest, index) => (
                <Badge key={index} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publications */}
      {data.publications && data.publications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Publications
            </CardTitle>
            <CardDescription>Latest research publications and papers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.publications.slice(0, 10).map((pub, index) => (
              <div key={index}>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 leading-tight">{pub.title}</h4>
                  <p className="text-gray-600 text-sm">{pub.authors}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {pub.journal && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {pub.journal}
                      </span>
                    )}
                    {pub.year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pub.year}
                      </span>
                    )}
                    {pub.citations && (
                      <span className="flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        {pub.citations} citations
                      </span>
                    )}
                  </div>
                </div>
                {index < Math.min(data.publications.length, 10) - 1 && <Separator className="mt-4" />}
              </div>
            ))}
            {data.publications.length > 10 && (
              <p className="text-center text-gray-500 text-sm">Showing 10 of {data.publications.length} publications</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
