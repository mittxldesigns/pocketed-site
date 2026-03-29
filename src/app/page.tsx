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
    const dur = 1400;
    const step = (t: number) => {
      if (s === null) s = t;
      const p = Math.min((t - s) / dur, 1);
      // Spring-like overshoot: goes to ~108% then settles
      const spring = p < 0.7
        ? (p / 0.7) * 1.08
        : 1.08 - 0.08 * ((p - 0.7) / 0.3);
      setN(Math.round(Math.min(spring, 1.08) * value));
      if (p < 1) raf = requestAnimationFrame(step);
      else setN(value); // ensure exact final value
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
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const fontWeight = useTransform(progress, [start, end], [300, 700]);
  return <motion.span style={{ opacity, fontWeight }} className="inline-block mr-[0.3em]">{word}</motion.span>;
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
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  // On hero (not past it), always show white text / transparent bg
  const onHero = !pastHero;
  const showWhite = onHero || isDark;
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      !pastHero
        ? 'opacity-0 pointer-events-none'
        : isDark ? 'bg-neutral-950/80 backdrop-blur-2xl opacity-100' : 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)] opacity-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-2xl bg-orange-500 flex items-center justify-center">
            <span className="font-extrabold text-sm text-white">P</span>
          </div>
          <span className={`font-extrabold text-[15px] transition-colors duration-500 ${showWhite ? 'text-white' : 'text-neutral-900'}`}>Pocketed</span>
        </a>
        <Magnetic href="#cta" className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[13px] font-semibold transition-colors duration-500 ${
          showWhite ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
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

/* ═══════ WAITLIST API HELPER ═══════ */
async function submitWaitlist(email: string, source = 'v2_landing'): Promise<{ success: boolean; duplicate?: boolean; message: string }> {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Network error. Please try again.' };
  }
}

/* ═══════ INLINE CTA BANNER ═══════ */
function InlineCta({ headline, sub, dark = false, btnText = 'Get Early Access' }: { headline: string; sub: string; dark?: boolean; btnText?: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || loading) return;
    setLoading(true);
    const result = await submitWaitlist(email, dark ? 'v2_problem_cta' : 'v2_social_cta');
    setLoading(false);
    if (result.success) {
      setIsDuplicate(!!result.duplicate);
      setDone(true);
    }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`rounded-2xl p-8 md:p-12 ${dark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 border border-neutral-200'}`}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-2">
            <CheckCircle2 size={28} className="text-green-500 mx-auto mb-3" />
            <p className="text-lg font-bold">{isDuplicate ? 'You\u2019re already on the list!' : 'You\u2019re on the list.'}</p>
            <p className={`text-sm mt-1 ${dark ? 'text-neutral-500' : 'text-neutral-400'}`}>
              {isDuplicate ? 'We already have your spot saved. Sit tight!' : `We\u2019ll be in touch at ${email}`}
            </p>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <h3 className="text-[clamp(1.3rem,2.5vw,2rem)] font-extrabold tracking-tight mb-2">{headline}</h3>
            <p className={`text-sm mb-6 ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>{sub}</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required
                className={`flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${
                  dark ? 'bg-white/10 border border-white/10 text-white placeholder-neutral-600' : 'bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400'
                }`} />
              <motion.button whileHover={!loading ? { scale: 1.03 } : {}} whileTap={!loading ? { scale: 0.97 } : {}} type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-orange-500 text-white rounded-2xl font-semibold text-sm hover:bg-orange-400 transition-colors whitespace-nowrap flex items-center gap-2 ${loading ? 'opacity-70 cursor-wait' : ''}`}>
                {loading ? <><Loader2 size={14} className="animate-spin" /> Joining...</> : btnText}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════ STICKY BOTTOM BAR ═══════ */
function StickyBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const h = () => {
      const scrolled = window.scrollY > window.innerHeight * 0.8;
      const nearBottom = window.scrollY + window.innerHeight > document.body.scrollHeight - 600;
      setVisible(scrolled && !nearBottom);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || loading) return;
    setLoading(true);
    const result = await submitWaitlist(email, 'v2_sticky_bar');
    setLoading(false);
    if (result.success) {
      setDone(true);
      setTimeout(() => setDismissed(true), 2000);
    }
  };
  if (dismissed) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 py-3 px-6"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-white text-sm font-bold">Stop leaving money on the table.</p>
              <p className="text-neutral-500 text-xs">Join 4,200+ getting their money back.</p>
            </div>
            {done ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle2 size={16} /> {done === true ? "You\u2019re in!" : "You\u2019re in!"}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 flex-1 sm:flex-none">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required
                  className="flex-1 sm:w-56 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
                <motion.button whileTap={{ scale: 0.97 }} type="submit"
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-400 transition-colors whitespace-nowrap">
                  Claim my spot
                </motion.button>
              </form>
            )}
            <button onClick={() => setDismissed(true)} className="text-neutral-600 hover:text-neutral-400 transition-colors p-1">
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════ REFUND CALCULATOR ═══════ */
function RefundCalculator() {
  const [spend, setSpend] = useState(3000);
  const [show, setShow] = useState(false);
  const annual = Math.round(spend * 0.03 * 12);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => { if (inView) setTimeout(() => setShow(true), 300); }, [inView]);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 md:p-12">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Your money</p>
      <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-extrabold tracking-tight mb-2">
        How much are you leaving on the table?
      </h3>
      <p className="text-sm text-neutral-500 mb-8">Drag the slider or type your average monthly spending.</p>
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-neutral-400 shrink-0">Monthly spend</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
              <input type="number" value={spend} onChange={e => setSpend(Math.max(0, Number(e.target.value)))}
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/40" />
            </div>
          </div>
          <input type="range" min={500} max={15000} step={100} value={spend} onChange={e => setSpend(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-orange-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg" />
          <div className="flex justify-between mt-2 text-xs text-neutral-400">
            <span>$500/mo</span><span>$15,000/mo</span>
          </div>
        </div>
        <div className="text-center md:text-right shrink-0 min-w-[180px]">
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Estimated annual recovery</p>
          <motion.p
            key={annual}
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-green-600 tracking-tight leading-none">
            ${annual.toLocaleString()}
          </motion.p>
          <p className="text-xs text-neutral-400 mt-1">per year, back in your pocket</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ COMPETITOR CARD ═══════ */
function CompetitorRow({ name, status, note, dead, delay }: { name: string; status: string; note: string; dead: boolean; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay }}
      className="flex items-center gap-4 p-5 rounded-xl border border-neutral-100 bg-white group hover:border-neutral-200 transition-colors">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${dead ? 'line-through text-neutral-300' : 'text-neutral-700'}`}>{name}</p>
        <p className="text-xs text-neutral-400 mt-0.5 truncate">{note}</p>
      </div>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
        dead ? 'bg-red-50 text-red-500' : 'bg-neutral-100 text-neutral-500'
      }`}>{status}</span>
    </motion.div>
  );
}

/* ═══════ SCENARIO CARD ═══════ */
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
      <div className="receipt-card border border-neutral-200 rounded-2xl p-6 md:p-8 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-100 transition-all duration-300 h-full">
        <div className="flex items-start justify-between mb-5">
          <div className="w-10 h-10 rounded-2xl bg-red-50 group-hover:bg-red-100 transition-colors flex items-center justify-center">
            <Icon size={18} strokeWidth={1.5} className="text-red-500" />
          </div>
          <span className="text-[11px] font-bold text-red-500/70 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{label}</span>
        </div>
        <h3 className="text-base font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed mb-5">{detail}</p>
        <div className="flex items-center justify-between pt-4 ">
          <span className="text-xs text-neutral-400">Money left behind</span>
          <span className="text-2xl font-extrabold text-red-500">{amount}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════ HERO PRODUCT VISUAL ═══════ */

