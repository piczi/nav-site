"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  type: "websites" | "categories"
  title: string
  onSuccess: () => void
}

interface ImportResult {
  imported: boolean
  type: string
  total: number
  success: number
  failed: number
  errors: string[]
}

export function ImportModal({
  isOpen,
  onClose,
  type,
  title,
  onSuccess,
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 检查文件类型
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ]
      if (
        !validTypes.includes(selectedFile.type) &&
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls") &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("请选择 Excel 文件 (.xlsx, .xls) 或 CSV 文件")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError("")
      setResult(null)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`/api/admin/import?type=${type}`)
      if (!res.ok) {
        throw new Error("下载模板失败")
      }

      // 获取文件名
      const contentDisposition = res.headers.get("content-disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "") || `${type}_template.xlsx`
        : `${type}_template.xlsx`

      // 下载文件
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message || "下载模板失败")
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError("请选择文件")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "导入失败")
      }

      setResult(data)

      // 如果全部成功，延迟关闭
      if (data.failed === 0 && data.success > 0) {
        setTimeout(() => {
          onSuccess()
          handleReset()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "导入失败")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setError("")
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            导入{title}
          </DialogTitle>
          <DialogDescription>
            支持 Excel (.xlsx, .xls) 和 CSV 格式文件批量导入
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 下载模板按钮 */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">下载导入模板</p>
              <p className="text-sm text-muted-foreground">
                获取标准格式模板，包含示例数据
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              下载模板
            </Button>
          </div>

          {/* 文件上传区域 */}
          {!result && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                file
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div>
                  <p className="font-medium text-primary">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">点击选择文件</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持 .xlsx, .xls, .csv 格式
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 导入结果 */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1 p-4 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    {result.success}
                  </p>
                  <p className="text-sm text-green-700">导入成功</p>
                </div>
                <div className="flex-1 p-4 bg-red-50 rounded-lg text-center">
                  <X className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">
                    {result.failed}
                  </p>
                  <p className="text-sm text-red-700">导入失败</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/50">
                  <p className="font-medium mb-2">错误详情：</p>
                  <ul className="space-y-1 text-sm text-red-600">
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {result.errors.length > 10 && (
                      <li>...还有 {result.errors.length - 10} 条错误</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 帮助链接 */}
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground border-t pt-4">
            <FileText className="h-4 w-4" />
            <span>需要了解字段格式？</span>
            <Link
              href="/IMPORT_GUIDE.md"
              target="_blank"
              className="text-primary hover:underline"
            >
              查看导入指南
            </Link>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            关闭
          </Button>
          {result ? (
            result.failed > 0 ? (
              <Button onClick={handleReset} disabled={loading}>
                重新导入
              </Button>
            ) : null
          ) : (
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始导入
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
