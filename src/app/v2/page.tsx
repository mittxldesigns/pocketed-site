'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion, useInView, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence,
} from 'framer-motion';
import {
  TrendingDown, Clock, CreditCard, Shield, Truck, Wifi,
  ChevronDown, Star, ArrowUpRight, ArrowRight, Check,
  Menu, X, Zap, Mail, BarChart3, Sparkles, Loader2, CheckCircle2,
} from 'lucide-react';

/* ═══════ SHARED MICRO-INTERACTIONS ═══════ */

function MouseGlow() {
  const x = useMotionValue(0), y = useMotionValue(0);
  useEffect(() => {
    const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [x, y]);
  return (
    <motion.div className="fixed inset-0 pointer-events-none z-0"
      style={{ background: useTransform([x, y], ([lx, ly]: number[]) =>
        `radial-gradient(500px circle at ${lx}px ${ly}px, rgba(249,115,22,0.03), transparent 50%)`) }} />
  );
}

function CoinRain({ active, onDone }: { active: boolean; onDone: () => void }) {
  useEffect(() => { if (active) { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); } }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -30, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), opacity: 0.6 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 30, opacity: [0.6, 0.6, 0] }}
          transition={{ duration: 1.6 + Math.random(), delay: Math.random() * 0.4, ease: 'easeIn' }}
          className="absolute">
          <Sparkles size={12 + Math.random() * 8} className="text-orange-400" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let s: number | null = null, raf: number;
    const step = (t: number) => {
      if (s === null) s = t;
      const p = Math.min((t - s) / 1800, 1);
      setN(Math.round((1 - Math.pow(1 - p, 4)) * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

function Tilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sy = useSpring(ry, { stiffness: 200, damping: 20 });
  return (
    <motion.div ref={ref}
      onMouseMove={(e) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); ry.set(((e.clientX - r.left) / r.width - 0.5) * 5); rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5); }}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 800 }} className={className}>
      {children}
    </motion.div>
  );
}

function Magnetic({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 15 });
  const sy = useSpring(my, { stiffness: 300, damping: 15 });
  return (
    <motion.a ref={ref} href={href}
      onMouseMove={(e) => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left - r.width / 2) * 0.12); my.set((e.clientY - r.top - r.height / 2) * 0.12); }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ x: sx, y: sy }} className={className}>{children}</motion.a>
  );
}

function ScrollHighlight({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.3'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const s = i / words.length, e = s + 1 / words.length;
        return <ScrollWord key={i} word={word} progress={scrollYProgress} start={s} end={e} />;
      })}
    </p>
  );
}
function ScrollWord({ word, progress, start, end }: { word: string; progress: ReturnType<typeof useScroll>['scrollYProgress']; start: number; end: number }) {
  return <motion.span style={{ opacity: useTransform(progress, [start, end], [0.1, 1]) }} className="inline-block mr-[0.3em]">{word}</motion.span>;
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left py-5 group">
        <span className="text-[15px] font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors pr-8">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} strokeWidth={1.5} className="text-neutral-400" />
        </motion.div>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
        <p className="pb-5 text-sm text-neutral-500 leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}

/* ═══════ PAGE BG HOOK ═══════ */
function usePageBg(darkRefs: React.RefObject<HTMLDivElement | null>[]) {
  const [bg, setBg] = useState('#ffffff');
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => {
      let closestDarkness = 0;
      darkRefs.forEach((ref) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(vh, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const coverage = visibleHeight / vh;
        const entry = 1 - Math.max(0, Math.min(1, rect.top / vh));
        const darkness = Math.min(coverage * 1.5, 1) * Math.min(entry * 2, 1);
        closestDarkness = Math.max(closestDarkness, darkness);
      });
      // Interpolate white (#ffffff) → deep warm orange (#2d1506)
      const r = Math.round(255 - closestDarkness * (255 - 45));  // 255 → 45
      const g = Math.round(255 - closestDarkness * (255 - 21));  // 255 → 21
      const b = Math.round(255 - closestDarkness * (255 - 6));   // 255 → 6
      setBg(`rgb(${r},${g},${b})`);
      setIsDark(closestDarkness > 0.5);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [darkRefs]);
  return { bg, isDark };
}