/* ═══════ FILL-WIDTH HEADLINE ═══════ */
function FillWidthHeadline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;
      const targetWidth = container.offsetWidth;
      let lo = 20, hi = 400, best = 100;
      while (hi - lo > 0.5) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (text.scrollWidth <= targetWidth) { best = mid; lo = mid; }
        else { hi = mid; }
      }
      setFontSize(best);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  /* Each word is an isolated inline-block span so its stroke
     never bleeds into adjacent words' counters */
  return (
    <div ref={containerRef} className="w-full overflow-visible">
      <motion.h1
        ref={textRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="leading-[1.2] whitespace-nowrap text-white/90"
        style={{ fontSize: `${fontSize}px`, fontWeight: 500, letterSpacing: '-0.08em', paddingBottom: '0.1em' }}
      >
        Companies{' '}<em className="not-italic" style={{ fontStyle: 'italic', fontWeight: 700, color: 'white', marginLeft: '-0.06em', marginRight: '-0.03em' }}>owe</em>{' '}you.
      </motion.h1>
    </div>
  );
}

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
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading' || state === 'success' || state === 'duplicate') return;
    if (!email || !email.includes('@')) { setState('error'); return; }
    setState('loading');
    const result = await submitWaitlist(email, 'v2_main_cta');
    if (result.success) {
      setState(result.duplicate ? 'duplicate' : 'success');
    } else {
      setState('error');
    }
  };
  const isComplete = state === 'success' || state === 'duplicate';
  return (
    <div id="cta" className="bg-neutral-950 rounded-2xl p-8 md:p-12 flex flex-col justify-center text-white">
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${state === 'duplicate' ? 'bg-orange-500' : 'bg-green-600'}`}>
              <CheckCircle2 size={28} strokeWidth={2} className="text-white" />
            </motion.div>
            <h3 className="text-2xl font-extrabold tracking-tight mb-2">
              {state === 'duplicate' ? 'You\u2019re already in!' : 'You\u2019re in.'}
            </h3>
            <p className="text-neutral-400 text-sm mb-1">
              {state === 'duplicate'
                ? <>We already have <span className="text-white font-medium">{email}</span> saved. Sit tight!</>
                : <>We&apos;ll notify <span className="text-white font-medium">{email}</span> when it&apos;s your turn.</>
              }
            </p>
            {state !== 'duplicate' && <p className="text-neutral-600 text-xs">You&apos;re #4,247 on the waitlist</p>}
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
                ) : 'Get my money back'}
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
    <div className="min-h-screen relative font-jakarta" style={{ backgroundColor: pageBg, transition: 'color 0.3s', color: isDark ? '#fff' : '#0a0a0a' }}>
      <StickyBar />
      <ScrollBar />
      <Nav onLogoClick={() => {}} isDark={isDark} />

      {/* ═══════ 1. HERO — CINEMATIC VIDEO (1:1 Framer) ═══════ */}
      <section className="relative h-screen bg-black font-inter overflow-hidden">
        {/* Video — full screen, edge to edge, no whitespace */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/walter-money.mp4" type="video/mp4" />
        </video>

        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

        {/* Bordered subframe — 40px inset, 50px radius, holds all text */}
        {/* Subframe — max 1800px, centered, inset from edges */}
        <div className="absolute inset-5 md:inset-10 z-10 flex justify-center">
        <div className="w-full max-w-[1800px] h-full rounded-[30px] md:rounded-[50px] border border-white/[0.12] flex flex-col justify-between p-5 md:p-8">
          {/* Top — fill-width headline */}
          <FillWidthHeadline />

          {/* Bottom — subtitle left + CTA right */}
          <div className="flex items-end justify-between gap-4">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white"
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 48px)',
                fontWeight: 300,
                letterSpacing: '-0.04em',
              }}>
              They&apos;re hoping you never find out.
            </motion.p>

            <motion.a href="#cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="group hidden sm:inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/25 text-white hover:border-white/50 hover:bg-white/[0.07] transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden"
              style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.125rem)', fontWeight: 400, letterSpacing: '-0.04em' }}>
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">Get my money back with</span>
              <span className="font-semibold transition-transform duration-300 group-hover:-translate-x-0.5">Pocketed</span>
              <span className="inline-flex transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                <ArrowUpRight size={14} strokeWidth={2} />
              </span>
            </motion.a>
          </div>
        </div>
        </div>
      </section>

      {/* ═══════ 2. THE PROBLEM — SCENARIO CARDS ═══════ */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">The problem</p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold tracking-[-0.04em] leading-[0.92] mb-5">
              This is happening<br />to you <span className="text-neutral-300 hand-underline">right now.</span>
            </h2>
            <p className="text-neutral-500 max-w-xl text-lg leading-relaxed">
              You&apos;re not bad with money. The system is designed to make you forget. And every month, it works.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-12 mb-12">
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
            className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10 rounded-2xl border border-red-200 bg-red-50/50">
            <div>
              <p className="text-base font-bold text-red-700 mb-1">Just from these three scenarios alone</p>
              <p className="text-sm text-red-500/70">And this is one person, one month. Multiply by every purchase you&apos;ve ever made.</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[clamp(3rem,6vw,5rem)] font-extrabold text-red-600 tracking-tight leading-none">-$<Counter value={1320} /></p>
              <p className="text-xs text-red-400 mt-2">lost in a single month</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA — after problem ═══════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <InlineCta
            headline="Stop losing money you didn't know you had."
            sub="Get early access to Pocketed. We'll scan your first 30 days of purchases for free."
            dark
            btnText="See my refunds"
          />
        </div>
      </section>

      {/* ═══════ REFUND CALCULATOR ═══════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <RefundCalculator />
        </div>
      </section>

      {/* ═══════ 2b. SCROLL HIGHLIGHT — THE SYSTEMIC STATEMENT ═══════ */}
      <section className="px-6 py-24 md:py-40">
        <div className="max-w-5xl mx-auto">
          <ScrollHighlight
            text="Every year, Americans leave $48 billion on the table. Not because they don't care — because no one tells them. Price adjustments expire. Return windows close. Free trials convert. Warranties lapse. Companies are counting on you to forget. We built Pocketed so you never have to."
            className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold leading-[1.35] tracking-tight"
          />
        </div>
      </section>

      {/* ═══════ BRAND VOICE LINE ═══════ */}
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-center px-6 pb-20">
        <span className="italic text-neutral-400 text-lg md:text-xl">
          Companies aren&apos;t losing sleep over your money. We are.
        </span>
      </motion.p>

      {/* ═══════ 2c. STATS ═══════ */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
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
      <section id="how" className="px-6 py-24 md:py-32">
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

      {/* ═══════ CTA — after how it works ═══════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-orange-200 bg-orange-50/50 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-[clamp(1.3rem,2.5vw,2rem)] font-extrabold tracking-tight text-neutral-900 mb-2">
                See what you&apos;re owed — in 30 seconds.
              </h3>
              <p className="text-sm text-neutral-500">Connect your inbox. We do the rest. No credit card, no commitment.</p>
            </div>
            <Magnetic href="#cta" className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-orange-400 transition-colors whitespace-nowrap shrink-0 shadow-lg shadow-orange-500/20">
              Start recovering <ArrowRight size={14} strokeWidth={2} />
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* ═══════ 4. DARK ZONE — FEATURES BENTO ═══════ */}
      <div ref={featuresRef} id="features" className="relative">
        <img
          src="https://images.unsplash.com/photo-1611661490749-3940b8f3f9e4?w=1920&q=60&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] mix-blend-screen pointer-events-none"
        />
        <div className="px-6 py-32 md:py-40 relative z-10">
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
      <section className="px-6 py-24 md:py-32 ">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-extrabold tracking-[-0.03em] leading-[0.95] mb-12">
            Don&apos;t take our<br />word for it.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Big quote card */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:row-span-2">
              <BentoCard className="h-full flex flex-col justify-between min-h-[360px] relative overflow-hidden">
                <motion.span initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 0.06, y: 0 }} viewport={{ once: true }}
                  className="absolute -top-8 -left-3 text-[12rem] leading-none text-orange-500 select-none pointer-events-none">&ldquo;</motion.span>
                <div className="relative z-10">
                  <div className="flex gap-0.5 mb-6">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} strokeWidth={1.5} className="fill-orange-400 text-orange-400" />)}
                  </div>
                  <p className="text-[clamp(1.3rem,2.5vw,1.8rem)] leading-[1.35] tracking-tight mb-6">
                    &ldquo;{testimonials[0].quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-5 ">
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
                  <div className="flex items-center justify-between pt-4 ">
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

      {/* ═══════ CTA — after testimonials ═══════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <InlineCta
            headline="Join Jake, Priya, Marcus, and 4,200+ others."
            sub="Average user recovers $347 in their first month. What are you leaving on the table?"
            btnText="Claim my spot"
          />
        </div>
      </section>

      {/* ═══════ COMPETITOR COMPARISON ═══════ */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Why Pocketed</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-0.03em] leading-[0.95]">
              The others <span className="italic text-neutral-400">fell short.</span>
            </h2>
          </motion.div>

          <div className="space-y-3 mb-6">
            <CompetitorRow name="Earny" status="Shut down" note="Business model collapsed when retailers killed price protection" dead={true} delay={0} />
            <CompetitorRow name="Paribus" status="Absorbed" note="Now Capital One Shopping — restricted, not independent" dead={false} delay={0.06} />
            <CompetitorRow name="Rocket Money" status="$6-12/mo" note="Subscription tracking only. Doesn't file claims for you." dead={false} delay={0.12} />
            <CompetitorRow name="Settlemate" status="$11.99/mo" note="Class-action settlements only. No price drops or returns." dead={false} delay={0.18} />
          </div>

          {/* Pocketed highlight */}
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
            className="flex items-center gap-4 p-6 rounded-xl bg-orange-50 border-2 border-orange-200">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-orange-600">Pocketed</p>
              <p className="text-xs text-neutral-500 mt-0.5">All 6 recovery channels. You keep 100% of your money.</p>
            </div>
            <span className="text-sm font-extrabold text-green-600 bg-green-50 px-3 py-1.5 rounded-full shrink-0">$3.99/mo</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════ 6. PRICING ═══════ */}
      <section id="pricing" className="px-6 py-24 md:py-32 ">
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

      {/* ═══════ GUARANTEE BANNER ═══════ */}
      <section className="px-6 pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-green-200 bg-green-50/50 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Shield size={24} strokeWidth={1.5} className="text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-extrabold text-neutral-900 mb-1">60-day money-back guarantee</h3>
              <p className="text-sm text-neutral-500">If Pocketed doesn&apos;t recover more than your subscription cost, we refund every cent. No forms, no questions. You literally can&apos;t lose.</p>
            </div>
            <Magnetic href="#cta" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-green-500 transition-colors whitespace-nowrap shrink-0">
              Try Risk-Free <ArrowRight size={14} strokeWidth={2} />
            </Magnetic>
          </motion.div>
        </div>
      </section>

      {/* ═══════ 7. FAQ + CTA SPLIT ═══════ */}
      <section className="px-6 py-24 md:py-32 ">
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
          <p className="text-[11px] text-neutral-400">&copy; 2026 Pocketed. Made with frustration and a lot of receipts.</p>
        </div>
      </footer>
    </div>
  );
}
