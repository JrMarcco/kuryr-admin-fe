"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, FilePenLine, X } from "lucide-react"
import { configApi, type BizConfig } from "@/lib/config-api"
import type { Business } from "@/lib/business-api"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface BizConfigModalProps {
  isOpen: boolean
  onClose: () => void
  business: Business
}

const initialConfig: BizConfig = {
  rate_limit: { qps: 0, daily_limit: 0 },
  channel_configs: [],
  quota_configs: [],
  callback_config: { url: "", mode: "simple" },
}

export default function BizConfigModal({ isOpen, onClose, business }: BizConfigModalProps) {
  const [config, setConfig] = useState<BizConfig>(initialConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchConfig = useCallback(async () => {
    if (!business) return
    setIsLoading(true)
    try {
      const data = await configApi.get(business.appId)
      setConfig(data)
    } catch (error) {
      console.error("Failed to fetch config:", error)
      setConfig(initialConfig)
    } finally {
      setIsLoading(false)
    }
  }, [business])

  useEffect(() => {
    if (isOpen) {
      fetchConfig()
      setIsEditing(false)
    }
  }, [isOpen, fetchConfig])

  const handleSave = async () => {
    if (!business) return
    setIsSaving(true)
    try {
      await configApi.update(business.appId, config)
      toast({ title: "成功", description: "配置已保存。" })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "保存失败",
        description: "无法保存配置，请检查输入。",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (section: keyof BizConfig, field: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }))
  }

  const renderRateLimit = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="qps">QPS (每秒请求数)</Label>
        <Input
          id="qps"
          type="number"
          value={config.rate_limit.qps}
          onChange={(e) => handleInputChange("rate_limit", "qps", Number.parseInt(e.target.value))}
          disabled={!isEditing}
        />
      </div>
      <div>
        <Label htmlFor="daily_limit">每日限额</Label>
        <Input
          id="daily_limit"
          type="number"
          value={config.rate_limit.daily_limit}
          onChange={(e) => handleInputChange("rate_limit", "daily_limit", Number.parseInt(e.target.value))}
          disabled={!isEditing}
        />
      </div>
    </div>
  )

  const renderCallbackConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="callback_url">回调URL</Label>
        <Input
          id="callback_url"
          value={config.callback_config.url}
          onChange={(e) => handleInputChange("callback_config", "url", e.target.value)}
          disabled={!isEditing}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label>简单模式</Label>
        <Switch
          checked={config.callback_config.mode === "full"}
          onCheckedChange={(checked) => handleInputChange("callback_config", "mode", checked ? "full" : "simple")}
          disabled={!isEditing}
        />
        <Label>完整模式</Label>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>业务配置 - {business.name}</DialogTitle>
          <DialogDescription>查看和管理业务方的详细配置信息。</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <Accordion type="multiple" defaultValue={["item-1", "item-2"]} className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>速率限制</AccordionTrigger>
                <AccordionContent>{renderRateLimit()}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>回调配置</AccordionTrigger>
                <AccordionContent>{renderCallbackConfig()}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>渠道配置</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">暂无渠道配置。</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>配额配置</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">暂无配额配置。</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <DialogFooter className="mt-4">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  fetchConfig()
                }}
              >
                <X className="mr-2 h-4 w-4" />
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                保存
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <FilePenLine className="mr-2 h-4 w-4" />
              编辑
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
