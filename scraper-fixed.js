const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

// ==========================================
// AYARLAR & KATEGORİLER
// ==========================================

const ERKEK_KEYWORDS = [
    "Kazak", "Sweatshirt", "Gömlek", "Denim Gömlek", "T-Shirt", "Polo T-shirt", 
    "Hırka", "Polar Sweatshirt", "Atlet", "V Yaka Tişört", "Oversize Tişört",
    "Pantolon", "Chino Pantolon", "Denim Pantolon", "Jean", "Eşofman Altı", 
    "Şort", "Denim Şort", "Jogger", "Kargo Pantolon", "Mont", "Kaban", "Ceket", 
    "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", "Parka", "Bomber Ceket",
    "Takım Elbise", "Eşofman Takımı"
];

const KADIN_KEYWORDS = [
    "Kazak", "Sweatshirt", "Gömlek", "Bluz", "Hırka", "T-Shirt", "Polo T-shirt", 
    "Tunik", "Crop Top", "Büstiyer", "Body", "Askılı Bluz", "Pantolon", 
    "Denim Pantolon", "Jean", "Şort", "Etek", "Mini Etek", "Midi Etek", 
    "Maxi Etek", "Tayt", "Eşofman Altı", "Palazzo Pantolon", "Mont", "Kaban", 
    "Ceket", "Blazer Ceket", "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", 
    "Palto", "Parka", "Elbise", "Mini Elbise", "Midi Elbise", "Maxi Elbise", 
    "Abiye Elbise", "Tulum", "Eşofman Takımı"
];

const TESETTUR_KEYWORDS = [
    "Tesettür Elbise", "Tesettür Tunik", "Tesettür Ferace",
    "Tesettür İkili Takım", "Tesettür Üçlü Takım", "Tesettür Abiye", "Tesettür Kap"
];

function generateCategoryList() {
    const list = [];
    ERKEK_KEYWORDS.forEach(kw => list.push({ 
        name: `Erkek - ${kw}`, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Erkek ${kw}`)}&qt=${encodeURIComponent(`Erkek ${kw}`)}&st=${encodeURIComponent(`Erkek ${kw}`)}&os=1`, 
        gender: 'male' 
    }));
    KADIN_KEYWORDS.forEach(kw => list.push({ 
        name: `Kadın - ${kw}`, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Kadın ${kw}`)}&qt=${encodeURIComponent(`Kadın ${kw}`)}&st=${encodeURIComponent(`Kadın ${kw}`)}&os=1`, 
        gender: 'female' 
    }));
    TESETTUR_KEYWORDS.forEach(kw => list.push({ 
        name: kw, 
        keyword: kw, 
        url: `https://www.trendyol.com/sr?q=${encodeURIComponent(kw)}&qt=${encodeURIComponent(kw)}&st=${encodeURIComponent(kw)}&os=1`, 
        gender: 'female' 
    }));
    return list;
}
const CATEGORY_LIST = generateCategoryList();

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================
function extractColor(title) {
    const colors = {'siyah':'Siyah','black':'Siyah','beyaz':'Beyaz','white':'Beyaz','ekru':'Ekru','krem':'Krem','lacivert':'Lacivert','navy':'Lacivert','mavi':'Mavi','blue':'Mavi','indigo':'İndigo','kırmızı':'Kırmızı','red':'Kırmızı','bordo':'Bordo','burgundy':'Bordo','yeşil':'Yeşil','green':'Yeşil','haki':'Haki','khaki':'Haki','gri':'Gri','grey':'Gri','gray':'Gri','antrasit':'Antrasit','kahve':'Kahverengi','kahverengi':'Kahverengi','brown':'Kahverengi','camel':'Camel','bej':'Bej','beige':'Bej','taş':'Taş','pembe':'Pembe','pink':'Pembe','pudra':'Pudra','mor':'Mor','purple':'Mor','lila':'Lila','turuncu':'Turuncu','orange':'Turuncu','sarı':'Sarı','yellow':'Sarı','hardal':'Hardal','vizon':'Vizon','füme':'Füme','petrol':'Petrol','mint':'Mint'};
    const lower = title.toLowerCase();
    for(const [k,v] of Object.entries(colors)) if(lower.includes(k)) return v;
    return 'Çok Renkli';
}

