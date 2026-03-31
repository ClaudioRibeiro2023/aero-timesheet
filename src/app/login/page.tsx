'use client'

import { useState, useEffect, forwardRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Loader2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoginSchema, MagicLinkSchema, type LoginFormData, type MagicLinkFormData } from '@/schemas/auth'

// ============================================================================
// Background Effects
// ============================================================================

function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.03,
      }}
    />
  )
}

function VignetteOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3]"
      style={{ background: 'radial-gradient(transparent 50%, rgba(0,0,0,0.55) 100%)' }}
    />
  )
}

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(41, 128, 185, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(41, 128, 185, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridScroll 4s linear infinite',
        }}
      />
    </div>
  )
}

function StatusTicker() {
  const items = [
    '◈ SISTEMA ONLINE',
    'CONEXÃO SEGURA',
    'CRIPTOGRAFIA AES-256',
    'AERO ENGENHARIA',
    `ÚLTIMA SYNC: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
    'TLS 1.3 VERIFIED',
    'UPTIME 99.97%',
  ]
  const text = items.join(' · ')
  return (
    <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden pointer-events-none z-[4] bg-black/30 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center h-full status-bar-scroll whitespace-nowrap">
        <span className="text-[10px] tracking-[0.15em] text-emerald-400/70 font-mono uppercase px-4">
          {text} · {text} · {text}
        </span>
      </div>
    </div>
  )
}

function Particles() {
  const particleData = [
    { size: 2, left: '13%', top: '7%', bg: '#2980B9', dur: 8, delay: 0 },
    { size: 4, left: '50%', top: '60%', bg: '#0E8C6B', dur: 10, delay: -0.7 },
    { size: 6, left: '87%', top: '13%', bg: 'rgba(255,255,255,0.4)', dur: 12, delay: -1.4 },
    { size: 2, left: '24%', top: '66%', bg: '#2980B9', dur: 14, delay: -2.1 },
    { size: 4, left: '61%', top: '19%', bg: '#0E8C6B', dur: 16, delay: -2.8 },
    { size: 6, left: '98%', top: '72%', bg: 'rgba(255,255,255,0.4)', dur: 8, delay: -3.5 },
    { size: 2, left: '35%', top: '25%', bg: '#2980B9', dur: 10, delay: -4.2 },
    { size: 4, left: '72%', top: '78%', bg: '#0E8C6B', dur: 12, delay: -4.9 },
    { size: 6, left: '9%', top: '31%', bg: 'rgba(255,255,255,0.4)', dur: 14, delay: -5.6 },
    { size: 2, left: '46%', top: '84%', bg: '#2980B9', dur: 16, delay: -6.3 },
    { size: 4, left: '83%', top: '37%', bg: '#0E8C6B', dur: 8, delay: -7 },
    { size: 6, left: '20%', top: '90%', bg: 'rgba(255,255,255,0.4)', dur: 10, delay: -7.7 },
    { size: 2, left: '57%', top: '43%', bg: '#2980B9', dur: 12, delay: -8.4 },
    { size: 4, left: '94%', top: '96%', bg: '#0E8C6B', dur: 14, delay: -9.1 },
    { size: 6, left: '31%', top: '49%', bg: 'rgba(255,255,255,0.4)', dur: 16, delay: -9.8 },
    { size: 2, left: '68%', top: '2%', bg: '#2980B9', dur: 8, delay: -10.5 },
    { size: 4, left: '5%', top: '55%', bg: '#0E8C6B', dur: 10, delay: -11.2 },
    { size: 6, left: '42%', top: '8%', bg: 'rgba(255,255,255,0.4)', dur: 12, delay: -11.9 },
    { size: 2, left: '79%', top: '61%', bg: '#2980B9', dur: 14, delay: -12.6 },
    { size: 4, left: '16%', top: '14%', bg: '#0E8C6B', dur: 16, delay: -13.3 },
  ]
  return (
    <>
      {particleData.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: p.bg,
            boxShadow: `${p.bg} 0px 0px ${6 + i * 0.3}px`,
            animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  )
}

function OrbitRings() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-[600px] h-[600px] rounded-full border border-white/[0.03]"
        style={{ animation: 'orbitSpin 30s linear infinite' }} />
      <div className="absolute inset-8 rounded-full border border-[#2980B9]/[0.06]"
        style={{ animation: 'orbitSpin 25s linear infinite reverse' }} />
      <div className="absolute inset-16 rounded-full border border-[#0E8C6B]/[0.05]"
        style={{ animation: 'orbitSpin 20s linear infinite' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#2980B9] shadow-[0_0_10px_#2980B9]"
        style={{ animation: 'orbitSpin 30s linear infinite' }} />
      <div className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-[#0E8C6B] shadow-[0_0_8px_#0E8C6B]"
        style={{ animation: 'orbitSpin 25s linear infinite reverse' }} />
    </div>
  )
}

function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2980B9]/20 to-transparent"
        style={{ animation: 'scanLine 6s ease-in-out infinite' }} />
    </div>
  )
}

function CornerBrackets() {
  return (
    <>
      <svg viewBox="0 0 64 64" fill="none" className="absolute top-6 left-6 w-16 h-16 opacity-20 pointer-events-none">
        <path d="M0 16V0H16" stroke="#2980B9" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="3" fill="#2980B9" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 64 64" fill="none" className="absolute top-6 right-6 w-16 h-16 opacity-20 pointer-events-none">
        <path d="M64 16V0H48" stroke="#2980B9" strokeWidth="1.5" />
        <circle cx="64" cy="0" r="3" fill="#2980B9" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 64 64" fill="none" className="absolute bottom-6 left-6 w-16 h-16 opacity-20 pointer-events-none">
        <path d="M0 48V64H16" stroke="#0E8C6B" strokeWidth="1.5" />
        <circle cx="0" cy="64" r="3" fill="#0E8C6B" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 64 64" fill="none" className="absolute bottom-6 right-6 w-16 h-16 opacity-20 pointer-events-none">
        <path d="M64 48V64H48" stroke="#0E8C6B" strokeWidth="1.5" />
        <circle cx="64" cy="64" r="3" fill="#0E8C6B" opacity="0.5" />
      </svg>
    </>
  )
}

/** Timesheet system info overlay */
function SystemOverlay() {
  return (
    <div className="absolute bottom-5 right-24 pointer-events-none z-[2] text-right hidden md:block">
      <div className="font-mono text-[9px] text-white/20 space-y-0.5 leading-tight">
        <div>AERO TIMESHEET</div>
        <div>ENC AES-256-GCM</div>
        <div>TLS 1.3 · VERIFIED</div>
        <div>NODE BR-SP-01</div>
        <div>UPTIME 99.97%</div>
        <div>v1.0.0 · STABLE</div>
      </div>
    </div>
  )
}

/** Clock telemetry overlay */
function TimesheetOverlay() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="absolute top-5 left-24 pointer-events-none z-[2] hidden md:block">
      <div className="font-mono text-[9px] text-white/25 space-y-0.5 leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[#0E8C6B]/60">◉</span>
          <span>SISTEMA ATIVO</span>
          <span className="text-[#0E8C6B]/80">●</span>
          <span className="text-[#0E8C6B]/60">LIVE</span>
        </div>
        <div className="mt-1 space-y-px text-white/15">
          <div>HORA {time}</div>
          <div>{date.toUpperCase()}</div>
          <div>CONTAGEM-MG · BR</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Floating Input
// ============================================================================

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  currentValue?: string
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  function FloatingInput({ id, label, currentValue = '', className: _className, ...rest }, ref) {
    const hasValue = currentValue.length > 0
    return (
      <div className="relative">
        <input
          ref={ref}
          id={id}
          placeholder=" "
          className="peer w-full px-3 pt-5 pb-2 bg-white/[0.06] border border-white/10 rounded-lg text-white text-sm placeholder-transparent transition-all focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40 focus:border-[#2980B9]/60 backdrop-blur-sm"
          {...rest}
        />
        <label
          htmlFor={id}
          className={`absolute left-3 transition-all duration-200 pointer-events-none text-slate-400 ${
            hasValue
              ? 'top-1.5 text-[10px] text-[#2980B9]'
              : 'top-1/2 -translate-y-1/2 text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:translate-y-0 peer-focus:text-[#2980B9]'
          }`}
        >
          {label}
        </label>
      </div>
    )
  }
)

// ============================================================================
// Typing animation
// ============================================================================

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [text])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(blink)
  }, [])

  return (
    <span>
      {displayed}
      <span
        className={`inline-block w-[2px] h-[1.1em] bg-white/60 ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.1s' }}
      />
    </span>
  )
}

