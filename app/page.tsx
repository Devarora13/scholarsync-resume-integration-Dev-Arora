"use client"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { Header } from "@/components/header"
import { ResumeUploader } from "@/components/resume-uploader"
import { ScholarProfileInput } from "@/components/scholar-profile-input"
import { ResumeDisplay } from "@/components/resume-display"
import { ScholarDisplay } from "@/components/scholar-display"
import { ProjectSuggestions } from "@/components/project-suggestions"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, GraduationCap, Lightbulb, Upload } from "lucide-react"

export default function HomePage() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to ScholarSync</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrate your resume and Google Scholar profile to discover personalized project suggestions based on
              your skills, education, and research interests.
            </p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume
              </TabsTrigger>
              <TabsTrigger value="scholar" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Scholar
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Projects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Resume Upload
                    </CardTitle>
                    <CardDescription>Upload your resume in PDF or DOCX format for analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeUploader />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      Google Scholar Profile
                    </CardTitle>
                    <CardDescription>Enter your Google Scholar profile URL for research analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScholarProfileInput />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resume">
              <ResumeDisplay />
            </TabsContent>

            <TabsContent value="scholar">
              <ScholarDisplay />
            </TabsContent>

            <TabsContent value="suggestions">
              <ProjectSuggestions />
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </Provider>
  )
}
