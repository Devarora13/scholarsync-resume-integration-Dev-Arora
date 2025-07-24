"use client"

import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code } from "lucide-react"
import { useSelector } from "react-redux"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { RootState } from "@/lib/store"

export function ResumeDisplay() {
  const { data, loading, error } = useSelector((state: RootState) => state.resume)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Parsing resume...</p>
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
          <p className="text-gray-600">No resume data available. Please upload a resume first.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
              <div className="space-y-2 mt-2">
                {data.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{data.email}</span>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{data.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Skills
            </CardTitle>
            <CardDescription>Technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Experience */}
      {data.experience && data.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                </div>
                {exp.description && <p className="text-gray-700 text-sm">{exp.description}</p>}
                {index < data.experience.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </div>
                {index < data.education.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
