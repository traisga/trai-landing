const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. AYARLAR & KATEGORİLER
// ==========================================
const ERKEK_KEYWORDS = ["Kazak", "Sweatshirt", "Gömlek", "Denim Gömlek", "T-Shirt", "Polo T-shirt", "Hırka", "Polar Sweatshirt", "Atlet", "V Yaka Tişört", "Oversize Tişört", "Pantolon", "Chino Pantolon", "Denim Pantolon", "Jean", "Eşofman Altı", "Şort", "Denim Şort", "Jogger", "Kargo Pantolon", "Mont", "Kaban", "Ceket", "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", "Parka", "Bomber Ceket", "Takım Elbise", "Eşofman Takımı"];
const KADIN_KEYWORDS = ["Kazak", "Sweatshirt", "Gömlek", "Bluz", "Hırka", "T-Shirt", "Polo T-shirt", "Tunik", "Crop Top", "Büstiyer", "Body", "Askılı Bluz", "Pantolon", "Denim Pantolon", "Jean", "Şort", "Etek", "Mini Etek", "Midi Etek", "Maxi Etek", "Tayt", "Eşofman Altı", "Palazzo Pantolon", "Mont", "Kaban", "Ceket", "Blazer Ceket", "Şişme Mont", "Deri Ceket", "Trençkot", "Yelek", "Palto", "Parka", "Elbise", "Mini Elbise", "Midi Elbise", "Maxi Elbise", "Abiye Elbise", "Tulum", "Eşofman Takımı"];
const TESETTUR_KEYWORDS = ["Tesettür Elbise", "Tesettür Tunik", "Tesettür Ferace", "Tesettür İkili Takım", "Tesettür Üçlü Takım", "Tesettür Abiye", "Tesettür Kap"];