function extractType(title) {
    const types = {'kazak':'Kazak','triko':'Kazak','sweatshirt':'Sweatshirt','polar':'Polar','gömlek':'Gömlek','t-shirt':'T-shirt','tişört':'T-shirt','polo':'Polo','bluz':'Bluz','hırka':'Hırka','tunik':'Tunik','crop':'Crop Top','büstiyer':'Büstiyer','body':'Body','pantolon':'Pantolon','chino':'Chino','jean':'Jean','denim':'Jean','şort':'Şort','bermuda':'Şort','etek':'Etek','tayt':'Tayt','palazzo':'Palazzo','elbise':'Elbise','abiye':'Abiye','mont':'Mont','şişme':'Mont','kaban':'Kaban','palto':'Palto','ceket':'Ceket','blazer':'Blazer','trençkot':'Trençkot','yelek':'Yelek','parka':'Parka','bomber':'Bomber','takım':'Takım','eşofman':'Eşofman','tulum':'Tulum','ferace':'Ferace','kap':'Kap','tesettür':'Tesettür'};
    const lower = title.toLowerCase();
    for(const [k,v] of Object.entries(types)) if(lower.includes(k)) return v;
    return 'Giyim';
}

function getModoCategory(title) {
    const lower = title.toLowerCase();
    if(lower.includes('takım')||lower.includes('elbise')||lower.includes('tulum')||lower.includes('ferace')||lower.includes('set')) return 'fullbody';
    if(lower.includes('mont')||lower.includes('kaban')||lower.includes('palto')||lower.includes('ceket')||lower.includes('trençkot')||lower.includes('yelek')||lower.includes('parka')||lower.includes('kap')) return 'outerwear';
    if(lower.includes('pantolon')||lower.includes('jean')||lower.includes('denim')||lower.includes('şort')||lower.includes('etek')||lower.includes('tayt')||lower.includes('jogger')) return 'bottom';
    return 'top';
}

function generateDescription(title) {
    const d = []; const l = title.toLowerCase();
    if(l.includes('slim')) d.push('Slim fit'); else if(l.includes('oversize')) d.push('Oversize'); else if(l.includes('regular')) d.push('Regular fit');
    if(l.includes('pamuk')||l.includes('cotton')) d.push('pamuklu'); if(l.includes('keten')) d.push('keten');
    return d.length>0 ? d.join(', ') : 'Modern tasarım';
}

function parsePrice(p) {
    if(!p) return {formatted:'0 TL', numeric:0};
    const m = p.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/);
    if(m) {
        const n = parseFloat(m[1].replace(/\./g,'').replace(',','.'));
        if(n>0) return {formatted:`${Math.round(n).toLocaleString('tr-TR')} TL`, numeric:Math.round(n)};
    }
    return {formatted:'0 TL', numeric:0};
}

// ==========================================
// DOSYA İŞLEMLERİ
// ==========================================
function loadExistingProducts() {
    const filePath = path.join(__dirname, 'public', 'products.json');
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`📦 Mevcut ${data.length} ürün yüklendi.`);
            return data;
        }
    } catch (e) {
        console.log('⚠️ Mevcut ürünler yüklenemedi, sıfırdan başlanıyor.');
    }
    return [];
}

function mergeProducts(existing, newProducts) {
    const productMap = new Map();
    let priceUpdates = 0;
    
    existing.forEach(p => productMap.set(p.link, p));
    
    newProducts.forEach(p => {
        if (productMap.has(p.link)) {
            const old = productMap.get(p.link);
            if (old.priceNum !== p.priceNum) {
                priceUpdates++;
                if (!old.priceHistory) old.priceHistory = [];
                old.priceHistory.push({ price: old.priceNum, date: old.lastSeen || old.firstSeen });
                if (old.priceHistory.length > 10) old.priceHistory.shift();
                old.price = p.price;
                old.priceNum = p.priceNum;
            }
            old.lastSeen = Date.now();
            productMap.set(p.link, old);
        } else {
            p.firstSeen = Date.now();
            p.lastSeen = Date.now();
            productMap.set(p.link, p);
        }
    });
    
    const merged = Array.from(productMap.values());
    merged.forEach((p, i) => p.id = i + 1);
    
    return { merged, priceUpdates, newCount: newProducts.length - priceUpdates };
}

