import { XMLParser } from 'fast-xml-parser';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import Image from 'next/image';

// Veri cekme fonksiyonu (Simdilik local dosyadan, sonra linkten)
async function getProducts() {
  // 1. Dosyayi veya Linki al
  // Gercek onay gelince buraya Admitad linkini yazacagiz.
  // Simdilik kendi olusturdugumuz mock dosyayi okuyoruz.
  const res = await fetch('http://localhost:3000/mock-products.xml', { cache: 'no-store' });
  const xmlData = await res.text();

  // 2. XML'i JSON'a cevir
  const parser = new XMLParser();
  const jsonData = parser.parse(xmlData);

  // 3. Urun listesini dondur
  // XML yapisina gore path degisebilir, bizim mock dosyamizda products -> product
  return jsonData.products.product;
}

export default async function ShopPage() {
  let products = [];
  try {
    products = await getProducts();
    // Eger tek bir urun gelirse diziye cevir (Parser bazen tek objeye cevirir)
    if (!Array.isArray(products)) {
        products = [products];
    }
  } catch (error) {
    console.error("XML Hatasi:", error);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Vitrin (Simülasyon)</h1>
          <p className="mt-4 text-slate-600">
            Bu ürünler şu an <b>Mock Data (Sahte Veri)</b> ile çekilmektedir. 
            Onay gelince burası gerçek Puma ürünleriyle dolacak.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((item: any) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group">
              <div className="relative aspect-square bg-slate-100 p-4 flex items-center justify-center">
                 {/* Resimler gercek Puma sunucusundan geliyor */}
                 <img 
                   src={item.picture} 
                   alt={item.name} 
                   className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-300"
                 />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                  <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-full">
                    {item.currency} {item.price}
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{item.description}</p>
                
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl hover:bg-violet-600 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Satın Al (Admitad)
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}