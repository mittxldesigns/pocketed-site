'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion, useInView, useScroll, useTransform, useSpring, useMotionValue,
} from 'framer-motion';
import {
  TrendingDown, Clock, CreditCard, Shield, Truck, Wifi,
  ChevronDown, Star, ArrowUpRight, ArrowRight, Check,
  Menu, X, Zap, Mail, BarChart3, Sparkles,
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

/* ═══════════ MOUSE GRADIENT ═══════════ */
function MouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  useEffect(() => {
    const h = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, [x, y]);

  return (
    <motion.div className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: useTransform([x, y], ([lx, ly]: number[]) =>
          `radial-gradient(500px circle at ${lx}px ${ly}px, rgba(249,115,22,0.04), transparent 50%)`
        ),
      }}
    />
  );
}

/* ═══════════ COIN RAIN (no emojis — uses Sparkles icon) ═══════════ */
function CoinRain({ active, onDone }: { active: boolean; onDone: () => void }) {
  useEffect(() => { if (active) { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); } }, [active, onDone]);
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div key={i}
          initial={{ y: -30, x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200), opacity: 0.7 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 30, opacity: [0.7, 0.7, 0] }}
          transition={{ duration: 1.6 + Math.random(), delay: Math.random() * 0.5, ease: 'easeIn' }}
          className="absolute"
        >
          <Sparkles size={14 + Math.random() * 10} className="text-orange-400" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════ SCROLL TEXT HIGHLIGHT ═══════════ */
function ScrollHighlight({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.3'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className="text-[clamp(1.4rem,3.2vw,2.5rem)] font-semibold leading-[1.4] tracking-tight">
      {words.map((word, i) => {
        const s = i / words.length, e = s + 1 / words.length;
        return <ScrollWord key={i} word={word} progress={scrollYProgress} start={s} end={e} />;
      })}
    </p>
  );
}

function ScrollWord({ word, progress, start, end }: {
  word: string; progress: ReturnType<typeof useScroll>['scrollYProgress']; start: number; end: number;
}) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  return <motion.span style={{ opacity }} className="text-neutral-900 inline-block mr-[0.3em]">{word}</motion.span>;
}

/* ═══════════ 3D TILT ═══════════ */
function Tilt({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sy = useSpring(ry, { stiffness: 200, damping: 20 });
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 6);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 6);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 800 }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════ MAGNETIC BUTTON ═══════════ */
function Magnetic({ children, href, className = '' }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 15 });
  const sy = useSpring(my, { stiffness: 300, damping: 15 });
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.12);
    my.set((e.clientY - r.top - r.height / 2) * 0.12);
  };
  const onLeave = () => { mx.set(0); my.set(0); };
  return (
    <motion.a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ x: sx, y: sy }} className={className}>{children}</motion.a>
  );
}

/* ═══════════ COUNTER ═══════════ */
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
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

/* ═══════════ ACCORDION ═══════════ */
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

