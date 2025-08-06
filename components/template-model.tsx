"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { templateApi, type Template, type TemplateSaveParams } from "@/lib/template-api"
import { useToast } from "@/hooks/use-toast"

interface TemplateModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templateId?: number
    mode: "view" | "create" | "edit"
    onSuccess?: () => void
}

export function TemplateModal({ open, onOpenChange, templateId, mode, onSuccess }: TemplateModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<Partial<Template>>({
        tpl_name: "",
        tpl_desc: "",
        channel: 1,
        notification_type: 1,
    })

    const isReadOnly = mode === "view"
    const isCreate = mode === "create"

    // 获取模板详情
    useEffect(() => {
        if (open && templateId && !isCreate) {
            fetchTemplateDetail()
        } else if (open && isCreate) {
            // 重置表单数据
            setFormData({
                tpl_name: "",
                tpl_desc: "",
                channel: 1,
                notification_type: 1,
            })
        }
    }, [open, templateId, isCreate])


    const fetchTemplateDetail = async () => {
        if (!templateId) return
    }

    const handleSave = async () => {
        // 表单验证
        if (!formData.tpl_name?.trim()) {
            toast({
                title: "请输入模板名称",
                variant: "destructive",
            })
            return
        }

        if (!formData.tpl_desc?.trim()) {
            toast({
                title: "请输入模板描述",
                variant: "destructive",
            })
            return
        }

        setSaving(true)
        try {
            const saveData: TemplateSaveParams = {
                tpl_name: formData.tpl_name!,
                tpl_desc: formData.tpl_desc!,
                channel: formData.channel!,
                notification_type: formData.notification_type!,
            }

            const response = await templateApi.save(saveData)
            if (response.code === 200) {
                toast({
                    title: "保存成功",
                    description: isCreate ? "模板创建成功" : "模板更新成功",
                })
                onOpenChange(false)
                onSuccess?.()
            } else {
                toast({
                    title: "保存失败",
                    description: response.msg || "请稍后重试",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "保存失败",
                description: "网络错误，请稍后重试",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const getTitle = () => {
        switch (mode) {
            case "view":
                return "模板信息"
            case "create":
                return "新增模板"
            default:
                return "模板信息"
        }
    }

    const getChannelText = (channel: 1 | 2) => {
        return channel === 1 ? "短信" : "邮件"
    }

    const getNotificationTypeText = (notification_type: 1 | 2) => {
        return notification_type === 1 ? "验证码" : "通知"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{getTitle()}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin"/>
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="tpl_name" className="text-gray-300">模板名称 *</Label>
                <Input
                  id="tpl_name"
                  value={formData.tpl_name || ""}
                  onChange={(e) => setFormData({ ...formData, tpl_name: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="请输入模板名称"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tpl_desc" className="text-gray-300">模板描述 *</Label>
                <Input
                  id="tpl_desc"
                  value={formData.tpl_desc || ""}
                  onChange={(e) => setFormData({ ...formData, tpl_desc: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="请输入模板描述"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channel" className="text-gray-300">渠道 *</Label>
                {isReadOnly ? (
                  <Input value={getChannelText(formData.channel!)} disabled
                         className="bg-gray-800 border-gray-700 text-white"/>
                ) : (
                  <Select
                    value={formData.channel?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, channel: Number.parseInt(value) as 1 | 2 })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="选择渠道"/>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1" className="text-white hover:bg-gray-700">短信</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-gray-700">邮件</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification_type" className="text-gray-300">消息类型 *</Label>
                {isReadOnly ? (
                  <Input value={getNotificationTypeText(formData.notification_type!)} disabled
                         className="bg-gray-800 border-gray-700 text-white"/>
                ) : (
                  <Select
                    value={formData.notification_type?.toString()}
                    onValueChange={(value) => setFormData({ ...formData, notification_type: Number.parseInt(value) as 1 | 2 })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="选择消息类型"/>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="1" className="text-white hover:bg-gray-700">验证码</SelectItem>
                      <SelectItem value="2" className="text-white hover:bg-gray-700">通知</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800">
            {isReadOnly ? "关闭" : "取消"}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSave} disabled={saving || loading}
                    className="bg-orange-600 hover:bg-orange-700 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              保存
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    )
}
