"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { providerApi, type Provider } from "@/lib/provider-api"
import { useToast } from "@/hooks/use-toast"

interface ProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  provider: Provider | null
}

export default function ProviderModal({ isOpen, onClose, onSave, provider }: ProviderModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    channel_type: "",
    config: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        channel_type: provider.channel_type,
        config: JSON.stringify(provider.config, null, 2),
      })
    } else {
      setFormData({ name: "", channel_type: "", config: "" })
    }
  }, [provider])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, channel_type: value })
  }

  const handleSubmit = async () => {
    try {
      const configObject = JSON.parse(formData.config)
      const payload = { ...formData, config: configObject }

      if (provider) {
        await providerApi.update(provider.id, payload)
        toast({ title: "成功", description: "供应商已更新。" })
      } else {
        await providerApi.create(payload)
        toast({ title: "成功", description: "供应商已创建。" })
      }
      onSave()
    } catch (error) {
      console.error("Failed to save provider:", error)
      toast({
        title: "保存失败",
        description: "请检查您的输入，特别是配置JSON格式。",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{provider ? "编辑供应商" : "新增供应商"}</DialogTitle>
          <DialogDescription>请填写供应商的详细信息。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              名称
            </Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="channel_type" className="text-right">
              渠道类型
            </Label>
            <Select value={formData.channel_type} onValueChange={handleSelectChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择渠道类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">短信</SelectItem>
                <SelectItem value="email">邮件</SelectItem>
                <SelectItem value="wechat">公众号</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="config" className="text-right pt-2">
              配置 (JSON)
            </Label>
            <Textarea
              id="config"
              name="config"
              value={formData.config}
              onChange={handleChange}
              className="col-span-3"
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
