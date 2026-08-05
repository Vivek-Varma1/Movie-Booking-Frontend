"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api"
import { sendOtp, verifyOtp, type AuthUser } from "@/lib/auth"

const OTP_LENGTH = 6
const RESEND_SECONDS = 30

type Step = "email" | "otp"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function OtpLoginForm({
  onSuccess,
}: {
  onSuccess?: (user: AuthUser) => void
}) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus()
  }, [step])

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    setInfo(null)

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      const res = await sendOtp(email.trim())
      setInfo(res.message ?? "OTP sent successfully to your email.")
      setStep("otp")
      setOtp(Array(OTP_LENGTH).fill(""))
      setCooldown(RESEND_SECONDS)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to send OTP. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(code: string) {
    setError(null)
    setLoading(true)
    try {
      const res = await verifyOtp(email.trim(), code)
      onSuccess?.(res.user)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired code. Please try again.",
      )
      setOtp(Array(OTP_LENGTH).fill(""))
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "")
    if (!digits) {
      setOtp((prev) => {
        const next = [...prev]
        next[index] = ""
        return next
      })
      return
    }

    setOtp((prev) => {
      const next = [...prev]
      if (digits.length > 1) {
        for (let i = 0; i < OTP_LENGTH; i++) {
          next[i] = digits[i] ?? ""
        }
      } else {
        next[index] = digits
      }
      return next
    })

    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
    otpRefs.current[nextIndex]?.focus()

    const assembled =
      digits.length > 1
        ? digits.slice(0, OTP_LENGTH)
        : [...otp.slice(0, index), digits, ...otp.slice(index + 1)].join("")

    if (assembled.length === OTP_LENGTH && !assembled.includes("")) {
      void handleVerify(assembled.slice(0, OTP_LENGTH))
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault()
      otpRefs.current[index + 1]?.focus()
    }
  }

  const otpValue = otp.join("")

  return (
    <div className="w-full">
      {step === "email" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-lg border border-border bg-surface-primary pl-11 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-info focus:ring-2 focus:ring-info/40"
                aria-describedby={error ? "auth-error" : undefined}
              />
            </div>
          </div>

          {error && (
            <p id="auth-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="h-12 w-full text-base font-semibold">
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Sending code…
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight className="size-5" aria-hidden="true" />
              </>
            )}
          </Button>

          <p className="text-center text-sm leading-relaxed text-muted-foreground text-pretty">
            {"We'll email you a 6-digit verification code. No password needed."}
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-5">
          <button
            type="button"
            onClick={() => {
              setStep("email")
              setError(null)
              setInfo(null)
            }}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Change email
          </button>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Enter the code sent to</p>
            <p className="text-sm font-semibold text-foreground break-all">{email}</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">Verification code</span>
            <div
              className="flex items-center justify-between gap-2"
              role="group"
              aria-label="6 digit verification code"
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={digit}
                  disabled={loading}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className="size-12 flex-1 rounded-lg border border-border bg-surface-primary text-center text-xl font-semibold text-foreground outline-none transition-colors focus:border-info focus:ring-2 focus:ring-info/40 disabled:opacity-60"
                />
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          ) : info ? (
            <p className="text-sm text-info">{info}</p>
          ) : null}

          <Button
            type="button"
            disabled={loading || otpValue.length !== OTP_LENGTH}
            onClick={() => handleVerify(otpValue)}
            className="h-12 w-full text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck className="size-5" aria-hidden="true" />
                Verify &amp; continue
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {cooldown > 0 ? (
              <span>Resend code in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="font-medium text-info underline-offset-4 transition-colors hover:text-brand-secondary hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