function generateCategoryList() {
    const list = [];
    ERKEK_KEYWORDS.forEach(kw => list.push({ name: `Erkek - ${kw}`, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Erkek ${kw}`)}&os=1`, gender: 'male' }));
    KADIN_KEYWORDS.forEach(kw => list.push({ name: `Kadın - ${kw}`, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(`Kadın ${kw}`)}&os=1`, gender: 'female' }));
    TESETTUR_KEYWORDS.forEach(kw => list.push({ name: kw, keyword: kw, url: `https://www.trendyol.com/sr?q=${encodeURIComponent(kw)}&os=1`, gender: 'female' }));
    return list;
}
const CATEGORY_LIST = generateCategoryList();

// ==========================================
// 2. YARDIMCI FONKSİYONLAR
// ==========================================
function extractColor(t) { const c={'siyah':'Siyah','black':'Siyah','beyaz':'Beyaz','white':'Beyaz','krem':'Krem','lacivert':'Lacivert','mavi':'Mavi','kırmızı':'Kırmızı','yeşil':'Yeşil','haki':'Haki','gri':'Gri','antrasit':'Antrasit','kahve':'Kahverengi','bej':'Bej','pembe':'Pembe','mor':'Mor','turuncu':'Turuncu','sarı':'Sarı','bordo':'Bordo'}; const l=t.toLowerCase(); for(const[k,v]of Object.entries(c))if(l.includes(k))return v; return 'Çok Renkli'; }
function extractType(t) { const tp={'kazak':'Kazak','sweatshirt':'Sweatshirt','gömlek':'Gömlek','t-shirt':'T-shirt','tişört':'T-shirt','hırka':'Hırka','pantolon':'Pantolon','jean':'Jean','şort':'Şort','etek':'Etek','tayt':'Tayt','elbise':'Elbise','mont':'Mont','ceket':'Ceket','kaban':'Kaban','yelek':'Yelek','takım':'Takım','eşofman':'Eşofman','tulum':'Tulum'}; const l=t.toLowerCase(); for(const[k,v]of Object.entries(tp))if(l.includes(k))return v; return 'Giyim'; }
function getModoCategory(t) { const l=t.toLowerCase(); if(l.includes('takım')||l.includes('elbise')||l.includes('tulum'))return 'fullbody'; if(l.includes('mont')||l.includes('kaban')||l.includes('ceket')||l.includes('yelek'))return 'outerwear'; if(l.includes('pantolon')||l.includes('jean')||l.includes('şort')||l.includes('etek')||l.includes('tayt'))return 'bottom'; return 'top'; }
function generateDescription(t) { const d=[]; const l=t.toLowerCase(); if(l.includes('slim'))d.push('Slim fit'); if(l.includes('oversize'))d.push('Oversize'); if(l.includes('pamuk'))d.push('pamuklu'); return d.length>0?d.join(', '):'Modern tasarım'; }
function parsePrice(p) { if(!p)return{formatted:'0 TL',numeric:0}; const m=p.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/); if(m){const n=parseFloat(m[1].replace(/\./g,'').replace(',','.')); if(n>0)return{formatted:`${Math.round(n).toLocaleString('tr-TR')} TL`,numeric:Math.round(n)};} return{formatted:'0 TL',numeric:0}; }

// ==========================================
// 3. SCRAPER ENGINE
// ==========================================
async function scrapeCategory(page, config) {
    console.log(`➡️  ${config.name}`);
    await page.setExtraHTTPHeaders({'Accept-Language': 'tr-TR,tr;q=0.9', 'Referer': 'https://www.google.com/'});
    try { await page.goto(config.url, {waitUntil: 'networkidle2', timeout: 60000}); } catch(e) { console.log("   ⚠️ Timeout, devam ediliyor."); return []; }

    try { await page.waitForSelector('.p-card-wrppr, .product-card', {timeout: 8000}); } catch(e) { console.log("   ❌ Ürün yok."); return []; }

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0, distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance); totalHeight += distance;
                if(totalHeight >= 400000 || document.querySelectorAll('.p-card-wrppr').length > 150) { clearInterval(timer); resolve(); }
            }, 100);
        });
    });

    return await page.evaluate((gender) => {
        const banned = ['saat','terlik','eldiven','çorap','boxer','külot','kemer','cüzdan','parfüm','gözlük','kolye','küpe','şapka','bere','ayakkabı','bot','çizme','kılıf'];
        const data = [];
        document.querySelectorAll('.p-card-wrppr, .product-card').forEach(n => {
            try {
                if(n.innerText.length<5) return;
                const title = (n.querySelector('.prdct-desc-cntnr-name, .name')?.innerText || '').trim();
                const brand = (n.querySelector('.prdct-desc-cntnr-ttl, .brand')?.innerText || '').trim();
                if(!title) return;
                
                const lowerT = title.toLowerCase();
                if(banned.some(b=>lowerT.includes(b))) return;
                if(gender==='male' && lowerT.includes('kadın')) return;
                if(gender==='female' && lowerT.includes('erkek')) return;

                let link = n.querySelector('a')?.getAttribute('href');
                if(!link) return;
                if(!link.startsWith('http')) link = 'https://www.trendyol.com'+link;

                let img = n.querySelector('img')?.getAttribute('src');
                if(!img || img.includes('placeholder')) return;

                let price = '0 TL';
                const pEl = n.querySelector('.prc-box-dscntd, .prc-box-sllng, [data-testid="price-current-price"]');
                if(pEl) price = pEl.innerText;
                
                let finalBrand = brand || (title.split(' ')[0].length>2 ? title.split(' ')[0] : 'Genel');
                data.push({brand:finalBrand, title, price, link, image:img});
            } catch(e){}
        });
        return data;
    }, config.gender);
}

