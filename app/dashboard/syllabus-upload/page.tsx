'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

export default function SyllabusUploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      // Load subjects
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false })

      setSubjects(data || [])
    }

    checkAuth()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0])
      setUploadStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedSubject) {
      setUploadStatus('error')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('subject_id', selectedSubject)

      const response = await fetch('/api/syllabus/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadStatus('success')
        setSelectedFile(null)
        setSelectedSubject('')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setUploadStatus('error')
      }
    } catch (error) {
      setUploadStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Upload Syllabus
          </h1>
          <p className="text-muted-foreground">
            Upload an image or PDF of your syllabus and we'll extract topics
            automatically using OCR.
          </p>
        </div>

        <Card className="p-8">
          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Select Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Choose a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Create a subject first in{' '}
                <a href="/dashboard/subjects" className="text-blue-600 hover:underline">
                  Subjects
                </a>
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-4">
              Upload File
            </label>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />

              <p className="text-muted-foreground mb-4">
                Drag and drop your syllabus here, or click to select
              </p>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                Select File
              </Button>

              {selectedFile && (
                <p className="text-sm text-green-600 mt-4">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="flex gap-3 p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800">
                Syllabus uploaded successfully! Redirecting...
              </p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">
                Upload failed. Please make sure a subject is selected and a file
                is chosen.
              </p>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedSubject || uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
