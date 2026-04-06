"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WarningIcon, InfoIcon, TrashIcon } from "@phosphor-icons/react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "warning" | "info"
  onConfirm: () => void | Promise<void>
  isPending?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "İptal",
  variant = "destructive",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const iconMap = {
    destructive: <TrashIcon className="size-5 text-destructive" />,
    warning: <WarningIcon className="size-5 text-amber-500" />,
    info: <InfoIcon className="size-5 text-primary" />,
  }

  const confirmButtonClass = {
    destructive: "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20",
    warning: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20",
    info: "bg-primary text-primary-foreground hover:bg-primary/90",
  }

  return (
    <Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
      <DialogContent showCloseButton={!isPending} className="rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {iconMap[variant]}
            <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground pl-8">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            className={confirmButtonClass[variant]}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && (
              <span className="mr-1.5 size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