// ==========================================
// DEBUG & SCREENSHOT
// ==========================================
async function takeDebugScreenshot(page, name) {
    try {
        const debugDir = path.join(__dirname, 'public', 'debug_screenshots');
        if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
        
        const cleanName = name.replace(/[^a-z0-9]/gi, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenPath = path.join(debugDir, `${cleanName}_${timestamp}.jpg`);
        
        await page.screenshot({ path: screenPath, fullPage: false, type: 'jpeg', quality: 70 });
        console.log(`   📸 Screenshot: ${cleanName}`);
        
        // HTML'i de kaydet (debug için)
        const html = await page.content();
        const htmlPath = path.join(debugDir, `${cleanName}_${timestamp}.html`);
        fs.writeFileSync(htmlPath, html.substring(0, 50000)); // İlk 50KB
        
    } catch (e) {
        console.log(`   ⚠️ Screenshot alınamadı: ${e.message}`);
    }
}

// ==========================================
// COOKIE CONSENT & POPUP HANDLER
// ==========================================
async function handleCookieConsent(page) {
    const cookieSelectors = [
        '#onetrust-accept-btn-handler',
        '.onetrust-accept-btn-handler', 
        '[data-testid="accept-cookies"]',
        'button[id*="accept"]',
        'button[class*="accept"]',
        '.cookie-accept',
        '#cookieUsagePopIn .btn',
        '.modal-close',
        '[aria-label="Kapat"]',
        '[aria-label="Close"]',
        'button:has-text("Kabul")',
        'button:has-text("Accept")',
        'button:has-text("Tamam")',
    ];
    
    for (const selector of cookieSelectors) {
        try {
            const btn = await page.$(selector);
            if (btn) {
                await btn.click();
                console.log(`   🍪 Cookie popup kapatıldı: ${selector}`);
                await delay(500);
                return true;
            }
        } catch (e) { }
    }
    
    // JavaScript ile popup'ları kapat
    await page.evaluate(() => {
        // OneTrust
        if (window.OneTrust) {
            try { window.OneTrust.AllowAll(); } catch(e) {}
        }
        // Genel modal kapatma
        document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]').forEach(el => {
            if (el.style.display !== 'none' && el.offsetParent !== null) {
                const closeBtn = el.querySelector('button, [class*="close"], [aria-label*="kapat"], [aria-label*="close"]');
                if (closeBtn) closeBtn.click();
            }
        });
    });
    
    return false;
}

// ==========================================
// TRENDYOL SPECİFİK POPUP HANDLER
// ==========================================
async function handleTrendyolPopups(page) {
    try {
        // Gender selection popup
        await page.evaluate(() => {
            const genderPopup = document.querySelector('.gender-popup, [data-testid="gender-popup"]');
            if (genderPopup) {
                const closeBtn = genderPopup.querySelector('.close, button');
                if (closeBtn) closeBtn.click();
            }
        });
        
        // App download popup
        await page.evaluate(() => {
            const appPopup = document.querySelector('[class*="app-download"], [class*="mobile-app"]');
            if (appPopup) {
                const closeBtn = appPopup.querySelector('.close, button, [class*="close"]');
                if (closeBtn) closeBtn.click();
            }
        });
        
        // Newsletter popup
        await page.evaluate(() => {
            document.querySelectorAll('[class*="newsletter"], [class*="email-popup"]').forEach(el => {
                const closeBtn = el.querySelector('.close, button[class*="close"]');
                if (closeBtn) closeBtn.click();
            });
        });
        
        // ESC tuşu ile kapatmayı dene
        await page.keyboard.press('Escape');
        await delay(300);
        await page.keyboard.press('Escape');
        
    } catch (e) { }
}

// ==========================================
// RANDOM USER AGENT
// ==========================================
function getRandomUserAgent() {
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}

// ==========================================
// DELAY & SCROLL
// ==========================================
async function delay(ms) {
    return new Promise(r => setTimeout(r, ms + Math.random() * 500));
}

async function humanDelay() {
    // İnsan benzeri rastgele bekleme
    return delay(1500 + Math.random() * 2000);
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 200 + Math.floor(Math.random() * 100);
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight || totalHeight > 12000) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200 + Math.floor(Math.random() * 150));
        });
    });
}

