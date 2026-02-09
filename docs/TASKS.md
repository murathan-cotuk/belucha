2. Sonraki adım: Yol haritası
Payload temizliği bittikten sonra aşağıdaki sırayla ilerleyebilirsin.
Aşama 1 – Temel veri ve API (1–2 hafta) ✅ Tamamlandı (bkz. docs/PROJE.md Medusa veri modeli + Aşama 1)
Sıra	Ne	Nasıl
1	Veri modeli netleştir	Medusa’da ne var: region, product, variant, inventory, price list, sales channel. Eksikse Seller Central’dan ekleyebileceğin akışı kur.
2	Shop ↔ Medusa	Shop’ta ürün listesi ve ürün detayı Medusa store API’den gelsin; bir kategori/collection ile test et.
3	Seller Central ↔ Medusa	Ürün listesi ve sipariş listesi Medusa admin API’den gelsin; en azından liste + detay çalışsın.
Hedef: “Ürünler nerede, nasıl görünüyor” net olsun; tek kaynak Medusa.
Aşama 2 – Mağaza akışı (2–3 hafta)
Sıra	Ne	Nasıl
4	Sepet	Shop’ta “Sepete ekle” → Medusa cart API; sepet sayfası veya drawer.
5	Checkout	Adres, kargo, ödeme (Stripe vb.); sipariş Medusa’da oluşsun.
6	Müşteri	Kayıt/giriş Medusa auth; sipariş geçmişi Medusa’dan.
Hedef: Ürün → sepet → ödeme → sipariş tamamlansın.
Aşama 3 – Seller Central yönetim (1–2 hafta)
Sıra	Ne	Nasıl
7	Ürün CRUD	Ürün ekleme/düzenleme (fiyat, varyant, stok) Medusa admin API.
8	Sipariş yönetimi	Sipariş listesi, detay, durum güncelleme.
9	Import/export	Ürün toplu import (CSV); sipariş/müşteri export (basit CSV/Excel).
Hedef: Günlük operasyon Seller Central’dan yürüsün.
Aşama 4 – İçerik ve SEO (1 hafta)
Kategori sayfa içeriği (SEO, banner, long content) Admin Hub üzerinden yönetiliyor (seo_title, seo_description, banner_image_url, long_content). CMS (Payload vb.) site açılmadan önce değerlendirilecek; bkz. docs/PROJE.md Mimari karar.
Sıra	Ne	Nasıl
10	Sayfa yapısı	Hangi sayfalar statik (ana sayfa, iletişim vb.); hepsi Shop’ta, Medusa sadece e-ticaret verisi.
11	SEO	Meta title/description, OG; ürün/kategori sayfalarında dinamik meta.
12	Görseller	Ürün görselleri Medusa’da mı, CDN nerede; performans için optimize.
Aşama 5 – Güvenlik ve operasyon
Sıra	Ne	Nasıl
13	Auth / yetki	Seller Central’da admin kullanıcılar; Medusa admin auth ile uyumlu.
14	Monitoring	Render + Vercel log; kritik hata için basit alert.
15	Yedekleme	Postgres (Render) yedekleme; migration’ların düzenli çalıştığından