// ==========================================
// 4. BAŞLATICI & GÜNCELLEYİCİ (MERGE LOGIC)
// ==========================================
(async () => {
    console.log('🚀 AKILLI SCRAPER (MERGE MODE) ÇALIŞIYOR...');

    const userAgents = ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'];
    const browser = await puppeteer.launch({
        headless: process.env.CI ? "new" : false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setUserAgent(userAgents[0]);
    await page.setViewport({width: 1920, height: 1080});

    let newScrapedProducts = [];
    const limit = process.env.CI ? CATEGORY_LIST.length : 3; 

    for (let i = 0; i < limit; i++) {
        const cat = CATEGORY_LIST[i];
        const products = await scrapeCategory(page, cat);
        newScrapedProducts = [...newScrapedProducts, ...products];
        await new Promise(r => setTimeout(r, 1500));
    }
    await browser.close();

    console.log(`\n📥 Yeni çekilen veri sayısı: ${newScrapedProducts.length}`);

    // --- YENİ VERİYİ FORMATLA ---
    // (Henüz eskiyle birleştirmeden önce Modo formatına çeviriyoruz)
    const formattedNewProducts = newScrapedProducts.map(p => {
        const price = parsePrice(p.price);
        return {
            brandId: p.brand.toLowerCase().replace(/[^a-z0-9]/g,''),
            brandName: p.brand,
            name: p.title,
            type: extractType(p.title),
            color: extractColor(p.title),
            category: getModoCategory(p.title),
            gender: p.gender,
            price: price.formatted,
            priceNum: price.numeric,
            image: p.image,
            description: generateDescription(p.title),
            link: p.link
        };
    }).filter(p => p.priceNum > 0);

    // --- MERGE (BİRLEŞTİRME) MANTIĞI ---
    const publicDir = path.join(__dirname, 'public');
    const jsonPath = path.join(publicDir, 'trendyol_products.json');
    const jsPath = path.join(publicDir, 'trendyol_products.js');

    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    let finalProductList = [];
    
    // 1. Eski dosyayı oku (varsa)
    if (fs.existsSync(jsonPath)) {
        try {
            const oldDataRaw = fs.readFileSync(jsonPath, 'utf8');
            finalProductList = JSON.parse(oldDataRaw);
            console.log(`💾 Eski veri bulundu: ${finalProductList.length} ürün.`);
        } catch(e) {
            console.log("⚠️ Eski dosya okunamadı, sıfırdan başlanıyor.");
            finalProductList = [];
        }
    } else {
        console.log("✨ Eski dosya yok, ilk kez oluşturuluyor.");
    }

    // 2. Ürünleri 'Link'lerine göre haritala (Hızlı bulmak için)
    // Map yapısı: { "https://trendyol.com/urun1": {URUN_OBJESI}, ... }
    const productMap = new Map();

    // Önce eskileri haritaya koy
    finalProductList.forEach(p => productMap.set(p.link, p));

    // Şimdi yenileri işle
    let addedCount = 0;
    let updatedCount = 0;

    formattedNewProducts.forEach(newP => {
        if (productMap.has(newP.link)) {
            // A) Ürün zaten var -> Sadece fiyatı ve güncel bilgileri güncelle
            const existingP = productMap.get(newP.link);
            
            // Fiyat değişmiş mi kontrol et (Log amaçlı)
            if (existingP.priceNum !== newP.priceNum) {
                // Fiyatı güncelle
                existingP.price = newP.price;
                existingP.priceNum = newP.priceNum;
                // İstersen fotoğrafı da güncelle
                existingP.image = newP.image; 
                updatedCount++;
            }
            // Haritadaki veriyi güncelle
            productMap.set(newP.link, existingP);
        } else {
            // B) Ürün yok -> Yeni ekle
            productMap.set(newP.link, newP);
            addedCount++;
        }
    });

    // 3. Haritadan listeye geri çevir ve ID'leri düzelt
    // (Map kullandığımız için Duplicate'ler otomatik silinmiş oldu)
    const mergedList = Array.from(productMap.values()).map((p, index) => ({
        ...p,
        id: index + 1 // ID'leri baştan sırala (1, 2, 3...)
    }));

    console.log(`\n📊 BİRLEŞTİRME SONUCU:`);
    console.log(`   ➕ Eklenen Yeni Ürün: ${addedCount}`);
    console.log(`   🔄 Fiyatı Güncellenen: ${updatedCount}`);
    console.log(`   💰 Toplam Ürün Sayısı: ${mergedList.length}`);

    // --- DOSYALARI KAYDET ---
    const jsContent = `const TRENDYOL_PRODUCTS = ${JSON.stringify(mergedList, null, 2)};
if (typeof window !== 'undefined') window.TRENDYOL_PRODUCTS = TRENDYOL_PRODUCTS;
if (typeof module !== 'undefined' && module.exports) module.exports = TRENDYOL_PRODUCTS;`;

    fs.writeFileSync(jsPath, jsContent);
    fs.writeFileSync(jsonPath, JSON.stringify(mergedList, null, 2));

    console.log(`🎉 Dosyalar başarıyla güncellendi (Overwrite yapılmadı).`);
})();
