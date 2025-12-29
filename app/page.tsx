"use client";

import React, { useState } from 'react';
import { Shirt, Sparkles, Smartphone, ShoppingBag, CheckCircle, ArrowRight, Instagram, Twitter, Mail } from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Burasi backend'e baglanacak. Simdilik simulasyon yapiyoruz.
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-violet-200">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-violet-600 p-1.5 rounded-lg">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                TrAi <span className="text-violet-600 font-light">Style</span>
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-violet-600 transition-colors">Özellikler</a>
              <a href="#brands" className="hover:text-violet-600 transition-colors">Markalar</a>
              <a href="#how-it-works" className="hover:text-violet-600 transition-colors">Nasıl Çalışır?</a>
            </div>
            {/* DÜZELTME 1: Store'da -> Store&apos;da */}
            <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all">
              Yakında App Store&apos;da
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="w-3 h-3" />
            Sanal Stil Asistanı
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Dene. Keşfet. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              Parla.
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            TrAi, yapay zeka teknolojisiyle kıyafetleri saniyeler içinde üzerinde denemeni sağlar. Binlerce markayı keşfet, tarzını yarat ve en iyi fiyatla alışveriş yap.
          </p>

          {/* Email Capture Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
            <input 
              type="email" 
              placeholder="E-posta adresini gir" 
              className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="bg-violet-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 group"
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Kayıt Alındı!
                </>
              ) : (
                <>
                  Erken Erişim <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <p className="text-xs text-slate-400">İlk 100 kişiye sınırsız Premium Deneme hakkı.</p>
        </div>

        {/* Hero Image / Mockup Placeholder */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <div className="relative z-10 bg-slate-100 rounded-3xl aspect-[9/16] shadow-2xl border-8 border-white overflow-hidden flex items-center justify-center group">
             {/* BURAYA UYGULAMA EKRAN GÖRÜNTÜSÜ GELECEK */}
             <div className="absolute inset-0 bg-gradient-to-tr from-violet-100 to-indigo-50 opacity-50"></div>
             <div className="text-center p-8">
                <Smartphone className="w-16 h-16 text-violet-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Uygulama Ekran Görüntüsü</p>
                {/* DÜZELTME 2: StackBlitz'deki -> StackBlitz&apos;deki */}
                <p className="text-xs text-slate-300 mt-2">(Buraya StackBlitz&apos;deki ekran görüntünü koyabilirsin)</p>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-1000">
               <div className="w-12 h-12 bg-indigo-100 rounded-lg flex-shrink-0"></div>
               <div>
                 <p className="text-xs text-slate-500">Eşleşme Oranı</p>
                 <p className="font-bold text-slate-800">%98 Uyumluluk</p>
               </div>
             </div>
          </div>
          
          {/* Decorative Blobs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-200/30 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* --- BRANDS SECTION (Social Proof for Admitad) --- */}
      <section id="brands" className="py-12 border-y border-slate-50 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
            Anlaşmalı Markalarımız (Çok Yakında)
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-bold font-serif">MAVI</span>
            <span className="text-2xl font-black tracking-tighter">BOYNER</span>
            <span className="text-2xl font-bold">KOTON</span>
            <span className="text-2xl font-bold tracking-tight">DeFacto</span>
            <span className="text-2xl font-bold italic">Trendyol</span>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Moda Alışverişinin Geleceği</h2>
          {/* DÜZELTME 3: Çift tırnaklar -> &quot; */}
          <p className="text-slate-600">Artık &quot;Acaba üzerimde nasıl durur?&quot; diye düşünmek yok. TrAi teknolojisi ile denemek bedava, almak güvenli.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shirt className="w-6 h-6 text-violet-600" />,
              title: "Sanal Deneme (VTO)",
              desc: "Fotoğrafını yükle, seçtiğin kıyafeti saniyeler içinde üzerinde gör. Mağaza kabinlerini telefonuna getirdik."
            },
            {
              icon: <Smartphone className="w-6 h-6 text-violet-600" />,
              title: "Akıllı Stil Asistanı",
              desc: "Yapay zeka vücut tipine ve zevkine en uygun kombinleri senin için seçer ve önerir."
            },
            {
              icon: <ShoppingBag className="w-6 h-6 text-violet-600" />,
              title: "Güvenli Alışveriş",
              desc: "Beğendiğin ürünleri doğrudan markaların kendi resmi sitelerine yönlendirerek güvenle satın almanı sağlarız."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER (Legal Links for Compliance) --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-violet-600 p-1 rounded">
                <Shirt className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TrAi Style</span>
            </div>
            <p className="text-sm max-w-xs">
              Yapay zeka destekli sanal deneme ve stil platformu. 
              Modayı teknolojiyle buluşturuyoruz.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Kurumsal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-white">Basın Kiti</a></li>
              <li><a href="#" className="hover:text-white">Kariyer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm">
              {/* Admitad bu linkleri kontrol eder */}
              <li><a href="#" className="hover:text-white">Kullanım Koşulları</a></li>
              <li><a href="#" className="hover:text-white">Gizlilik Politikası</a></li>
              <li><a href="#" className="hover:text-white">Çerez Politikası</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2025 TRAİ MODA TEKNOLOJİLERİ A.Ş. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white"><Instagram className="w-4 h-4" /></a>
            <a href="mailto:info@trai.style" className="hover:text-white flex items-center gap-1">
              <Mail className="w-4 h-4" /> info@trai.style
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}