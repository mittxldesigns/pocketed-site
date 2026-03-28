'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'framer-motion';
import {
  TrendingDown,
  Clock,
  CreditCard,
  Shield,
  Truck,
  Wifi,
  ChevronDown,
  ArrowRight,
  Check,
  Mail,
  Zap,
  Eye,
  X,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// ANIMATED NUMBER (counts up when in view)
// ============================================================================
function AnimatedNumber({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================================================
// ACCORDION FAQ
// ============================================================================
function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.08] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-6 group"
      >
        <h3 className="font-sans text-lg font-semibold text-white group-hover:text-amber-400 transition-colors pr-4">
          {question}
        </h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={18} className="text-stone-400 flex-shrink-0" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-stone-400 font-sans leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
}

// ============================================================================
// WAITLIST FORM
// ============================================================================
function WaitlistForm({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setEmail('');
          setSubmitted(false);
        }, 4000);
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === 'dark';

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold ${
          isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}
      >
        <Check size={16} />
        You're on the list. We'll be in touch.
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="flex-1 relative">
          <Mail
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}
            size={18}
          />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            className={`w-full pl-11 pr-4 py-3.5 rounded-xl font-sans text-sm transition-all outline-none disabled:opacity-50 ${
              isDark
                ? 'bg-white/5 border border-white/10 text-white placeholder-stone-500 focus:border-amber-500/50 focus:bg-white/[0.07]'
                : 'bg-white border border-stone-200 text-stone-950 placeholder-stone-400 focus:border-amber-500 focus:shadow-sm'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 rounded-xl font-semibold font-sans text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30"
        >
          {loading ? 'Joining...' : 'Get Early Access'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm mt-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// FLOATING DASHBOARD MOCKUP (hero right side)
// ============================================================================
function DashboardMockup() {
  const items = [
    { label: 'Amazon — Price Drop', amount: '+$23.47', time: '2h ago', color: 'text-emerald-400' },
    { label: 'Netflix — Unused Sub', amount: '+$15.99/mo', time: '1d ago', color: 'text-amber-400' },
    { label: 'Best Buy — Warranty Claim', amount: '+$189.00', time: '3d ago', color: 'text-emerald-400' },
    { label: 'FedEx — Late Delivery', amount: '+$12.50', time: '5d ago', color: 'text-emerald-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-10 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative bg-stone-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="font-sans font-bold text-stone-950 text-xs">P</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">This Month</p>
              <p className="text-stone-500 text-xs">March 2026</p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            +12 recoveries
          </span>
        </div>

        {/* Total */}
        <div className="mb-6">
          <p className="text-stone-500 text-xs mb-1 font-medium">Total Recovered</p>
          <p className="text-3xl font-bold text-white">
            $<AnimatedNumber value={847} duration={2.5} />
            <span className="text-stone-500 text-lg">.23</span>
          </p>
          <div className="mt-3 w-full bg-stone-800 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            />
          </div>
        </div>

        {/* Recovery items */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.15 }}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-stone-500 text-xs">{item.time}</p>
              </div>
              <span className={`text-sm font-semibold ${item.color}`}>{item.amount}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// NAV
// ============================================================================
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-stone-950/80 backdrop-blur-xl border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="font-sans font-bold text-stone-950 text-sm">P</span>
            </div>
            <span className="font-sans font-bold text-white text-lg">Pocketed</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-stone-400 hover:text-white transition-colors font-sans text-sm">
              How it Works
            </a>
            <a href="#features" className="text-stone-400 hover:text-white transition-colors font-sans text-sm">
              Features
            </a>
            <a href="#pricing" className="text-stone-400 hover:text-white transition-colors font-sans text-sm">
              Pricing
            </a>
            <a href="#faq" className="text-stone-400 hover:text-white transition-colors font-sans text-sm">
              FAQ
            </a>
          </div>

          <a
            href="#waitlist"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg font-semibold font-sans text-sm transition-all"
          >
            Join Waitlist
          </a>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// SECTION REVEAL WRAPPER
// ============================================================================
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function Home() {
  const features = [
    {
      icon: TrendingDown,
      title: 'Price Drop Recovery',
      description: 'We monitor every purchase. When prices fall within the store\'s adjustment window, we file the claim automatically.',
      stat: 'Avg $23 per claim',
      large: true,
    },
    {
      icon: CreditCard,
      title: 'Subscription Audit',
      description: 'Spot recurring charges you forgot about. See what you actually use vs. what\'s silently draining your wallet.',
      stat: 'Avg $94/mo found',
      large: true,
    },
    {
      icon: Clock,
      title: 'Return Deadline Alerts',
      description: 'Policies from 200+ retailers. Get alerts 7, 3, and 1 day before your return window closes.',
      stat: 'Never miss a return',
    },
    {
      icon: Shield,
      title: 'Warranty Tracker',
      description: 'Every warranty, extracted and organized by expiry. Pre-fills claim forms when something breaks.',
      stat: '200+ brands tracked',
    },
    {
      icon: Truck,
      title: 'Late Delivery Credits',
      description: 'Amazon Prime, FedEx Express, UPS guarantees — if they\'re late, you\'re owed money.',
      stat: 'Auto-filed claims',
    },
    {
      icon: Wifi,
      title: 'Outage Credits',
      description: 'ISP went down? Streaming service had issues? We calculate and help you claim your prorated credit.',
      stat: '40+ providers',
    },
  ];

  const competitors = [
    { name: 'Earny', status: 'Shut down', note: 'Business model collapsed when retailers killed price protection' },
    { name: 'Paribus', status: 'Absorbed', note: 'Now Capital One Shopping — restricted, not independent' },
    { name: 'Rocket Money', status: '$6-12/mo', note: 'Subscription tracking only. Doesn\'t file claims for you.' },
    { name: 'Settlemate', status: '$11.99/mo', note: 'Class-action settlements only. No price drops or returns.' },
  ];

  const faqItems = [
    {
      question: 'Is my email data safe?',
      answer: 'We use bank-level encryption and never store your emails. We scan for receipt-related data only and use OAuth — your credentials never touch our servers.',
    },
    {
      question: 'How does Pocketed make money?',
      answer: 'Simple flat subscription. No percentage cuts of your refunds, no hidden fees. You keep 100% of every dollar recovered. We\'re incentivized to get you as much as possible.',
    },
    {
      question: 'What if I don\'t recover enough to justify the cost?',
      answer: '60-day money-back guarantee on Pro. We\'re confident you\'ll recover at least $3.99 in two months — the average user finds $347+ in their first scan.',
    },
    {
      question: 'Which stores do you support?',
      answer: 'Over 200 US retailers including Amazon, Target, Best Buy, Walmart, plus streaming services, ISPs, and carriers. Our database grows every week.',
    },
    {
      question: 'Do you actually file claims for me?',
      answer: 'With Pro and Family plans, yes — we auto-file price drop claims and handle most retailer interactions. For other types, we generate pre-written scripts and walk you through it.',
    },
    {
      question: 'What happened to other refund apps like Earny?',
      answer: 'Most either shut down (Earny), got acquired and restricted (Paribus to Capital One), or only cover one category. Pocketed is the only all-in-one recovery tool at an affordable price.',
    },
  ];

  const testimonials = [
    {
      name: 'Jake M.',
      role: 'Software Engineer',
      location: 'Austin, TX',
      amount: '$347',
      quote: 'Found $347 in price drops I had no idea about. This thing paid for itself in the first week.',
    },
    {
      name: 'Priya S.',
      role: 'Product Manager',
      location: 'Seattle, WA',
      amount: '$41/mo',
      quote: 'I was paying for three streaming services I hadn\'t opened in months. Pocketed flagged all of them.',
    },
    {
      name: 'Marcus T.',
      role: 'Freelance Designer',
      location: 'Chicago, IL',
      amount: '$1,200',
      quote: 'My laptop warranty was about to expire and I had a dead pixel. Got a full replacement worth $1,200.',
    },
  ];

  return (
    <div className="bg-stone-950 min-h-screen overflow-hidden">
      <Nav />

      {/* ================================================================== */}
      {/* HERO */}
      {/* ================================================================== */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-950 to-stone-900" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Copy */}
            <div>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-amber-300">
                    Early access — now open
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-sans text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-6"
              >
                Companies owe
                <br />
                you money.
                <br />
                <span className="text-amber-400">We get it back.</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="font-sans text-lg text-stone-400 max-w-lg mb-10 leading-relaxed"
              >
                Pocketed connects to your email, finds price drops, missed returns,
                forgotten subscriptions, and expiring warranties — then recovers the cash.
              </motion.p>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                id="waitlist"
              >
                <WaitlistForm variant="dark" />
              </motion.div>

              {/* Trust line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-5 text-stone-500 text-sm font-sans"
              >
                Free to join. No credit card required.
              </motion.p>
            </div>

            {/* Right — Dashboard */}
            <div className="hidden lg:flex justify-end">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* LOGO BAR — retailers tracked */}
      {/* ================================================================== */}
      <section className="border-y border-white/5 bg-stone-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-stone-500 text-xs font-semibold uppercase tracking-widest mb-6">
            Tracking policies from 200+ retailers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['Amazon', 'Target', 'Best Buy', 'Walmart', 'Apple', 'Nike', 'Home Depot', 'Costco', 'Nordstrom', 'Sephora'].map(
              (name) => (
                <span key={name} className="text-stone-600 font-sans font-semibold text-sm tracking-wide">
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* STATS */}
      {/* ================================================================== */}
      <section className="bg-stone-950 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: 48, prefix: '$', suffix: 'B+', label: 'Left on the table annually by US consumers' },
              { value: 200, suffix: '+', label: 'Retailer policies tracked and updated weekly' },
              { value: 347, prefix: '$', label: 'Average recovered per user in first scan' },
              { value: 6, label: 'Recovery channels working for you simultaneously' },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="text-center">
                  <p className="font-sans text-4xl md:text-5xl font-extrabold text-white mb-2">
                    <AnimatedNumber value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                  </p>
                  <p className="font-sans text-stone-500 text-sm">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* HOW IT WORKS */}
      {/* ================================================================== */}
      <section id="how" className="bg-stone-900/50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="font-sans text-sm font-semibold text-amber-400 mb-3 uppercase tracking-widest">
                How it works
              </p>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Three steps. Real money back.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                icon: Mail,
                title: 'Connect your email',
                desc: 'Securely link Gmail or Outlook with OAuth. We only scan receipts — never personal emails. Your credentials never touch our servers.',
              },
              {
                num: '02',
                icon: Eye,
                title: 'We scan for money owed',
                desc: 'Our AI parses purchases, tracks price drops, flags expiring returns, audits subscriptions, and checks warranties — all automatically.',
              },
              {
                num: '03',
                icon: Zap,
                title: 'Cash comes back to you',
                desc: 'We auto-file claims or give you pre-written scripts. You keep 100% of every dollar recovered. No percentage cuts, ever.',
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-300 h-full">
                  {/* Number */}
                  <span className="font-sans text-5xl font-extrabold text-white/[0.04] absolute top-6 right-6">
                    {step.num}
                  </span>

                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:bg-amber-500/15 transition-colors">
                    <step.icon size={22} className="text-amber-400" />
                  </div>

                  <h3 className="font-sans text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="font-sans text-stone-400 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FEATURES — BENTO GRID */}
      {/* ================================================================== */}
      <section id="features" className="bg-stone-950 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="font-sans text-sm font-semibold text-amber-400 mb-3 uppercase tracking-widest">
                Recovery channels
              </p>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Six ways we put money
                <br />
                back in your pocket
              </h2>
            </div>
          </Reveal>

          {/* Bento layout: 2 large on top, 4 small below */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {features
              .filter((f) => f.large)
              .map((f, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-10 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                        <f.icon size={22} className="text-amber-400" />
                      </div>
                      <span className="text-xs font-semibold text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                        {f.stat}
                      </span>
                    </div>
                    <h3 className="font-sans text-2xl font-bold text-white mb-3">{f.title}</h3>
                    <p className="font-sans text-stone-400 leading-relaxed text-lg">{f.description}</p>
                  </div>
                </Reveal>
              ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features
              .filter((f) => !f.large)
              .map((f, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 h-full">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/15 transition-colors">
                      <f.icon size={18} className="text-amber-400" />
                    </div>
                    <h3 className="font-sans text-base font-bold text-white mb-2">{f.title}</h3>
                    <p className="font-sans text-stone-500 text-sm leading-relaxed">{f.description}</p>
                    <p className="mt-3 text-xs font-semibold text-amber-400/70">{f.stat}</p>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* COMPARISON — vs competitors */}
      {/* ================================================================== */}
      <section className="bg-stone-900/50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="font-sans text-sm font-semibold text-amber-400 mb-3 uppercase tracking-widest">
                Why Pocketed
              </p>
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                The others fell short.
                <br />
                We built what they couldn't.
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 px-6 py-4 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="font-sans text-sm font-semibold text-stone-400">Service</span>
                <span className="font-sans text-sm font-semibold text-stone-400">Status</span>
                <span className="font-sans text-sm font-semibold text-stone-400">Limitation</span>
              </div>

              {competitors.map((c, i) => (
                <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-white/[0.04] last:border-0 items-center">
                  <span className="font-sans text-sm font-medium text-stone-300">{c.name}</span>
                  <span className={`font-sans text-sm font-semibold ${
                    c.status === 'Shut down' ? 'text-red-400' : c.status === 'Absorbed' ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {c.status}
                  </span>
                  <span className="font-sans text-sm text-stone-500">{c.note}</span>
                </div>
              ))}

              {/* Pocketed row */}
              <div className="grid grid-cols-3 px-6 py-5 bg-amber-500/[0.05] border-t border-amber-500/20 items-center">
                <span className="font-sans text-sm font-bold text-amber-400">Pocketed</span>
                <span className="font-sans text-sm font-bold text-emerald-400">$3.99/mo</span>
                <span className="font-sans text-sm font-semibold text-white">All 6 channels. 100% of your money.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TESTIMONIALS */}
      {/* ================================================================== */}
      <section className="bg-stone-950 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Real people. Real money back.
              </h2>
              <p className="mt-4 text-stone-500 font-sans text-lg">From our beta testers</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.05] transition-all duration-300 h-full flex flex-col">
                  {/* Amount badge */}
                  <div className="mb-6">
                    <span className="text-2xl font-extrabold text-amber-400">{t.amount}</span>
                    <span className="text-stone-500 text-sm ml-2">recovered</span>
                  </div>

                  <p className="font-sans text-stone-300 leading-relaxed mb-8 flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-6 border-t border-white/[0.06]">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <span className="font-sans font-bold text-stone-950 text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-sans font-semibold text-white text-sm">{t.name}</p>
                      <p className="font-sans text-stone-500 text-xs">
                        {t.role} — {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRICING */}
      {/* ================================================================== */}
      <section id="pricing" className="bg-stone-900/50 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Simple, honest pricing
              </h2>
              <p className="font-sans text-lg text-stone-400 max-w-2xl mx-auto">
                No percentage of your refunds. No hidden fees. Keep 100% of everything we recover.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: '/forever',
                desc: 'See what you\'re owed',
                features: ['Track up to 5 items', 'See recovery opportunities', 'File claims yourself', 'Email support'],
                cta: 'Start Free',
                popular: false,
              },
              {
                name: 'Pro',
                price: '$3.99',
                period: '/mo',
                desc: 'Maximize your recovery',
                features: [
                  'Unlimited items',
                  'Auto-filing for price drops',
                  'All 6 recovery channels',
                  'Priority alerts',
                  '60-day money-back guarantee',
                ],
                cta: 'Join Waitlist',
                popular: true,
              },
              {
                name: 'Family',
                price: '$6.99',
                period: '/mo',
                desc: 'Recover for everyone',
                features: ['Up to 5 email accounts', 'Shared dashboard', 'Family warranty vault', 'Everything in Pro'],
                cta: 'Join Waitlist',
                popular: false,
              },
            ].map((plan, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div
                  className={`relative rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col ${
                    plan.popular
                      ? 'bg-amber-500/[0.06] border-amber-500/30 shadow-lg shadow-amber-500/5'
                      : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-amber-500 text-stone-950 text-xs font-bold rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="font-sans text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-stone-500 font-sans text-sm mb-5">{plan.desc}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-sans text-4xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-stone-500 font-sans text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <a
                    href="#waitlist"
                    className={`block w-full py-3 px-6 rounded-xl font-semibold font-sans text-sm text-center transition-all mb-8 ${
                      plan.popular
                        ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]'
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <div className="space-y-3.5 flex-1">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <Check size={16} className={plan.popular ? 'text-amber-400 mt-0.5' : 'text-stone-600 mt-0.5'} />
                        <span className="text-stone-400 font-sans text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FAQ */}
      {/* ================================================================== */}
      <section id="faq" className="bg-stone-950 py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Questions? Answers.
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FINAL CTA */}
      {/* ================================================================== */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/[0.04] rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Reveal>
            <h2 className="font-sans text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
              Stop leaving money
              <br />
              on the table.
            </h2>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="font-sans text-lg text-stone-400 mb-10 max-w-xl mx-auto">
              The average user finds $347 in their first scan. Join the waitlist and be the first to know when we launch.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex justify-center">
              <WaitlistForm variant="dark" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="border-t border-white/[0.05] bg-stone-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="font-sans font-bold text-stone-950 text-xs">P</span>
                </div>
                <span className="font-sans font-bold text-white">Pocketed</span>
              </div>
              <p className="text-stone-500 font-sans text-sm leading-relaxed">
                Get back what's rightfully yours. Built by Zamn Studios.
              </p>
            </div>

            {/* Links */}
            {[
              {
                heading: 'Product',
                links: [
                  { label: 'How it Works', href: '#how' },
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'FAQ', href: '#faq' },
                ],
              },
              {
                heading: 'Company',
                links: [
                  { label: 'About', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Contact', href: '#' },
                ],
              },
              {
                heading: 'Legal',
                links: [
                  { label: 'Privacy', href: '#' },
                  { label: 'Terms', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.heading}>
                <p className="font-semibold text-white mb-4 font-sans text-sm">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-stone-500 hover:text-white transition-colors font-sans text-sm">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-600 font-sans text-sm">
              Built by{' '}
              <a href="#" className="text-stone-500 hover:text-white transition-colors">
                Zamn Studios
              </a>
            </p>
            <p className="text-stone-600 font-sans text-sm">
              &copy; 2026 Pocketed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
