"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, X, CheckCircle, AlertCircle, Briefcase } from "lucide-react"

interface UploadedFile {
  id: string
  file: File
  name: string
  size: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedText?: string
  candidateName?: string
  candidateRole?: string
}

interface ResumeUploadProps {
  onFilesProcessed: (files: UploadedFile[], jobTemplate: string, customDescription?: string) => void
}

const JOB_TEMPLATES = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    description: "Full-stack development, programming languages, frameworks",
  },
  { id: "data-analyst", title: "Data Analyst", description: "SQL, Python, data visualization, statistics" },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    description: "Digital marketing, campaign management, analytics",
  },
  { id: "product-manager", title: "Product Manager", description: "Product strategy, roadmap, stakeholder management" },
  {
    id: "sales-representative",
    title: "Sales Representative",
    description: "Lead generation, CRM, client relationships",
  },
  { id: "student", title: "Student/Fresh Graduate", description: "Education, projects, internships, skills" },
]

export function ResumeUpload({ onFilesProcessed }: ResumeUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [jobDescription, setJobDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [jobDescriptionMode, setJobDescriptionMode] = useState<"custom" | "template">("template")
  const [isDragActive, setIsDragActive] = useState(false)

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const acceptedFiles = Array.from(files).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword",
    )

    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      status: "uploading",
      progress: 0,
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach((uploadedFile) => {
      simulateFileProcessing(uploadedFile)
    })
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }

  const simulateFileProcessing = async (uploadedFile: UploadedFile) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setUploadedFiles((prev) => prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f)))
    }

    // Change to processing status
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "processing", progress: 0 } : f)),
    )

    // Simulate text extraction and processing
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setUploadedFiles((prev) => prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f)))
    }

    // Complete processing with mock data
    const mockCandidateNames = ["John Smith", "Sarah Johnson", "Michael Chen", "Emily Davis", "David Wilson"]
    const mockRoles = ["Software Engineer", "Data Analyst", "Marketing Manager", "Product Manager", "Sales Rep"]

    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === uploadedFile.id
          ? {
              ...f,
              status: "completed",
              progress: 100,
              candidateName: mockCandidateNames[Math.floor(Math.random() * mockCandidateNames.length)],
              candidateRole: mockRoles[Math.floor(Math.random() * mockRoles.length)],
              extractedText: "Mock extracted resume text content...",
            }
          : f,
      ),
    )
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "completed":
        return "Ready for analysis"
      case "error":
        return "Error occurred"
      default:
        return "Unknown"
    }
  }

  const canAnalyze =
    uploadedFiles.length > 0 &&
    uploadedFiles.every((f) => f.status === "completed") &&
    (jobDescriptionMode === "template" ? selectedTemplate : jobDescription.trim())

  const handleAnalyze = () => {
    if (canAnalyze) {
      onFilesProcessed(
        uploadedFiles,
        jobDescriptionMode === "template" ? selectedTemplate : "custom",
        jobDescriptionMode === "custom" ? jobDescription : undefined,
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Job Description Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Description
          </CardTitle>
          <CardDescription>
            Choose a job template or provide a custom job description for targeted ATS analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={jobDescriptionMode}
            onValueChange={(value) => setJobDescriptionMode(value as "custom" | "template")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="template">Job Templates</TabsTrigger>
              <TabsTrigger value="custom">Custom JD</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div className="space-y-2">
                <Label>Select Job Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a job template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resumes
          </CardTitle>
          <CardDescription>
            Upload multiple resume files for bulk analysis. Supports PDF, DOC, and DOCX formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">Drop the files here...</p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">Drop resume files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse your computer</p>
                <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  Select Files
                </Button>
              </>
            )}
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {file.size}
                      </Badge>
                      {file.candidateName && (
                        <Badge variant="outline" className="text-xs">
                          {file.candidateName}
                        </Badge>
                      )}
                      {file.candidateRole && (
                        <Badge variant="outline" className="text-xs">
                          {file.candidateRole}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{getStatusText(file.status)}</p>
                      {(file.status === "uploading" || file.status === "processing") && (
                        <Progress value={file.progress} className="flex-1 max-w-32" />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Analyze Button */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handleAnalyze} disabled={!canAnalyze} size="lg" className="px-8">
                Analyze {uploadedFiles.length} Resume{uploadedFiles.length > 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