// ==========================================
// ANA SCRAPER
// ==========================================
async function scrapeCategory(page, config, retryCount = 0) {
    console.log(`➡️  ${config.name}`);
    
    try {
        await humanDelay();
        
        // Sayfaya git
        const response = await page.goto(config.url, { 
            waitUntil: 'domcontentloaded', 
            timeout: 45000 
        });
        
        // HTTP status kontrolü
        if (!response || response.status() >= 400) {
            console.log(`   ⚠️ HTTP ${response?.status() || 'N/A'}`);
            return [];
        }
        
        // Ekstra bekleme
        await delay(2000);
        
        // Popup'ları kapat
        await handleCookieConsent(page);
        await handleTrendyolPopups(page);
        
        // Bot detection kontrolü
        const pageTitle = await page.title();
        const pageUrl = page.url();
        
        if (pageTitle.includes("Robot") || pageTitle.includes("Security") || 
            pageTitle.includes("Captcha") || pageTitle.includes("blocked") ||
            pageUrl.includes("captcha") || pageUrl.includes("challenge")) {
            console.log(`   ⛔ BOT TESPİT EDİLDİ: ${pageTitle}`);
            await takeDebugScreenshot(page, `BOT_${config.name}`);
            
            // 403/bot durumunda tüm scraping'i durdur
            throw new Error("BOT_DETECTED");
        }
        
        // Ürün kartlarını bekle - birden fazla selector dene
        const cardSelectors = [
            '.p-card-wrppr',
            '.p-card-chldrn-cntnr',
            '.prdct-cntnr-wrppr .p-card-wrppr',
            '[data-testid="product-card"]',
            '.product-card',
            'div[class*="p-card"]'
        ];
        
        let foundSelector = null;
        
        for (const sel of cardSelectors) {
            try {
                await page.waitForSelector(sel, { timeout: 10000 });
                const count = await page.$$eval(sel, els => els.length);
                if (count > 0) {
                    foundSelector = sel;
                    console.log(`   🎯 Selector bulundu: ${sel} (${count} adet)`);
                    break;
                }
            } catch (e) { continue; }
        }
        
        if (!foundSelector) {
            console.log(`   ⚠️ Ürün bulunamadı`);
            await takeDebugScreenshot(page, `NO_PRODUCTS_${config.name}`);
            
            // Retry
            if (retryCount < 2) {
                console.log(`   ⏳ Tekrar deneniyor (${retryCount + 1}/2)...`);
                await delay(5000);
                return await scrapeCategory(page, config, retryCount + 1);
            }
            return [];
        }
        
        // Sayfayı scroll et (lazy loading için)
        await autoScroll(page);
        await delay(1500);
        
        // Tekrar popup kontrol
        await handleTrendyolPopups(page);
        
        // Ürünleri çek
        const products = await page.evaluate((gender, keyword, selector) => {
            const banned = ['saat', 'terlik', 'eldiven', 'çorap', 'boxer', 'külot', 'kemer', 'cüzdan', 'parfüm', 'gözlük', 'kolye', 'küpe', 'şapka', 'bere', 'ayakkabı', 'bot', 'çizme', 'kılıf', 'çanta'];
            const data = [];
            
            // Tüm olası card selector'ları dene
            const cards = document.querySelectorAll('.p-card-wrppr, .p-card-chldrn-cntnr > div, [data-testid="product-card"]');
            
            cards.forEach(n => {
                try {
                    if (!n || n.innerText.length < 10) return;
                    
                    // Brand
                    const brandEl = n.querySelector('.prdct-desc-cntnr-ttl, .prdct-desc-cntnr-ttl-w, span[class*="brand"], [data-testid="brand"]');
                    let brand = brandEl?.innerText?.trim() || '';
                    
                    // Title  
                    const titleEl = n.querySelector('.prdct-desc-cntnr-name, span[class*="name"], .product-name, [data-testid="product-name"]');
                    let title = titleEl?.innerText?.trim() || '';
                    
                    // Alternatif: tüm text'den çıkar
                    if (!title && n.innerText) {
                        const lines = n.innerText.split('\n').filter(l => l.trim().length > 5);
                        if (lines.length >= 2) {
                            brand = brand || lines[0].trim();
                            title = lines[1].trim();
                        }
                    }
                    
                    if (!title || title.length < 5) return;
                    
                    const lowerT = title.toLowerCase();
                    if (banned.some(b => lowerT.includes(b))) return;
                    if (gender === 'male' && lowerT.includes('kadın')) return;
                    if (gender === 'female' && !lowerT.includes('tesettür') && lowerT.includes('erkek')) return;

                    // Brand fallback
                    if (!brand || brand.length < 2) {
                        brand = title.split(' ')[0].length > 2 ? title.split(' ')[0] : 'Genel';
                    }

                    // Link
                    let link = n.tagName === 'A' ? n.getAttribute('href') : n.querySelector('a')?.getAttribute('href');
                    if (!link) return;
                    if (!link.startsWith('http')) link = 'https://www.trendyol.com' + link;
                    
                    // Image
                    const imgEl = n.querySelector('img');
                    let img = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-original');
                    if (!img || img.includes('placeholder') || img.includes('data:image') || img.includes('blank')) {
                        // Lazy load src kontrol
                        img = imgEl?.dataset?.src || imgEl?.dataset?.original;
                    }
                    if (!img) return;
                    if (img.startsWith('//')) img = 'https:' + img;

                    // Price
                    let price = '0 TL';
                    const priceSelectors = [
                        '.prc-box-dscntd',
                        '.prc-box-sllng', 
                        '.prdct-desc-cntnr-fiyat .prc-box-dscntd',
                        '[data-testid="price-current-price"]',
                        'div[class*="price"] span',
                        '.product-price'
                    ];
                    
                    for (const psel of priceSelectors) {
                        const pEl = n.querySelector(psel);
                        if (pEl && pEl.innerText && pEl.innerText.includes('TL')) {
                            price = pEl.innerText.trim();
                            break;
                        }
                    }
                    
                    // Fallback price search
                    if (price === '0 TL') {
                        const allSpans = n.querySelectorAll('span, div');
                        for (let s of allSpans) {
                            const txt = s.innerText?.trim() || '';
                            if (txt.includes('TL') && /\d/.test(txt) && txt.length < 30) {
                                price = txt;
                                break;
                            }
                        }
                    }

                    data.push({ brand, title, price, link, image: img, gender, keyword });
                } catch (e) {}
            });
            
            return data;
        }, config.gender, config.keyword, foundSelector);
        
        console.log(`   ✓ ${products.length} ürün bulundu`);
        return products;
        
    } catch (e) {
        if (e.message === "BOT_DETECTED") {
            throw e; // Yukarıya fırlat
        }
        console.log(`   ❌ Hata: ${e.message}`);
        await takeDebugScreenshot(page, `ERROR_${config.name}`);
        return [];
    }
}

