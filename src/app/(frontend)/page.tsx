'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import './styles.css'

/* ============================================================
   Content Map — all bilingual copy lives here
   ============================================================ */
type Lang = 'ar' | 'en'

const content: Record<Lang, Record<string, any>> = {
  ar: {
    nav: { logo: 'رفيق', features: 'المميزات', about: 'لماذا رفيق؟' },
    hero: {
      tagline: 'خلي صفحة التبويب الجديدة في كروم بسيطة ومفيدة',
      cta: 'أضف رفيق إلى Chrome مجانًا',
      trust: '✓ مجاني تمامًا · خفيف · بدون فوضى',
    },
    problem: {
      heading: 'لأن كل تبويبة جديدة\nتستحق لحظة هدوء',
      p1: 'في كل مرة تفتح تبويبة جديدة، تُقابَل بعشرات الأخبار المزعجة والإعلانات التي لا تهمك. تفقد تركيزك قبل أن تبدأ حتى.',
      p2: 'تبويباتك مبعثرة، مهامك ضائعة، ولا يوجد مكان واحد يمنحك الوضوح. كل شيء يتنافس على انتباهك.',
      p3: 'أنت تستحق بداية مختلفة — لحظة هدوء مع كل تبويبة جديدة، لا فوضى ولا تشتت.',
    },
    philosophy: {
      heading: 'لماذا صنعنا رفيق؟',
      sub: 'أربع قيم تقود كل قرار نأخذه.',
      items: [
        { icon: '⏳', title: 'نحترم وقتك', desc: 'لا شيء يُعرض إلا ما تحتاجه فعلاً.' },
        { icon: '🌍', title: 'نحترم لغتك', desc: 'مصمم بالعربية أولاً، ليس مجرد ترجمة.' },
        { icon: '🌙', title: 'نحترم إيقاعك', desc: 'تقويم هجري ومواقيت مدمجة في يومك.' },
        { icon: '🍃', title: 'هدوء رقمي', desc: 'تجربة هادئة بعيدة عن الضوضاء الرقمية.' },
      ],
    },
    features: {
      heading: 'كل ما تحتاجه في تبويبة واحدة',
      sub: 'أدوات بسيطة ومفيدة، مصممة بعناية.',
      items: [
        {
          image: '/calendar.png',
          title: 'التقويم الهجري والميلادي',
          desc: 'مع المناسبات والأعياد الإسلامية والوطنية.',
        },
        {
          image: '/search.png',
          title: 'بحث جوجل + اختصارات',
          desc: 'ابحث مباشرة أو انتقل لمواقعك المفضلة بسرعة.',
        },
        {
          image: '/ai.png',
          title: 'مساعد ذكاء اصطناعي مجاني',
          desc: 'دردش، اسأل، واحصل على إجابات فورية.',
        },
        {
          image: '/theme.png',
          title: 'ثيمات وخلفيات مخصصة',
          desc: 'اختر من مجموعة خلفيات هادئة وأنيقة.',
        },
        { image: '/weather.png', title: 'حالة الطقس', desc: 'اعرف طقس مدينتك بنظرة سريعة.' },
        {
          image: '/clock.png',
          title: 'ساعة عالمية',
          desc: 'تابع التوقيت في مدن مختلفة حول العالم.',
        },
        { image: '/lang.png', title: 'عربي وإنجليزي', desc: 'واجهة كاملة بلغتين مع دعم RTL.' },
      ],
    },
    preview: {
      heading: 'تصميم نظيف، تجربة سلسة',
      sub: 'واجهة بسيطة تتيح لك التركيز على ما يهم.',
      screenshot: 'معاينة المنتج الكاملة',
    },
    socialProof: {
      heading: 'ماذا يقول مستخدمونا؟',
      quotes: [
        {
          text: 'رفيق غيّر طريقة استخدامي للمتصفح. أخيرًا شعرت بالراحة عند فتح تبويبة جديدة.',
          author: 'أحمد م.',
        },
        {
          text: 'التقويم الهجري مع الأذكار والمناسبات — بالضبط ما كنت أبحث عنه.',
          author: 'نورة ع.',
        },
        { text: 'بسيط وهادئ. لا أخبار مزعجة ولا إعلانات. مجرد أدوات أحتاجها.', author: 'خالد ر.' },
      ],
      badge: '🕌 مصمم للمستخدم العربي',
      stats: [
        { number: '+5,000', label: 'مستخدم نشط' },
        { number: '4.8', label: 'تقييم المستخدمين' },
        { number: '15+', label: 'ثيم متاح' },
      ],
    },
    objection: {
      heading: 'لماذا رفيق وليس غيره؟',
      items: [
        { good: 'بسيط وهادئ', bad: 'لوحات مزدحمة ومشتتة', vs: 'بدلاً من' },
        { good: 'مصمم للعرب', bad: 'أدوات عامة بلا هوية', vs: 'بدلاً من' },
        { good: 'مجاني بالكامل', bad: 'بدائل مدفوعة ومعقدة', vs: 'بدلاً من' },
      ],
    },
    identity: {
      heading: 'ليس مجرد إضافة، بل أسلوب حياة',
      items: [
        { emoji: '🎯', title: 'تركيز', desc: 'كل تبويبة جديدة هي فرصة للوضوح.' },
        { emoji: '🧭', title: 'تصفح واعٍ', desc: 'لا تنجرف — افتح متصفحك بنية واضحة.' },
        { emoji: '🍵', title: 'هدوء رقمي', desc: 'بداية هادئة لكل جلسة تصفح.' },
        { emoji: '💎', title: 'وضوح يومي', desc: 'أدواتك ومهامك أمامك دائمًا.' },
      ],
    },
    finalCta: {
      heading: 'ابدأ تجربة تصفح مختلفة',
      sub: 'حوّل تبويبتك الجديدة إلى مساحة هادئة وذكية.',
      cta: 'أضف رفيق إلى Chrome مجانًا',
      reassurance: 'مجاني · خفيف · بدون تسجيل · بدون إعلانات',
    },
    footer: {
      brand: 'رفيق',
      tagline: 'مصنوع بحب للمستخدم العربي ☕',
      privacy: 'سياسة الخصوصية',
      contact: 'تواصل معنا',
    },
  },

  en: {
    nav: { logo: 'Refiq', features: 'Features', about: 'Why Refiq?' },
    hero: {
      tagline: 'Make your Chrome new tab simple and useful',
      cta: 'Add Refiq to Chrome — Free',
      trust: '✓ Completely free · Lightweight · No clutter',
    },
    problem: {
      heading: 'Because every new tab\ndeserves a moment of calm',
      p1: "Every time you open a new tab, you're bombarded with irrelevant news and distracting ads. You lose focus before you even start.",
      p2: "Your tabs are scattered, your tasks are lost, and there's no single place that gives you clarity. Everything competes for your attention.",
      p3: 'You deserve a different start — a moment of calm with every new tab. No clutter, no distractions.',
    },
    philosophy: {
      heading: 'Why we built Refiq',
      sub: 'Four values guide every decision we make.',
      items: [
        {
          icon: '⏳',
          title: 'Respect your time',
          desc: 'Nothing is shown unless you truly need it.',
        },
        {
          icon: '🌍',
          title: 'Respect your language',
          desc: 'Built in Arabic first — not just a translation.',
        },
        {
          icon: '🌙',
          title: 'Respect your rhythm',
          desc: 'Hijri calendar and prayer times woven into your day.',
        },
        { icon: '🍃', title: 'Digital calm', desc: 'A quiet experience away from digital noise.' },
      ],
    },
    features: {
      heading: 'Everything you need in one tab',
      sub: 'Simple, useful tools — thoughtfully designed.',
      items: [
        {
          icon: '📅',
          title: 'Hijri & Gregorian calendar',
          desc: 'With Islamic holidays and national events.',
        },
        {
          icon: '🔍',
          title: 'Google Search + shortcuts',
          desc: 'Search directly or jump to your favorite sites instantly.',
        },
        {
          icon: '🤖',
          title: 'Free built-in AI chatbot',
          desc: 'Chat, ask questions, and get instant answers.',
        },
        {
          icon: '🎨',
          title: 'Custom themes & backgrounds',
          desc: 'Choose from a curated set of calm, elegant wallpapers.',
        },
        {
          icon: '🌤',
          title: 'Weather at a glance',
          desc: "See your city's weather in a single look.",
        },
        {
          icon: '🕐',
          title: 'World clock',
          desc: 'Track time across different cities around the globe.',
        },
        {
          icon: '🌐',
          title: 'Arabic & English',
          desc: 'Full bilingual interface with proper RTL support.',
        },
      ],
    },
    preview: {
      heading: 'Clean design, seamless experience',
      sub: 'A simple interface that lets you focus on what matters.',
      screenshot: 'Full product preview',
    },
    socialProof: {
      heading: 'What our users say',
      quotes: [
        {
          text: 'Refiq changed how I use my browser. I finally feel at peace when opening a new tab.',
          author: 'Ahmed M.',
        },
        {
          text: 'The Hijri calendar with daily reminders and events — exactly what I was looking for.',
          author: 'Noura A.',
        },
        {
          text: 'Simple and calm. No annoying news or ads. Just the tools I need.',
          author: 'Khaled R.',
        },
      ],
      badge: '🕌 Built for Arab users',
      stats: [
        { number: '5,000+', label: 'Active users' },
        { number: '4.8', label: 'User rating' },
        { number: '15+', label: 'Themes available' },
      ],
    },
    objection: {
      heading: 'Why Refiq over alternatives?',
      items: [
        { good: 'Minimal & calm', bad: 'Cluttered, noisy dashboards', vs: 'Instead of' },
        { good: 'Culturally aware', bad: 'Generic, one-size-fits-all tools', vs: 'Instead of' },
        { good: 'Completely free', bad: 'Expensive, complicated alternatives', vs: 'Instead of' },
      ],
    },
    identity: {
      heading: 'Not just an extension — a lifestyle',
      items: [
        { emoji: '🎯', title: 'Focus', desc: 'Every new tab is an opportunity for clarity.' },
        {
          emoji: '🧭',
          title: 'Intentional browsing',
          desc: "Don't drift — open your browser with purpose.",
        },
        {
          emoji: '🍵',
          title: 'Digital calm',
          desc: 'A peaceful beginning to every browsing session.',
        },
        { emoji: '💎', title: 'Daily clarity', desc: 'Your tools and tasks, always within reach.' },
      ],
    },
    finalCta: {
      heading: 'Start a different browsing experience',
      sub: 'Turn your new tab into a calm, smart space.',
      cta: 'Add Refiq to Chrome — Free',
      reassurance: 'Free · Lightweight · No sign-up · No ads',
    },
    footer: {
      brand: 'Refiq',
      tagline: 'Made with love for Arab users ☕',
      privacy: 'Privacy Policy',
      contact: 'Contact Us',
    },
  },
}