/* ═══════════ NAV ═══════════ */
function Nav({ onLogoClick, isDark }: { onLogoClick: () => void; isDark: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? isDark
          ? 'bg-neutral-950/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]'
          : 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)]'
        : ''
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onLogoClick} className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-2xl bg-orange-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-orange-500/25 transition-shadow">
            <span className="font-extrabold text-sm text-white">P</span>
          </motion.div>
          <span className={`font-extrabold text-[15px] transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}>Pocketed</span>
        </button>
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

/* ═══════════ SCROLL PROGRESS ═══════════ */
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 origin-left z-[60]" style={{ scaleX }} />;
}

/* ═══════════ PAGE-LEVEL BG TRANSITION ═══════════
 * Instead of per-section bg changes, this hook watches dark zone refs
 * and returns a framer-motion backgroundColor value that applies to
 * the ROOT wrapper — so the entire viewport changes color.
 */
function usePageBg(darkRefs: React.RefObject<HTMLDivElement | null>[]) {
  const [bg, setBg] = useState('#ffffff');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => {
      let closestDarkness = 0; // 0 = fully light, 1 = fully dark

      darkRefs.forEach((ref) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const vh = window.innerHeight;

        // How much of the viewport is this dark section covering?
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(vh, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const coverage = visibleHeight / vh;

        // Also factor in how far the section has entered
        // When top is at bottom of viewport → 0
        // When top is at top of viewport → 1
        const entry = 1 - Math.max(0, Math.min(1, rect.top / vh));

        const darkness = Math.min(coverage * 1.5, 1) * Math.min(entry * 2, 1);
        closestDarkness = Math.max(closestDarkness, darkness);
      });

      // Interpolate between white and dark
      const r = Math.round(255 - closestDarkness * 245); // 255 → 10
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

/* ═══════════ MAIN ═══════════ */
export default function Home() {
  const [coinRain, setCoinRain] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const { bg: pageBg, isDark } = usePageBg([featuresRef]);
  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroO = useTransform(heroP, [0, 0.7], [1, 0]);
  const heroY = useTransform(heroP, [0, 0.7], [0, 50]);

  const features = [
    { icon: TrendingDown, title: 'Price Drop Recovery', desc: 'Prices fall after you buy. We file the claim.', stat: '$23 avg' },
    { icon: Clock, title: 'Return Deadline Alerts', desc: 'Get nudged before your return window closes.', stat: 'Never miss' },
    { icon: CreditCard, title: 'Subscription Audit', desc: "Find charges you forgot. See what's draining you.", stat: '$94/mo' },
    { icon: Shield, title: 'Warranty Tracker', desc: 'Every warranty organized by expiry. Never lose one.', stat: '200+ brands' },
    { icon: Truck, title: 'Late Delivery Credits', desc: "If they're late, you're owed money. Auto-filed.", stat: 'Automatic' },
    { icon: Wifi, title: 'Outage Credits', desc: 'ISP went down? We calculate your prorated credit.', stat: '40+ ISPs' },
  ];

  const testimonials = [
    { name: 'Jake M.', loc: 'Austin, TX', amount: '$347', quote: 'Found $347 in price drops I had no idea about.' },
    { name: 'Priya S.', loc: 'Seattle, WA', amount: '$41/mo', quote: "Three streaming services I hadn't opened in months." },
    { name: 'Marcus T.', loc: 'Chicago, IL', amount: '$1,200', quote: 'Laptop warranty expiring — got a full replacement.' },
    { name: 'Sarah K.', loc: 'Denver, CO', amount: '$89', quote: 'Late Amazon deliveries I never thought to claim.' },
    { name: 'David L.', loc: 'NYC, NY', amount: '$156', quote: 'ISP outage credits I had no clue existed.' },
  ];

  const faqItems = [
    { q: 'Is my email data safe?', a: 'Bank-level encryption. We never store emails. OAuth only — we never see your password.' },
    { q: 'How does Pocketed make money?', a: 'Monthly subscription. No percentage cuts. You keep 100% of recovered money.' },
    { q: "What if I don't recover enough?", a: '60-day money-back guarantee. If you don\'t recover $3.99 in value, full refund.' },
    { q: 'Which stores do you support?', a: '200+ retailers: Amazon, Target, Best Buy, Walmart, plus streaming and ISPs.' },
    { q: 'Do you file claims for me?', a: 'Yes — Pro and Family plans auto-file price drop claims and handle retailer interactions.' },
  ];

  const handleDone = useCallback(() => setCoinRain(false), []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: pageBg, transition: 'color 0.3s', color: isDark ? '#ffffff' : '#0a0a0a' }}>
      <MouseGlow />
      <CoinRain active={coinRain} onDone={handleDone} />
      <ScrollBar />
      <Nav onLogoClick={() => setCoinRain(true)} isDark={isDark} />

      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <motion.div style={{ opacity: heroO, y: heroY }} className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-200 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-semibold text-orange-700">Now accepting early access</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.025em] text-neutral-900 mb-5">
                Companies owe you money.{' '}
                <span className="text-orange-500">We get it back.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                className="text-base text-neutral-500 max-w-md mb-8 leading-relaxed">
                Pocketed scans your purchases, finds what you&apos;re owed, and recovers the cash — automatically.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}
                className="flex flex-wrap items-center gap-4 mb-8">
                <Magnetic href="#cta" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-neutral-800 transition-colors hover:shadow-lg hover:shadow-neutral-900/15">
                  Get Early Access <ArrowRight size={14} strokeWidth={2} />
                </Magnetic>
                <a href="#how" className="text-neutral-500 hover:text-neutral-900 text-sm font-medium transition-colors flex items-center gap-1.5 group">
                  See how it works
                  <ArrowUpRight size={13} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}
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

            {/* Dashboard mockup */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Tilt className="cursor-default">
                <div className={`${brand.card} ${brand.radius} p-5 md:p-6 shadow-xl shadow-neutral-200/50`}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`${brand.iconBox} bg-orange-500`}>
                        <Zap size={16} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">Total Recovered</p>
                        <p className="text-[11px] text-neutral-400">Last 30 days</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-2xl bg-emerald-50 text-emerald-600 text-[11px] font-bold">+12%</span>
                  </div>
                  <p className="text-4xl font-extrabold text-neutral-900 mb-5">$<Counter value={347} /><span className="text-neutral-300">.00</span></p>
                  <div className="flex items-end gap-1 h-14 mb-5">
                    {[35, 50, 30, 65, 45, 80, 55, 90, 40, 70, 60, 95].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                        transition={{ duration: 0.4, delay: 0.5 + i * 0.04, type: 'spring', bounce: 0.25 }}
                        className="flex-1 rounded-sm bg-orange-500/80 hover:bg-orange-500 transition-colors cursor-default"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Price drops', val: '$178', icon: TrendingDown, color: 'text-orange-500 bg-orange-50' },
                      { label: 'Subscriptions', val: '$94', icon: CreditCard, color: 'text-neutral-600 bg-neutral-100' },
                      { label: 'Returns', val: '$75', icon: Clock, color: 'text-neutral-600 bg-neutral-100' },
                      { label: 'Warranties', val: '3 active', icon: Shield, color: 'text-neutral-600 bg-neutral-100' },
                    ].map((m, i) => (
                      <motion.div key={i} whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400 }}
                        className={`bg-neutral-50 ${brand.radius} p-3.5 border border-neutral-100 cursor-default`}>
                        <div className={`${brand.iconBox} ${m.color} mb-2 !w-7 !h-7`}>
                          <m.icon size={13} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold text-neutral-900">{m.val}</p>
                        <p className="text-[11px] text-neutral-400">{m.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>

          {/* Store logos */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-16 pt-10 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400 text-center mb-5 font-medium uppercase tracking-wider">Works with your favorite stores</p>
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap opacity-30 hover:opacity-50 transition-opacity duration-700">
              {['Amazon', 'Target', 'Best Buy', 'Walmart', 'Apple', 'Nike'].map(name => (
                <span key={name} className="text-sm font-bold text-neutral-900">{name}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════ PROBLEM — scroll highlight ══════ */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-8">The problem</p>
          <ScrollHighlight text="Every year, $48 billion goes unclaimed by consumers. Price drops you miss. Returns you forget. Subscriptions bleeding you dry. Warranties expiring in silence. You're losing money you don't even know about — and companies are counting on it." />
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="py-16 px-6 border-y border-neutral-100">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { val: 48, pre: '$', suf: 'B+', label: 'Left unclaimed annually' },
            { val: 200, suf: '+', label: 'Retailers tracked' },
            { val: 347, pre: '$', label: 'Avg. recovered per user' },
            { val: 3, label: 'Minutes to first alert' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.06 }} className="text-center">
              <p className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-1">
                {i === 3 ? '< 3 min' : <Counter value={s.val} prefix={s.pre} suffix={s.suf} />}
              </p>
              <p className="text-xs text-neutral-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS — on-brand cards ══════ */}
      <section id="how" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Connect your email', desc: 'Link Gmail or Outlook securely via OAuth. We only scan receipts — never personal emails.', icon: Mail },
              { num: '02', title: "We find what you're owed", desc: 'AI scans 200+ retailers, tracks price drops, flags returns, audits subscriptions.', icon: BarChart3 },
              { num: '03', title: 'Get your money back', desc: 'We auto-file claims or guide you through it. You keep 100% of every dollar.', icon: Zap },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                <Tilt className={`${brand.card} ${brand.radius} p-8 h-full cursor-default group hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-300 transition-all duration-300`}>
                  <div className={`${brand.iconBox} bg-neutral-100 group-hover:bg-orange-50 transition-colors mb-6`}>
                    <s.icon size={18} strokeWidth={1.5} className="text-neutral-600 group-hover:text-orange-500 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-300 tracking-widest block mb-3">STEP {s.num}</span>
                  <h3 className="text-lg font-extrabold text-neutral-900 mb-3">{s.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                </Tilt>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FEATURES — dark zone (ref triggers page bg change) ══════ */}
      <div ref={featuresRef} id="features">
        <div className="py-32 md:py-40 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
              <p className="text-xs font-bold tracking-widest uppercase text-orange-400 mb-3">Recovery channels</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight max-w-xl">
                Six ways we put money back in your pocket.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                    <Tilt className={`group ${brand.cardDark} ${brand.radius} p-6 hover:bg-white/[0.08] hover:border-orange-500/15 transition-all duration-300 cursor-default h-full`}>
                      <div className="flex items-start justify-between mb-6">
                        <div className={`${brand.iconBox} bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors`}>
                          <Icon size={18} strokeWidth={1.5} className="text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-600 bg-white/5 px-2 py-1 rounded-2xl border border-white/10">{f.stat}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">{f.title}</h3>
                      <p className="text-[13px] text-neutral-500 leading-relaxed">{f.desc}</p>
                    </Tilt>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ══════ TESTIMONIALS ══════ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto mb-12">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight text-center">
            Real people. <span className="text-neutral-400">Real money recovered.</span>
          </motion.h2>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <motion.div animate={{ x: [0, -1400] }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="flex gap-4 w-max">
            {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400 }}
                className={`w-[300px] shrink-0 ${brand.card} ${brand.radius} p-5 cursor-default hover:shadow-md hover:border-neutral-300 transition-all`}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={11} strokeWidth={1.5} className="fill-orange-400 text-orange-400" />)}
                </div>
                <p className="text-sm text-neutral-700 mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                    <p className="text-[11px] text-neutral-400">{t.loc}</p>
                  </div>
                  <span className="text-lg font-extrabold text-orange-500">{t.amount}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="pricing" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">Simple, honest pricing</h2>
            <p className="text-neutral-500 text-sm">No percentage cuts. You keep everything.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', desc: 'Track your first wins', features: ['Track up to 5 items', "See what you're owed", 'File claims yourself', 'Email support'], pop: false },
              { name: 'Pro', price: '$3.99', desc: 'Maximize recovery', features: ['Unlimited items', 'Auto-filing for price drops', 'All 6 recovery channels', 'Priority alerts', '60-day guarantee'], pop: true },
              { name: 'Family', price: '$6.99', desc: 'The whole family', features: ['Up to 5 accounts', 'Shared dashboard', 'Warranty vault', 'Everything in Pro'], pop: false },
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

      {/* ══════ FAQ ══════ */}
      <section id="faq" className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-orange-500 mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Questions? <span className="text-neutral-400">Answers.</span>
            </h2>
          </motion.div>
          {faqItems.map((item, i) => <Accordion key={i} q={item.q} a={item.a} />)}
        </div>
      </section>

      {/* ══════ CTA — scroll-driven dark zone ══════ */}
      <div id="cta" className="bg-neutral-950 text-white">
        <div className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[30vh] bg-orange-500/[0.08] rounded-full blur-[100px]" />
          </div>
          <div className="max-w-xl mx-auto text-center relative z-10">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Stop leaving money on the table.
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-neutral-500 mb-8">Join 4,200+ people getting back what&apos;s theirs.</motion.p>
            <motion.form initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input type="email" placeholder="you@email.com" required
                className={`flex-1 px-4 py-3 ${brand.radius} bg-white/10 border border-white/10 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all`} />
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit"
                className={`px-6 py-3 bg-orange-500 text-white ${brand.radius} font-semibold text-sm hover:bg-orange-400 transition-colors whitespace-nowrap`}>
                Get Access
              </motion.button>
            </motion.form>
            <p className="mt-4 text-xs text-neutral-700">Free to join. No credit card required.</p>
          </div>
        </div>
      </div>

      {/* ══════ FOOTER ══════ */}
      <footer className="bg-neutral-950 border-t border-white/5 py-12 px-6">
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
