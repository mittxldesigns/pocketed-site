'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion, useInView, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence,
} from 'framer-motion';
import {
  TrendingDown, Clock, CreditCard, Shield, Truck, Wifi,
  ChevronDown, Star, ArrowUpRight, ArrowRight, Check,
  Zap, Mail, BarChart3, Loader2, CheckCircle2, AlertTriangle, DollarSign, X,
} from 'lucide-react';

/* ═══════════ BRAND TOKENS ═══════════ */
const brand = {
  accent: '#F97316',
  dark: '#0a0a0a',
  card: 'bg-white border border-neutral-200',
  cardDark: 'bg-white/[0.05] border border-white/[0.08]',
  radius: 'rounded-2xl',
  iconBox: 'w-10 h-10 rounded-2xl flex items-center justify-center',
};

/* ═══════════ MICRO-INTERACTIONS ═══════════ */

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

/* ═══════════ PAGE BG HOOK ═══════════ */
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
      const r = Math.round(255 - closestDarkness * 245);
      const hex = `#${r.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
      setBg(hex);
      setIsDark(closestDarkness > 0.5);
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => window.removeEventListener('scroll', check);
  }, [darkRefs]);
  return { bg, isDark };
}

/* ═══════════ NAV ═══════════ */
function Nav({ isDark }: { isDark: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? isDark
          ? 'bg-neutral-950/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
          : 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
        : ''
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/v3" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-2xl bg-orange-500 flex items-center justify-center">
            <span className="font-extrabold text-sm text-white">P</span>
          </div>
          <span className={`font-extrabold text-[15px] transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Pocketed</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {[['How it Works', '#how'], ['Features', '#features'], ['Pricing', '#pricing'], ['FAQ', '#faq']].map(([l, h]) => (
            <a key={l} href={h} className={`text-[13px] font-medium relative group transition-colors duration-500 ${
              isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
            }`}>
              {l}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-orange-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>
        <Magnetic href="#cta" className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-colors duration-500 ${
          isDark ? 'bg-white text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-900 text-white hover:bg-neutral-800'
        }`}>
          Join Waitlist <ArrowUpRight size={12} strokeWidth={2} />
        </Magnetic>
      </div>
    </nav>
  );
}

function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 origin-left z-[60]" style={{ scaleX }} />;
}

/* ═══════════ HERO PRODUCT VISUAL ═══════════ */
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

/* ═══════════ PROBLEM SCENARIO CARD ═══════════ */
function ScenarioCard({ icon: Icon, label, title, detail, amount, delay }: {
  icon: React.ElementType; label: string; title: string; detail: string; amount: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay }}
      className="group"
    >
      <div className="border border-neutral-200 rounded-2xl p-6 md:p-8 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-100 transition-all duration-300 h-full">
        <div className="flex items-start justify-between mb-5">
          <div className={`${brand.iconBox} bg-red-50 group-hover:bg-red-100 transition-colors`}>
            <Icon size={18} strokeWidth={1.5} className="text-red-500" />
          </div>
          <span className="text-[11px] font-bold text-red-500/70 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{label}</span>
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed mb-5">{detail}</p>
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <span className="text-xs text-neutral-400">Money left behind</span>
          <span className="text-2xl font-extrabold text-red-500">{amount}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════ CTA FORM ═══════════ */
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
                ) : 'Get Early Access'}
              </motion.button>
            </form>
            <p className="mt-4 text-[11px] text-neutral-700">Free. No credit card required.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   V3 — ESTABLISHED BRAND VARIATION
   Best of v1 (credibility) + v2 (impact) + new problem section
   ═══════════════════════════════════════════════ */
export default function V3() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const { bg: pageBg, isDark } = usePageBg([featuresRef]);

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
    { name: 'Sarah K.', loc: 'Denver, CO', amount: '$89', quote: "Two late Amazon deliveries in one month. I didn't even know you could claim credits for that. Pocketed did it automatically." },
    { name: 'David L.', loc: 'NYC, NY', amount: '$156', quote: "ISP was charging me for 500Mbps. Speed tests showed 180Mbps. Pocketed calculated 4 months of prorated credits. $156 back." },
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
      <ScrollBar />
      <Nav isDark={isDark} />

      {/* ══════ HERO ══════ */}
      <section className="min-h-screen flex flex-col justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-200 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-semibold text-orange-700">Now accepting early access</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[clamp(2.8rem,6vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] mb-8">
              Companies owe
              <br />you money.
              <br /><span className="text-orange-500">We get it back.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="text-neutral-500 text-lg max-w-lg mb-10 leading-relaxed">
              Price drops after you buy. Returns you forget to make. Subscriptions bleeding you dry. Pocketed finds it all and gets your money back — automatically.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center gap-4 mb-10">
              <Magnetic href="#cta" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-neutral-800 transition-colors hover:shadow-lg hover:shadow-neutral-900/15">
                Get Early Access <ArrowRight size={14} strokeWidth={2} />
              </Magnetic>
              <a href="#how" className="text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                See how it works
                <ArrowUpRight size={13} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-3 pt-6 border-t border-neutral-100">
              <div className="flex -space-x-2">
                {['bg-orange-400', 'bg-rose-400', 'bg-violet-400', 'bg-sky-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold`}>
                    {['J', 'P', 'M', 'S'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-orange-400 text-orange-400" strokeWidth={1.5} />)}
                </div>
                <span className="text-xs text-neutral-400">4,200+ on the waitlist</span>
              </div>
            </motion.div>
          </div>

          {/* Floating product UI */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block w-full h-[400px] relative -mr-4">
            <HeroVisual />
          </motion.div>
        </div>

        {/* Store logos */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="max-w-6xl mx-auto w-full mt-16 pt-10 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400 text-center mb-5 font-medium uppercase tracking-wider">Works with your favorite stores</p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-30 hover:opacity-50 transition-opacity duration-700">
            {['Amazon', 'Target', 'Best Buy', 'Walmart', 'Apple', 'Nike', 'Costco'].map(name => (
              <span key={name} className="text-sm font-bold text-neutral-900">{name}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════ THE PROBLEM — SCENARIO CARDS + SCROLL HIGHLIGHT ══════ */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">The problem</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-4">
              This is happening to you<br /><span className="text-neutral-400">right now.</span>
            </h2>
            <p className="text-neutral-500 max-w-xl text-base leading-relaxed">
              Every month, money slips through the cracks. Not because you&apos;re careless — because the system is designed to make you forget.
            </p>
          </motion.div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 mb-20">
            <ScenarioCard
              icon={TrendingDown}
              label="Price drop"
              title="You bought headphones for $348."
              detail="Two days later, the price dropped to $299. Amazon doesn't tell you. The 30-day price adjustment window ticks away in silence."
              amount="-$48"
              delay={0}
            />
            <ScenarioCard
              icon={CreditCard}
              label="Forgotten sub"
              title="That free trial from March?"
              detail="It converted to $17.99/mo four months ago. You haven't opened the app once. That's $72 gone — and counting every 30 days."
              amount="-$72"
              delay={0.1}
            />
            <ScenarioCard
              icon={Shield}
              label="Expired warranty"
              title="Your laptop has a dead pixel."
              detail="The manufacturer warranty expires in 11 days. You've been meaning to deal with it. You won't. A $1,200 replacement, gone."
              amount="-$1,200"
              delay={0.2}
            />
          </div>

          {/* Running total */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-2xl border border-red-200 bg-red-50/50 mb-20">
            <div>
              <p className="text-sm font-bold text-red-700 mb-1">Just from these three scenarios alone</p>
              <p className="text-xs text-red-500/70">And this is one person, one month. Multiply by every purchase you&apos;ve ever made.</p>
            </div>
            <div className="text-right">
              <p className="text-4xl md:text-5xl font-extrabold text-red-600 tracking-tight">-$<Counter value={1320} /></p>
              <p className="text-xs text-red-400 mt-1">lost in a single month</p>
            </div>
          </motion.div>

          {/* Scroll highlight — the systemic statement */}
          <div className="max-w-3xl mx-auto">
            <ScrollHighlight
              text="Every year, Americans leave $48 billion on the table. Not because they don't care — because no one tells them. Price adjustments expire. Return windows close. Free trials convert. Warranties lapse. Companies are counting on you to forget. We built Pocketed so you never have to."
              className="text-[clamp(1.2rem,2.5vw,1.8rem)] font-semibold leading-[1.45] tracking-tight"
            />
          </div>
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-16 px-6 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { val: 48, pre: '$', suf: 'B+', label: 'Left unclaimed annually' },
            { val: 200, suf: '+', label: 'Retailers tracked' },
            { val: 347, pre: '$', label: 'Avg. recovered per user' },
            { val: 3, label: 'Minutes to first alert', custom: '< 3 min' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold mb-1">
                {s.custom || <Counter value={s.val} prefix={s.pre} suffix={s.suf} />}
              </p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">How it works</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] leading-[0.95]">
              Three steps. <span className="text-neutral-400">That&apos;s it.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Connect your email', desc: 'Link Gmail or Outlook securely via OAuth. We only scan receipts — never personal emails, never stored.', icon: Mail },
              { num: '02', title: "We find what you're owed", desc: 'Our engine cross-references every purchase against price histories, return policies, warranty databases, and subscription records.', icon: BarChart3 },
              { num: '03', title: 'Get your money back', desc: 'We auto-file claims with retailers or walk you through it in under 2 minutes. You keep every dollar.', icon: Zap },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <div className={`${brand.card} ${brand.radius} p-8 h-full group hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-300 transition-all duration-300`}>
                  <div className={`${brand.iconBox} bg-neutral-100 group-hover:bg-orange-50 transition-colors mb-6`}>
                    <s.icon size={18} strokeWidth={1.5} className="text-neutral-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 tracking-widest block mb-3">STEP {s.num}</span>
                  <h3 className="text-lg font-extrabold mb-3">{s.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES — DARK ZONE ══════ */}
      <div ref={featuresRef} id="features">
        <div className="py-32 md:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-orange-400 mb-3">Recovery channels</p>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold text-white tracking-tight max-w-xl leading-[0.95]">
                Six ways we put money back in your pocket.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                    <div className={`group ${brand.cardDark} ${brand.radius} p-6 hover:bg-white/[0.08] hover:border-orange-500/15 transition-all duration-300 h-full`}>
                      <div className="flex items-start justify-between mb-6">
                        <div className={`${brand.iconBox} bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors`}>
                          <Icon size={18} strokeWidth={1.5} className="text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2 py-1 rounded-2xl border border-white/10">{f.stat}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">{f.title}</h3>
                      <p className="text-[13px] text-neutral-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════ TESTIMONIALS — auto-scroll ticker ══════ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto mb-12">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] text-center leading-[0.95]">
            Real people. <span className="text-neutral-400">Real money recovered.</span>
          </motion.h2>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <motion.div animate={{ x: [0, -1800] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} className="flex gap-4 w-max">
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <div key={i}
                className={`w-[340px] shrink-0 ${brand.card} ${brand.radius} p-6 hover:shadow-md hover:border-neutral-300 transition-all`}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={11} strokeWidth={1.5} className="fill-orange-400 text-orange-400" />)}
                </div>
                <p className="text-sm text-neutral-700 mb-5 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                    <p className="text-[11px] text-neutral-400">{t.loc}</p>
                  </div>
                  <span className="text-xl font-extrabold text-orange-500">{t.amount}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="pricing" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">Pricing</p>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-3">Simple, honest pricing</h2>
            <p className="text-neutral-500 text-sm">No percentage cuts. You keep everything.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', desc: 'See what you\'re missing', features: ['Track up to 5 purchases', 'See recovery opportunities', 'Self-file claims', 'Email support'], pop: false },
              { name: 'Pro', price: '$3.99', desc: 'Full autopilot recovery', features: ['Unlimited purchase tracking', 'Auto-filed price drop claims', 'All 6 recovery channels', '48-hour return window alerts', '60-day money-back guarantee'], pop: true },
              { name: 'Family', price: '$6.99', desc: 'Cover the whole household', features: ['Up to 5 email accounts', 'Unified family dashboard', 'Shared warranty vault', 'Everything in Pro'], pop: false },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative ${brand.radius} p-7 ${
                  plan.pop ? 'bg-neutral-900 text-white shadow-xl ring-2 ring-orange-500/30' : `${brand.card}`
                }`}>
                {plan.pop && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-2xl">POPULAR</span></div>}
                <h3 className="text-lg font-extrabold mb-1">{plan.name}</h3>
                <p className={`text-xs mb-4 ${plan.pop ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.desc}</p>
                <p className="text-3xl font-extrabold mb-5">{plan.price}<span className={`text-sm font-medium ${plan.pop ? 'text-neutral-500' : 'text-neutral-400'}`}>/mo</span></p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`w-full py-2.5 ${brand.radius} font-semibold text-sm transition-all mb-5 ${
                    plan.pop ? 'bg-orange-500 text-white hover:bg-orange-400' : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}>{plan.pop ? 'Join Waitlist' : 'Start Free'}</motion.button>
                <div className="space-y-2.5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <Check size={14} strokeWidth={2} className={`mt-0.5 ${plan.pop ? 'text-orange-400' : 'text-orange-500'}`} />
                      <span className={`text-[13px] ${plan.pop ? 'text-neutral-300' : 'text-neutral-600'}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FAQ + CTA SPLIT ══════ */}
      <section id="faq" className="px-6 pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8">
              <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">FAQ</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[0.95]">
                Questions? <span className="text-neutral-400">Answers.</span>
              </h2>
            </motion.div>
            {faqItems.map((item, i) => <Accordion key={i} q={item.q} a={item.a} />)}
          </div>
          <CtaForm />
        </div>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer className="bg-neutral-950 border-t border-white/5 py-12 px-6 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-2xl bg-orange-500 flex items-center justify-center"><span className="text-white text-[10px] font-extrabold">P</span></div>
                <span className="font-extrabold text-white text-sm">Pocketed</span>
              </div>
              <p className="text-xs text-neutral-600">Get back what&apos;s rightfully yours.</p>
            </div>
            {[
              { t: 'Product', ls: [['How it Works', '#how'], ['Pricing', '#pricing'], ['FAQ', '#faq']] },
              { t: 'Company', ls: [['About', '#'], ['Blog', '#'], ['Contact', '#']] },
              { t: 'Legal', ls: [['Privacy', '#'], ['Terms', '#']] },
            ].map(col => (
              <div key={col.t}>
                <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-3">{col.t}</p>
                <ul className="space-y-2">
                  {col.ls.map(([l, h]) => <li key={l}><a href={h} className="text-sm text-neutral-500 hover:text-orange-400 transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-neutral-700">Built by <a href="#" className="text-neutral-500 hover:text-orange-400 transition-colors">Zamn Studios</a></p>
            <p className="text-[11px] text-neutral-700">&copy; 2026 Pocketed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