/* ============================================================
   Main Component
   ============================================================ */
export default function HomePage() {
  const [lang, setLang] = useState<Lang>('ar')
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const t = content[lang]

  /* Update <html> dir & lang on toggle */
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  /* Intersection observer for fade-in */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12 },
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lang])

  const toggleLang = useCallback((l: Lang) => {
    setLang(l)
    // re-observe after React re-renders
    setTimeout(() => {
      document.querySelectorAll('.fade-in:not(.visible)').forEach((el) => {
        el.classList.add('visible')
      })
    }, 100)
  }, [])

  return (
    <>
      {/* ── NAV ── */}
      <nav className="nav">
        <div className="container nav-inner">
          <div className="nav-logo">
            <Image width={100} height={36} src="/logotype.png" alt="Refiq — رفيق" priority />
          </div>
          <div className="nav-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#philosophy">{t.nav.about}</a>
            <div className="lang-toggle">
              <button className={lang === 'ar' ? 'active' : ''} onClick={() => toggleLang('ar')}>
                AR
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => toggleLang('en')}>
                EN
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container hero-inner fade-in">
          <div className="hero-logo">
            <Image src="/logotype.png" alt="Refiq — رفيق" width={220} height={80} priority />
          </div>
          <p className="hero-tagline">{t.hero.tagline}</p>
          <button className="cta-btn" onClick={() => window.open('#', '_blank')}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            {t.hero.cta}
          </button>
          <div className="hero-preview">
            <Image
              src="/preview.png"
              alt="Refiq New Tab Preview"
              width={900}
              height={560}
              className="hero-preview-img"
              priority
            />
          </div>
          <p className="hero-trust">{t.hero.trust}</p>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="problem section-padding">
        <div className="container problem-inner fade-in">
          <h2 className="problem-heading">
            {t.problem.heading.split('\n').map((line: string, i: number) => (
              <React.Fragment key={i}>
                {line}
                {i === 0 && <br />}
              </React.Fragment>
            ))}
          </h2>
          <p>{t.problem.p1}</p>
          <p>{t.problem.p2}</p>
          <p>{t.problem.p3}</p>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="philosophy section-padding" id="philosophy">
        <div className="container text-center fade-in">
          <h2 className="section-title">{t.philosophy.heading}</h2>
          <p className="section-subtitle mx-auto">{t.philosophy.sub}</p>
          <div className="philosophy-grid">
            {t.philosophy.items.map((item: any, i: number) => (
              <div className="philosophy-item" key={i}>
                <span className="philosophy-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features section-padding" id="features">
        <div className="container text-center fade-in">
          <h2 className="section-title">{t.features.heading}</h2>
          <p className="section-subtitle mx-auto">{t.features.sub}</p>
          <div className="features-grid">
            {t.features.items.map((item: any, i: number) => (
              <div className="feature-card" key={i}>
                <Image
                  width={300}
                  height={100}
                  className="feature-image"
                  src={item.image}
                  alt={item.title}
                />
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="preview section-padding">
        <div className="container text-center fade-in">
          <h2 className="section-title">{t.preview.heading}</h2>
          <p className="section-subtitle mx-auto">{t.preview.sub}</p>
          <div className="preview-screenshot">
            {!isVideoLoaded && (
              <div className="preview-loader">
                <div className="spinner" />
              </div>
            )}
            <video
              src="/app.webm"
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setIsVideoLoaded(true)}
              className={`preview-video ${isVideoLoaded ? 'visible' : 'hidden'}`}
            />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="social-proof section-padding">
        <div className="container text-center fade-in">
          <h2 className="section-title">{t.socialProof.heading}</h2>
          <div className="quotes-grid">
            {t.socialProof.quotes.map((q: any, i: number) => (
              <div className="quote-card" key={i}>
                <p>&ldquo;{q.text}&rdquo;</p>
                <span className="quote-author">— {q.author}</span>
              </div>
            ))}
          </div>
          <div className="social-badge">{t.socialProof.badge}</div>
          <div className="social-stats">
            {t.socialProof.stats.map((s: any, i: number) => (
              <div className="social-stat" key={i}>
                <span className="social-stat-number">{s.number}</span>
                <span className="social-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OBJECTION HANDLING ── */}
      <section className="objection section-padding">
        <div className="container text-center fade-in">
          <h2 className="section-title">{t.objection.heading}</h2>
          <div className="objection-grid">
            {t.objection.items.map((item: any, i: number) => (
              <div className="objection-card" key={i}>
                <div className="objection-good">{item.good}</div>
                <div className="objection-vs">{item.vs}</div>
                <div className="objection-bad">{item.bad}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IDENTITY / LIFESTYLE ── */}
      <section className="identity section-padding">
        <div className="container fade-in">
          <h2 className="section-title text-center">{t.identity.heading}</h2>
          <div className="identity-grid">
            {t.identity.items.map((item: any, i: number) => (
              <div className="identity-item" key={i}>
                <span className="identity-emoji">{item.emoji}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="final-cta section-padding">
        <div className="container fade-in">
          <h2 className="final-heading">{t.finalCta.heading}</h2>
          <p className="final-sub">{t.finalCta.sub}</p>
          <button className="cta-btn" onClick={() => window.open('#', '_blank')}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
            {t.finalCta.cta}
          </button>
          <p className="final-reassurance">{t.finalCta.reassurance}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <div className="footer-brand">{t.footer.brand}</div>
            <div>{t.footer.tagline}</div>
          </div>
          <div className="footer-links">
            <a href="#features">{t.nav.features}</a>
            <a href="#">{t.footer.privacy}</a>
            <a href="#">{t.footer.contact}</a>
            <div className="lang-toggle">
              <button className={lang === 'ar' ? 'active' : ''} onClick={() => toggleLang('ar')}>
                AR
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => toggleLang('en')}>
                EN
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