/* ═══════ NAV ═══════ */
function Nav({ onLogoClick, isDark }: { onLogoClick: () => void; isDark: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? isDark ? 'bg-neutral-950/80 backdrop-blur-2xl' : 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-2xl bg-orange-500 flex items-center justify-center">
            <span className="font-extrabold text-sm text-white">P</span>
          </div>
          <span className={`font-extrabold text-[15px] transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Pocketed</span>
        </a>
        <Magnetic href="#cta" className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-colors duration-500 ${
          isDark ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
        }`}>
          Join Waitlist <ArrowUpRight size={12} strokeWidth={2} />
        </Magnetic>
      </div>
    </nav>
  );
}

/* ═══════ SCROLL BAR ═══════ */
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 origin-left z-[60]" style={{ scaleX }} />;
}

/* ═══════ BENTO CARD ═══════ */
function BentoCard({ children, className = '', span = '' }: { children: React.ReactNode; className?: string; span?: string }) {
  return (
    <div className={`border border-neutral-200 rounded-2xl p-6 md:p-8 hover:border-neutral-300 transition-colors ${span} ${className}`}>
      {children}
    </div>
  );
}

/* ═══════ HERO PRODUCT VISUAL ═══════ */

function HeroVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: 900 }}>
      {/* Back card — savings summary */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-2 right-0 w-56 rounded-2xl bg-white border border-neutral-100 shadow-[0_4px_32px_rgba(0,0,0,0.06)] p-5"
        style={{ transform: 'rotate(3deg)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
            <BarChart3 size={14} strokeWidth={1.5} className="text-orange-500" />
          </div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">This month</span>
        </div>
        <p className="text-3xl font-extrabold tracking-tight text-neutral-900">$184<span className="text-base font-semibold text-green-500 ml-1">.20</span></p>
        <p className="text-xs text-neutral-400 mt-1">recovered across 6 claims</p>
        <div className="flex items-end gap-1 mt-3 h-8">
          {[40, 28, 55, 35, 48, 62, 44].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-orange-400/80" style={{ height: `${h}%` }} />
          ))}
        </div>
      </motion.div>

      {/* Main card — refund notification */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="relative z-10 w-72 rounded-2xl bg-white border border-neutral-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <Check size={16} strokeWidth={2.5} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Refund filed</p>
              <p className="text-[11px] text-neutral-400">Just now</p>
            </div>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Auto</span>
        </div>

        <div className="bg-neutral-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500">Sony WH-1000XM5</span>
            <span className="text-xs text-neutral-400">Amazon</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-neutral-400 line-through mr-2">$348.00</span>
              <span className="text-sm font-bold text-neutral-900">$299.99</span>
            </div>
            <span className="text-lg font-extrabold text-orange-500">+$48.01</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-green-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeOut' }}
              className="h-full bg-green-500 rounded-full"
            />
          </div>
          <span className="text-[11px] font-semibold text-green-600">Credited</span>
        </div>
      </motion.div>

      {/* Bottom card — subscription alert */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -bottom-6 -left-4 w-60 rounded-2xl bg-white border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4"
        style={{ transform: 'rotate(-2deg)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <CreditCard size={14} strokeWidth={1.5} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-neutral-900 truncate">Unused subscription found</p>
            <p className="text-[11px] text-neutral-400">Hulu — no activity for 47 days</p>
          </div>
          <span className="text-sm font-extrabold text-orange-500 whitespace-nowrap">$17.99<span className="text-[10px] font-medium text-neutral-400">/mo</span></span>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════ MOCK-STATE COMPONENTS ═══════ */

function CtaForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading' || state === 'success') return;
    if (!email || !email.includes('@')) { setState('error'); return; }
    setState('loading');
    setTimeout(() => setState('success'), 1600);
  };
  return (
    <div id="cta" className="bg-neutral-950 rounded-2xl p-8 md:p-12 flex flex-col justify-center text-white">
      <AnimatePresence mode="wait">
        {state === 'success' ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} strokeWidth={2} className="text-white" />
            </motion.div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-2">You&apos;re in.</h3>
            <p className="text-neutral-400 text-sm mb-1">We&apos;ll notify <span className="text-white font-medium">{email}</span> when it&apos;s your turn.</p>
            <p className="text-neutral-600 text-xs">You&apos;re #4,247 on the waitlist</p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -10 }}>
            <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold tracking-tight mb-4">
              Your money is waiting.
            </h3>
            <p className="text-neutral-400 text-sm mb-8">Join 4,200+ people who stopped leaving money on the table. Free to start, cancel anytime.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                  placeholder="you@email.com" required
                  className={`w-full px-4 py-3 rounded-2xl bg-white/10 border text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-colors ${
                    state === 'error' ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-white/10'
                  }`} />
                {state === 'error' && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-5 left-1 text-xs text-red-400">
                    Please enter a valid email address
                  </motion.p>
                )}
              </div>
              <motion.button whileHover={state === 'idle' ? { scale: 1.03 } : {}} whileTap={state === 'idle' ? { scale: 0.97 } : {}} type="submit"
                disabled={state === 'loading'}
                className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                  state === 'loading' ? 'bg-orange-500/70 cursor-wait' : 'bg-orange-500 hover:bg-orange-400'
                }`}>
                {state === 'loading' ? (
                  <><Loader2 size={14} strokeWidth={2} className="animate-spin" /> Joining...</>
                ) : 'Get Access'}
              </motion.button>
            </form>
            <p className="mt-4 text-[11px] text-neutral-700">Free. No credit card.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE — BIG TEXT BENTO VARIATION
   ═══════════════════════════════════════════════ */
export default function V2() {
  const [coinRain, setCoinRain] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { bg: pageBg, isDark } = usePageBg([featuresRef]);
  const handleDone = useCallback(() => setCoinRain(false), []);

  const features = [
    { icon: TrendingDown, title: 'Price Drop Refunds', desc: 'Bought something last week? If the price dropped, we automatically file for the difference. Average claim: $23.', stat: '$23 avg' },
    { icon: Clock, title: 'Return Window Alerts', desc: "We track return policies across 200+ stores and ping you 48 hours before your window closes. No more missed deadlines.", stat: '200+ stores' },
    { icon: CreditCard, title: 'Subscription Watchdog', desc: "That gym membership from January? The free trial you forgot to cancel? We surface every recurring charge so you can decide what stays.", stat: '$94/mo avg' },
    { icon: Shield, title: 'Warranty Vault', desc: "Every warranty from every purchase, extracted from your receipts and organized by expiration. One tap to file a claim.", stat: 'Auto-organized' },
    { icon: Truck, title: 'Late Delivery Credits', desc: "Amazon Prime guarantees 2-day shipping. FedEx Express has a money-back guarantee. When they're late, we file for you.", stat: 'Auto-filed' },
    { icon: Wifi, title: 'Outage Rebates', desc: "Your ISP promised 99.9% uptime. When they miss it, you're owed a prorated credit. We calculate it and show you how to claim.", stat: '40+ providers' },
  ];

  const testimonials = [
    { name: 'Jake M.', loc: 'Austin, TX', amount: '$347', quote: "I had no idea I was sitting on $347 in price adjustments. Pocketed found every single one — and filed the claims before I finished my morning coffee." },
    { name: 'Priya S.', loc: 'Seattle, WA', amount: '$41/mo', quote: "Three streaming services I hadn't touched in months. That's $41 a month I was just... burning. Never again." },
    { name: 'Marcus T.', loc: 'Chicago, IL', amount: '$1,200', quote: "My MacBook warranty was 11 days from expiring and I had a dead pixel I'd been ignoring. Full replacement. Twelve hundred dollars." },
  ];

  const faqItems = [
    { q: 'How do you access my email without storing it?', a: "We use OAuth (the same secure method Google and Apple use for sign-in). We scan receipt-related emails in real-time and never store your email content. Your credentials never touch our servers." },
    { q: 'What does Pocketed cost — and is there a catch?', a: "No catch. We charge a flat monthly subscription ($3.99/mo for Pro). We never take a percentage of your refunds. You keep 100% of every dollar recovered." },
    { q: "What if I don't recover enough to justify paying?", a: "Every Pro plan comes with a 60-day money-back guarantee. If you haven't recovered at least what you paid, we refund your subscription. No questions, no forms." },
    { q: 'Which retailers and services do you monitor?', a: "200+ and growing weekly. Amazon, Target, Best Buy, Walmart, Apple, Nike, Costco, plus streaming services (Netflix, Spotify, etc.), ISPs (Comcast, AT&T, Verizon), and insurance providers." },
    { q: 'Do you actually submit claims on my behalf?', a: "Yes. Pro and Family plans include auto-filing for price adjustments and late delivery credits. For warranties and returns, we prepare the claim and walk you through submission in under 2 minutes." },
  ];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: pageBg, transition: 'color 0.3s', color: isDark ? '#fff' : '#0a0a0a' }}>
      {/* Clean — no gimmicky overlays */}
      <ScrollBar />
      <Nav onLogoClick={() => {}} isDark={isDark} />

      {/* ═══════ 1. HERO — GIANT TEXT + 3D COIN ═══════ */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-sm font-bold tracking-[0.2em] uppercase text-orange-500 mb-6">
              Automatic money recovery
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.04em] mb-8">
              You&apos;re owed
              <br />more than
              <br />you <span className="text-orange-500">think.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-neutral-500 text-lg max-w-lg mb-10 leading-relaxed">
              Price drops after you buy. Returns you forget to make. Subscriptions bleeding you dry. Pocketed finds it all and gets your money back — automatically.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex items-center gap-4">
              <Magnetic href="#cta" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-neutral-800 transition-colors">
                Get Early Access <ArrowRight size={14} strokeWidth={2} />
              </Magnetic>
              <span className="text-sm text-neutral-400">4,200+ on the waitlist</span>
            </motion.div>
          </div>

          {/* Floating product UI */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block w-[380px] h-[400px] relative -mr-4">
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* ═══════ 2. BENTO — PROBLEM + STATS ═══════ */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Large card — scroll highlight text */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="col-span-2 row-span-2">
            <BentoCard className="h-full flex flex-col justify-center" span="">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-4">The problem</p>
              <ScrollHighlight
                text="Americans leave $48 billion on the table every single year. Not because they don't care — because no one tells them. Price adjustments expire. Return windows close. Free trials convert to paid. We built Pocketed to fix that."
                className="text-[clamp(1.1rem,2.2vw,1.6rem)] font-semibold leading-[1.45] tracking-tight"
              />
            </BentoCard>
          </motion.div>

          {/* Stat cards */}
          {[
            { val: 48, pre: '$', suf: 'B+', label: 'Left on the table by U.S. consumers', accent: true },
            { val: 200, suf: '+', label: 'Retailers and services monitored', accent: false },
            { val: 347, pre: '$', label: 'Average recovered in the first month', accent: false },
            { val: 0, label: 'From signup to your first recovery alert', accent: false, custom: '< 3m' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.06 }}>
              <BentoCard className="h-full flex flex-col justify-between min-h-[160px]">
                <p className="text-xs font-bold tracking-[0.1em] uppercase text-neutral-400">{s.label}</p>
                <p className={`text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] leading-none ${s.accent ? 'text-orange-500' : ''}`}>
                  {s.custom || <Counter value={s.val} prefix={s.pre} suffix={s.suf} />}
                </p>
              </BentoCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ 3. BENTO — HOW IT WORKS ═══════ */}
      <section id="how" className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">How it works</p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-12">
            Three steps.<br /><span className="text-neutral-400">That&apos;s it.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { num: '01', title: 'Link your inbox', desc: 'Connect Gmail or Outlook in 30 seconds. We scan receipts only — never personal emails, never stored.', icon: Mail },
              { num: '02', title: 'We do the digging', desc: 'Our engine cross-references every purchase against price histories, return policies, warranty databases, and subscription records.', icon: BarChart3 },
              { num: '03', title: 'Cash hits your account', desc: 'We auto-file claims with retailers or walk you through it in under 2 minutes. You keep every dollar.', icon: Zap },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <BentoCard className="h-full min-h-[280px] flex flex-col justify-between group">
                  <div className="flex items-start justify-between">
                    <span className="text-[clamp(3rem,6vw,5rem)] font-extrabold text-neutral-100 leading-none tracking-[-0.04em] group-hover:text-orange-100 transition-colors">
                      {s.num}
                    </span>
                    <div className="w-10 h-10 rounded-2xl border border-neutral-200 flex items-center justify-center group-hover:border-orange-300 group-hover:bg-orange-50 transition-all">
                      <s.icon size={18} strokeWidth={1.5} className="text-neutral-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. DARK ZONE — FEATURES BENTO ═══════ */}
      <div ref={featuresRef} id="features">
        <div className="px-6 py-32 md:py-40">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Title card — spans 2 cols */}
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="lg:col-span-2">
                <div className="border border-orange-400/20 bg-orange-500/[0.06] rounded-2xl p-8 md:p-10 h-full min-h-[220px] flex flex-col justify-end">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-300 mb-3">What we recover</p>
                  <h2 className="text-[clamp(1.8rem,3.5vw,3rem)] font-extrabold text-white tracking-tight leading-[1.1]">
                    Six ways we put<br />money back in<br />your pocket.
                  </h2>
                </div>
              </motion.div>

              {/* Feature cards — orange-tinted glass */}
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    <div className="group border border-white/[0.08] bg-white/[0.04] rounded-2xl p-6 md:p-7 hover:border-orange-400/25 hover:bg-orange-500/[0.06] transition-all h-full min-h-[220px] flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-2xl border border-orange-400/20 bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                          <Icon size={18} strokeWidth={1.5} className="text-orange-300" />
                        </div>
                        <span className="text-xs font-bold text-orange-300/60 tracking-wider">{f.stat}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-200 transition-colors">{f.title}</h3>
                        <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ 5. TESTIMONIALS BENTO ═══════ */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-12">
            Don&apos;t take our<br />word for it.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Big quote card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:row-span-2">
              <BentoCard className="h-full flex flex-col justify-between min-h-[360px]">
                <div>
                  <div className="flex gap-0.5 mb-6">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} strokeWidth={1.5} className="fill-orange-400 text-orange-400" />)}
                  </div>
                  <p className="text-[clamp(1.3rem,2.5vw,1.8rem)] font-semibold leading-[1.35] tracking-tight mb-6">
                    &ldquo;{testimonials[0].quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-neutral-100">
                  <div>
                    <p className="font-bold text-sm">{testimonials[0].name}</p>
                    <p className="text-sm text-neutral-400">{testimonials[0].loc}</p>
                  </div>
                  <span className="text-3xl font-extrabold text-orange-500">{testimonials[0].amount}</span>
                </div>
              </BentoCard>
            </motion.div>

            {/* Smaller quote cards */}
            {testimonials.slice(1).map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.08 }}>
                <BentoCard className="h-full flex flex-col justify-between">
                  <p className="text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-sm text-neutral-400">{t.loc}</p>
                    </div>
                    <span className="text-xl font-extrabold text-orange-500">{t.amount}</span>
                  </div>
                </BentoCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 6. PRICING ═══════ */}
      <section id="pricing" className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-3">
            Pricing.
          </h2>
          <p className="text-neutral-500 mb-12">No cuts. You keep everything.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Free', price: '$0', desc: 'See what you\'re missing', features: ['Track up to 5 purchases', 'See recovery opportunities', 'Self-file claims', 'Email support'], pop: false },
              { name: 'Pro', price: '$3.99', desc: 'Full autopilot recovery', features: ['Unlimited purchase tracking', 'Auto-filed price drop claims', 'All 6 recovery channels', '48-hour return window alerts', '60-day money-back guarantee'], pop: true },
              { name: 'Family', price: '$6.99', desc: 'Cover the whole household', features: ['Up to 5 email accounts', 'Unified family dashboard', 'Shared warranty vault', 'Everything in Pro'], pop: false },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className={`relative rounded-2xl p-8 h-full ${
                  plan.pop ? 'bg-neutral-900 text-white ring-1 ring-orange-500/30' : 'border border-neutral-200'
                }`}>
                  {plan.pop && <div className="absolute -top-2.5 left-6"><span className="px-2.5 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full tracking-wider">POPULAR</span></div>}
                  <p className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] mb-1">{plan.price}<span className={`text-base font-medium ${plan.pop ? 'text-neutral-500' : 'text-neutral-400'}`}>/mo</span></p>
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className={`text-sm mb-6 ${plan.pop ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.desc}</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 rounded-2xl font-semibold text-sm mb-6 ${
                      plan.pop ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-neutral-100 hover:bg-neutral-200'
                    } transition-colors`}>{plan.pop ? 'Join Waitlist' : 'Start Free'}</motion.button>
                  <div className="space-y-2.5">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check size={13} strokeWidth={2} className={plan.pop ? 'text-orange-400' : 'text-orange-500'} />
                        <span className={`text-sm ${plan.pop ? 'text-neutral-300' : 'text-neutral-600'}`}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. FAQ + CTA SPLIT ═══════ */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* FAQ side */}
          <div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-8">
              FAQ.
            </h2>
            {faqItems.map((item, i) => <Accordion key={i} q={item.q} a={item.a} />)}
          </div>

          {/* CTA side */}
          <CtaForm />
        </div>
      </section>

      {/* ═══════ 8. FOOTER ═══════ */}
      <footer className="border-t border-neutral-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
              <span className="text-white text-[9px] font-extrabold">P</span>
            </div>
            <span className="font-extrabold text-sm">Pocketed</span>
          </div>
          <p className="text-[11px] text-neutral-400">&copy; 2026 Pocketed. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