// ==========================================
// INITIAL SETUP - ANA SAYFAYA GİT
// ==========================================
async function initializeBrowser(page) {
    console.log('🌐 Trendyol ana sayfası yükleniyor...');
    
    try {
        await page.goto('https://www.trendyol.com', { 
            waitUntil: 'domcontentloaded', 
            timeout: 30000 
        });
        
        await delay(3000);
        
        // Cookie consent
        await handleCookieConsent(page);
        await delay(1000);
        
        // Popup'ları kapat
        await handleTrendyolPopups(page);
        
        // Cinsiyet seçimi popup - Kadın seç (daha fazla kategori)
        await page.evaluate(() => {
            const femaleBtn = document.querySelector('[data-value="female"], .gender-female, button:has-text("Kadın")');
            if (femaleBtn) femaleBtn.click();
        });
        
        await delay(2000);
        
        // Screenshot al
        await takeDebugScreenshot(page, 'INITIAL_PAGE');
        
        console.log('✅ Başlangıç sayfası hazır\n');
        return true;
        
    } catch (e) {
        console.log(`❌ Başlangıç hatası: ${e.message}`);
        await takeDebugScreenshot(page, 'INIT_ERROR');
        return false;
    }
}

// ==========================================
// ANA FONKSİYON
// ==========================================
(async () => {
    console.log('🚀 TRENDYOL SCRAPER BAŞLIYOR...');
    console.log(`📅 Tarih: ${new Date().toLocaleString('tr-TR')}\n`);
    
    const existingProducts = loadExistingProducts();
    
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--lang=tr-TR,tr',
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });
    
    const page = await browser.newPage();
    
    // Random user agent
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);
    console.log(`🔧 User-Agent: ${userAgent.substring(0, 50)}...`);
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Extra headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    });
    
    // Webdriver gizle
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
        
        // Chrome detection
        window.chrome = { runtime: {} };
        
        // Permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });

    // Önce ana sayfaya git ve cookie/popup'ları handle et
    const initialized = await initializeBrowser(page);
    
    if (!initialized) {
        console.log('⚠️ Başlatma başarısız, devam ediliyor...');
    }

    let allNewProducts = [];
    let successCount = 0;
    let botDetected = false;
    
    // Kategorileri shuffle et (pattern detection'ı zorlaştır)
    const shuffledCategories = [...CATEGORY_LIST].sort(() => Math.random() - 0.5);
    
    for (const cat of shuffledCategories) {
        if (botDetected) {
            console.log('⛔ Bot tespit edildi, scraping durduruluyor!');
            break;
        }
        
        try {
            const products = await scrapeCategory(page, cat);
            if (products.length > 0) {
                allNewProducts = [...allNewProducts, ...products];
                successCount++;
            }
            
            // Her 10 kategoride bir uzun mola
            if (successCount > 0 && successCount % 10 === 0) {
                console.log(`   ⏸️ Mola veriliyor...`);
                await delay(5000 + Math.random() * 5000);
            }
            
        } catch (e) {
            if (e.message === "BOT_DETECTED") {
                botDetected = true;
            }
            console.log(`   ❌ Kategori hatası: ${cat.name}`);
        }
    }
    
    await browser.close();
    
    console.log(`\n✅ ${successCount}/${CATEGORY_LIST.length} kategori işlendi.`);

    const uniqueNew = Array.from(new Map(allNewProducts.map(p => [p.link, p])).values());
    console.log(`📦 ${uniqueNew.length} benzersiz yeni ürün çekildi.`);

    const processedNew = uniqueNew.map(p => {
        const price = parsePrice(p.price);
        return {
            id: 0,
            brandId: p.brand.toLowerCase().replace(/[^a-z0-9]/g, ''),
            brandName: p.brand,
            name: p.title,
            type: extractType(p.title),
            color: extractColor(p.title),
            category: getModoCategory(p.title),
            gender: p.gender,
            keyword: p.keyword,
            price: price.formatted,
            priceNum: price.numeric,
            image: p.image,
            description: generateDescription(p.title),
            link: p.link
        };
    }).filter(p => p.priceNum > 0);

    const { merged, priceUpdates, newCount } = mergeProducts(existingProducts, processedNew);
    
    console.log(`\n📊 Özet: ${newCount} yeni ürün, ${priceUpdates} fiyat güncellemesi`);

    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    fs.writeFileSync(path.join(publicDir, 'products.json'), JSON.stringify(merged, null, 2));

    const jsContent = `const TRENDYOL_PRODUCTS = ${JSON.stringify(merged, null, 2)};
if (typeof window !== 'undefined') window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
if (typeof module !== 'undefined' && module.exports) module.exports = TRENDYOL_PRODUCTS;`;
    fs.writeFileSync(path.join(publicDir, 'trendyol_products.js'), jsContent);

    const stats = {
        lastUpdated: new Date().toISOString(),
        totalProducts: merged.length,
        previousTotal: existingProducts.length,
        newProducts: newCount,
        priceUpdates: priceUpdates,
        categoriesProcessed: successCount,
        botDetected: botDetected,
        byGender: {
            male: merged.filter(p => p.gender === 'male').length,
            female: merged.filter(p => p.gender === 'female').length
        },
        byCategory: {
            top: merged.filter(p => p.category === 'top').length,
            bottom: merged.filter(p => p.category === 'bottom').length,
            outerwear: merged.filter(p => p.category === 'outerwear').length,
            fullbody: merged.filter(p => p.category === 'fullbody').length
        },
        priceRange: merged.length > 0 ? {
            min: Math.min(...merged.map(p => p.priceNum)),
            max: Math.max(...merged.map(p => p.priceNum)),
            avg: Math.round(merged.reduce((a, p) => a + p.priceNum, 0) / merged.length)
        } : { min: 0, max: 0, avg: 0 }
    };
    fs.writeFileSync(path.join(publicDir, 'products_stats.json'), JSON.stringify(stats, null, 2));

    console.log(`\n📊 SONUÇ:`);
    console.log(`   • Önceki toplam: ${existingProducts.length} ürün`);
    console.log(`   • Şimdiki toplam: ${merged.length} ürün`);
    console.log(`   • Net artış: +${merged.length - existingProducts.length} ürün`);
    if (botDetected) {
        console.log(`   ⚠️ BOT TESPİTİ OLDU - Bazı kategoriler atlandı`);
    }

    console.log(`\n🎉 BİTTİ! Dosyalar 'public' klasörüne kaydedildi.`);
})();
