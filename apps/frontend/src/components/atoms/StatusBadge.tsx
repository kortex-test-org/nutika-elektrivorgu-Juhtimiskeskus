"use client"

import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"

type DeviceStatus = "on" | "off" | "override" | "auto" | "disconnected"

interface StatusBadgeProps {
  status: DeviceStatus
}

const STATUS_VARIANT: Record<
  DeviceStatus,
  "success" | "outline" | "warning" | "default" | "destructive"
> = {
  on: "success",
  off: "outline",
  override: "warning",
  auto: "default",
  disconnected: "destructive",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("status")
  return <Badge variant={STATUS_VARIANT[status]}>{t(status)}</Badge>
}

// 🐱 Tiny playful SVG cat face for Auto mode
function TinyAutoCatIcon() {
  return (
    <svg
      className="w-4 h-4 text-violet-500 animate-pulse"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21c4.97 0 9-4.03 9-9 0-1.46-.35-2.83-.96-4.04L18 3.5 14.5 6h-5L6 3.5 4.04 7.96C3.43 9.17 3 10.54 3 12c0 4.97 4.03 9 9 9z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M12 21c4.97 0 9-4.03 9-9 0-1.46-.35-2.83-.96-4.04L18 3.5 14.5 6h-5L6 3.5 4.04 7.96C3.43 9.17 3 10.54 3 12c0 4.97 4.03 9 9 9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M11 14.5c.3.5.7.5 1 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 💤 Tiny playful SVG sleeping cat for Manual OFF mode
function TinySleepingCatIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20a8 8 0 1 0-8-8c0 2.2.9 4.2 2.3 5.7L12 20z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M12 20a8 8 0 1 0-8-8c0 2.2.9 4.2 2.3 5.7L12 20z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.5c.2.4.6.4.8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.2 11.5c.2.4.6.4.8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 5.5h2l-2 2h2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-bounce"
      />
    </svg>
  )
}

// ⚡ Tiny playful SVG sparks ginger cat for Manual ON mode
function TinySparksCatIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-500 animate-[bounce_2.5s_infinite]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21c4.97 0 9-4.03 9-9 0-1.46-.35-2.83-.96-4.04L18 3.5 14.5 6h-5L6 3.5 4.04 7.96C3.43 9.17 3 10.54 3 12c0 4.97 4.03 9 9 9z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M12 21c4.97 0 9-4.03 9-9 0-1.46-.35-2.83-.96-4.04L18 3.5 14.5 6h-5L6 3.5 4.04 7.96C3.43 9.17 3 10.54 3 12c0 4.97 4.03 9 9 9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="12" r="1.5" fill="currentColor" />
      <path
        d="M10.5 14.5c.5.5 1 .5 1.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18.5 2.5l-1.5 2.5h2.5l-1.5 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      />
    </svg>
  )
}

interface CatModeBadgeProps {
  overrideActive: boolean
  currentState: boolean | null
  overrideState: boolean | null
  isVacationMode?: boolean
}

export function CatModeBadge({
  overrideActive,
  currentState,
  overrideState,
  isVacationMode,
}: CatModeBadgeProps) {
  const t = useTranslations("status")

  if (!overrideActive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-sm shadow-violet-500/5 transition-all hover:bg-violet-500/15">
        <TinyAutoCatIcon />
        <span>{t("auto")} 🤖🐾</span>
      </span>
    )
  }

  const isDeviceOn = overrideState !== null ? overrideState : currentState
  if (isDeviceOn) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/5 transition-all hover:bg-amber-500/15">
        <TinySparksCatIcon />
        <span>
          {t("override")} ({t("on")}) ⚡🐾
        </span>
      </span>
    )
  }

  if (isVacationMode) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm shadow-amber-500/5 transition-all hover:bg-amber-500/15">
        <TinySleepingCatIcon />
        <span>💤 {t("vacation") ?? "Отпуск"} 🐾</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 shadow-sm shadow-slate-500/5 transition-all hover:bg-slate-500/15">
      <TinySleepingCatIcon />
      <span>
        {t("override")} ({t("off")}) 💤🐾
      </span>
    </span>
  )
}

export function getDeviceStatus(device: {
  currentState: boolean | null
  overrideActive: boolean
}): DeviceStatus {
  if (device.overrideActive) return "override"
  if (device.currentState === null) return "disconnected"
  return device.currentState ? "on" : "off"
}