// ============================================================================
// Main Login Form
// ============================================================================

type AuthMode = 'password' | 'magic'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') ?? '/dashboard'

  const [mode, setMode] = useState<AuthMode>('password')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) })

  const {
    register: registerMagic,
    handleSubmit: handleSubmitMagic,
    watch: watchMagic,
    formState: { errors: magicErrors, isSubmitting: isMagicSubmitting },
  } = useForm<{ email: string }>({ resolver: zodResolver(MagicLinkSchema) })

  const onPasswordLogin = async (data: LoginFormData) => {
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password })
    if (error) {
      setMessage({
        text: error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos. Verifique e tente novamente.'
          : error.message,
        type: 'error',
      })
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  const onMagicLink = async (data: MagicLinkFormData) => {
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: 'Link de acesso enviado! Verifique seu e-mail.', type: 'success' })
    }
  }

  const isLoading = isPasswordSubmitting || isMagicSubmitting

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 animated-mesh" />
      <NoiseOverlay />
      <VignetteOverlay />
      <StatusTicker />
      <AnimatedGrid />
      <Particles />
      <OrbitRings />
      <ScanLine />
      <CornerBrackets />
      <TimesheetOverlay />
      <SystemOverlay />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-6" style={{ animation: 'fadeInUp 0.5s ease forwards' }}>
          <div className="inline-block mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E7C7B] to-[#2980B9] flex items-center justify-center mx-auto shadow-xl shadow-[#0E7C7B]/30">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="text-white/50 text-sm">
            <TypingText text="Aero Timesheet · Sistema de Ponto" />
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl backdrop-blur-2xl p-8 border border-white/[0.08]"
          style={{
            backgroundColor: 'rgba(5, 15, 35, 0.85)',
            animation: 'fadeInUp 0.5s ease 0.15s both',
            boxShadow: '0 0 0 1px rgba(41,128,185,0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-lg font-semibold text-white text-center mb-6">
            Bem-vindo de volta
          </h2>

          {mode === 'password' ? (
            <form onSubmit={handleSubmitPassword(onPasswordLogin)} className="space-y-4">
              <div>
                <FloatingInput
                  id="email"
                  type="email"
                  label="E-mail"
                  autoComplete="email"
                  currentValue={watchPassword('email') ?? ''}
                  {...registerPassword('email')}
                />
                {passwordErrors.email && (
                  <p className="text-xs text-red-400 mt-1" role="alert">{passwordErrors.email.message}</p>
                )}
              </div>
              <div>
                <FloatingInput
                  id="password"
                  type="password"
                  label="Senha"
                  autoComplete="current-password"
                  currentValue={watchPassword('password') ?? ''}
                  {...registerPassword('password')}
                />
                {passwordErrors.password && (
                  <p className="text-xs text-red-400 mt-1" role="alert">{passwordErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2"
                style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
              >
                {isPasswordSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isPasswordSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitMagic(onMagicLink)} className="space-y-4">
              <div>
                <FloatingInput
                  id="magic-email"
                  type="email"
                  label="E-mail"
                  autoComplete="email"
                  currentValue={watchMagic('email') ?? ''}
                  {...registerMagic('email')}
                />
                {magicErrors.email && (
                  <p className="text-xs text-red-400 mt-1" role="alert">{magicErrors.email.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
              >
                {isMagicSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {isMagicSubmitting ? 'Enviando...' : 'Enviar link de acesso'}
              </button>
            </form>
          )}

          {/* Mode toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'password' ? 'magic' : 'password'); setMessage(null) }}
              className="text-xs text-white/40 hover:text-white/60 transition-colors"
            >
              {mode === 'password' ? 'Usar link mágico' : 'Usar senha'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm text-center mt-4 ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
              role="alert"
            >
              {message.text}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6" style={{ animation: 'fadeInUp 0.5s ease 0.3s both' }}>
          <p className="text-white/20 text-xs">
            Aero Engenharia &copy; {new Date().getFullYear()} &mdash; Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        .animated-mesh {
          background: linear-gradient(-45deg, #0c2340, #163b5c, #0e8c6b, #0c2340, #1a4a73);
          background-size: 400% 400%;
          animation: meshShift 15s ease infinite;
        }
        @keyframes meshShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gridScroll {
          0%  { background-position: 0 0; }
          to  { background-position: 0 60px; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-20px); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .status-bar-scroll {
          animation: statusScroll 30s linear infinite;
        }
        @keyframes statusScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
