import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, AlertCircle, Info, LogOut, User } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant?: string) => {
    const iconProps = "h-5 w-5 shrink-0"
    
    switch (variant) {
      case "success":
        return <CheckCircle2 className={`${iconProps} text-white`} />
      case "destructive":
        return <AlertCircle className={`${iconProps} text-white`} />
      case "info":
        return <Info className={`${iconProps} text-white`} />
      case "welcome":
        return <User className={`${iconProps} text-white`} />
      case "goodbye":
        return <LogOut className={`${iconProps} text-white`} />
      default:
        return <Info className={`${iconProps} text-white`} />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex gap-3 items-center">
              {getIcon(variant)}
              <div className="grid gap-1">
                {title && <ToastTitle className="text-white">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-white/90">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className="text-white/70 hover:text-white" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
