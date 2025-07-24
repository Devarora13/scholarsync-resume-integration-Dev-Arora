"use client"

import { useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { setResumeData, setLoading, setError } from "@/lib/slices/resume-slice"
import type { RootState } from "@/lib/store"

export function ResumeUploader() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state: RootState) => state.resume)
  const { toast } = useToast()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        const errorMessage = "Please upload a PDF or DOCX file only"
        dispatch(setError(errorMessage))
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: errorMessage,
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        const errorMessage = "File size must be less than 5MB"
        dispatch(setError(errorMessage))
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: errorMessage,
        })
        return
      }

      setUploadedFile(file)
      dispatch(setLoading(true))
      dispatch(setError(null))
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append("resume", file)

        // Simulate upload progress with smooth animation
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + Math.random() * 15
          })
        }, 300)

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          throw new Error("Failed to parse resume")
        }

        const data = await response.json()
        dispatch(setResumeData(data))

        // Success toast
        toast({
          variant: "success",
          title: "Resume Uploaded Successfully!",
          description: "Your resume has been parsed and analyzed. Check the Resume tab to view details.",
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to upload resume"
        dispatch(setError(errorMessage))
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: errorMessage,
        })
      } finally {
        dispatch(setLoading(false))
        setTimeout(() => setUploadProgress(0), 1000)
      }
    },
    [dispatch, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    disabled: loading,
  })

  const removeFile = () => {
    setUploadedFile(null)
    dispatch(setError(null))
  }

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-blue-500 bg-blue-50 scale-105"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full ${isDragActive ? "bg-blue-100" : "bg-gray-100"} transition-colors`}>
              <Upload className={`w-8 h-8 ${isDragActive ? "text-blue-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-sm text-gray-500">Drag and drop your PDF or DOCX file here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!loading && (
              <Button variant="ghost" size="sm" onClick={removeFile} className="hover:bg-red-50 hover:text-red-600">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="font-medium">Processing your resume...</span>
            </div>
            <span className="text-blue-600 font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full h-2" />
          <p className="text-xs text-gray-500 text-center">
            Analyzing content, extracting skills, and parsing experience...
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {uploadedFile && !loading && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            Resume uploaded and parsed successfully! Check the Resume tab to view the extracted information.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
