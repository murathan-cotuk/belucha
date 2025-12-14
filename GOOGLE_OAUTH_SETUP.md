# 🔐 Google OAuth Kurulum Rehberi

**Bu dosya Google OAuth entegrasyonu için adım adım rehberdir.**

---

## 📋 İçindekiler

1. [Google Cloud Console Kurulumu](#google-cloud-console-kurulumu)
2. [OAuth 2.0 Credentials Oluşturma](#oauth-20-credentials-oluşturma)
3. [Payload CMS'e Entegrasyon](#payload-cmse-entegrasyon)
4. [Shop ve Sellercentral'de Kullanım](#shop-ve-sellercentralde-kullanım)
5. [Test Etme](#test-etme)

---
 
## 🚀 Google Cloud Console Kurulumu

### Adım 1: Google Cloud Console'a Giriş

1. [console.cloud.google.com](https://console.cloud.google.com) → **Sign In**
2. Google hesabınızla giriş yapın

### Adım 2: Yeni Proje Oluştur

1. Üst menüden **Select a project** → **New Project**
2. **Project Name:** `Belucha` (veya istediğiniz isim)
3. **Create** tıklayın
4. Proje seçildiğinden emin olun

### Adım 3: OAuth Consent Screen Yapılandırma

1. Sol menüden **APIs & Services** → **OAuth consent screen**
2. **User Type:** `External` seçin → **Create**
3. **App information** doldurun:
   - **App name:** `Belucha`
   - **User support email:** Email adresiniz
   - **Developer contact information:** Email adresiniz
4. **Save and Continue**
5. **Scopes:** Varsayılanları bırakın → **Save and Continue**
6. **Test users:** Şimdilik atlayın → **Save and Continue**
7. **Summary:** Kontrol edin → **Back to Dashboard**

---

## 🔑 OAuth 2.0 Credentials Oluşturma

### Adım 1: Credentials Oluştur

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth client ID**

### Adım 2: Application Type

1. **Application type:** `Web application`
2. **Name:** `Belucha Web Client`

### Adım 3: Authorized Redirect URIs

**Development için:**
```
http://localhost:3001/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
http://localhost:3002/api/auth/google/callback
```

**Production için:**
```
https://belucha-cms.railway.app/api/auth/google/callback
https://belucha-shop.vercel.app/api/auth/google/callback
https://belucha-sellercentral.vercel.app/api/auth/google/callback
```

**Not:** Production URL'lerini kendi domain'lerinizle değiştirin.

### Adım 4: Credentials Kaydetme

1. **Create** tıklayın
2. **Client ID** ve **Client Secret** görünecek
3. **Her ikisini de kopyalayın ve kaydedin!**

**Örnek:**
```
Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Client Secret: GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## 🔌 Payload CMS'e Entegrasyon

### Yöntem 1: Custom OAuth Endpoint (Önerilen)

Payload CMS'de Google OAuth için custom endpoint oluşturalım.

### Adım 1: Google OAuth Package Kurulumu

```bash
cd apps/cms/payload
npm install passport passport-google-oauth20 express-session
```

### Adım 2: OAuth Endpoint Oluşturma

**Dosya:** `apps/cms/payload/src/routes/auth.js` (yeni dosya)

```javascript
import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const router = express.Router();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Profile bilgileri
        const { id, displayName, emails, photos } = profile;
        const email = emails[0].value;
        const photo = photos[0].value;

        // Burada Payload CMS'e kullanıcı kaydedilecek
        // Şimdilik profile'ı döndürüyoruz
        return done(null, {
          googleId: id,
          email,
          name: displayName,
          photo,
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // OAuth başarılı, kullanıcıyı Payload CMS'e kaydet
    const { googleId, email, name, photo } = req.user;

    try {
      // Payload CMS'e kullanıcı kaydetme işlemi burada yapılacak
      // Şimdilik redirect ediyoruz
      res.redirect('/admin');
    } catch (error) {
      res.redirect('/login?error=oauth_failed');
    }
  }
);

export default router;
```

### Adım 3: Server.js'e Route Ekleme

**Dosya:** `apps/cms/payload/src/server.js`

```javascript
// ... existing imports
import authRoutes from './routes/auth.js';

// ... existing code

const app = express();

// Session middleware (OAuth için)
app.use(
  require('express-session')({
    secret: process.env.PAYLOAD_SECRET || 'beluchaSecret123',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/api/auth', authRoutes);

// ... rest of the code
```

### Adım 4: Environment Variables

**Dosya:** `apps/cms/payload/.env.local`

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

---

## 🛒 Shop ve Sellercentral'de Kullanım

### Shop App - Google Login

**Dosya:** `apps/shop/src/app/api/auth/google/route.js` (yeni dosya)

```javascript
import { NextResponse } from 'next/server';

export async function GET() {
  const cmsUrl = process.env.NEXT_PUBLIC_PAYLOAD_GRAPHQL_URL?.replace('/api/graphql', '') || 'http://localhost:3001';
  const googleAuthUrl = `${cmsUrl}/api/auth/google`;
  
  return NextResponse.redirect(googleAuthUrl);
}
```

**Login sayfasında Google butonu:**
```jsx
<Link href="/api/auth/google">
  <GoogleButton>
    <GoogleIcon />
    Continue with Google
  </GoogleButton>
</Link>
```

### Sellercentral App - Google Login

Aynı şekilde `apps/sellercentral/src/app/api/auth/google/route.js` oluşturun.

---

## 🧪 Test Etme

### Adım 1: CMS Başlatma

```bash
cd apps/cms/payload
npm run dev
```

### Adım 2: Google OAuth Test

1. `http://localhost:3001/api/auth/google` açın
2. Google login sayfasına yönlendirilmeli
3. Google hesabınızla giriş yapın
4. Callback'e dönmeli ve kullanıcı oluşturulmalı

### Adım 3: Shop'ta Test

1. Shop'ta login sayfasına gidin
2. "Continue with Google" butonuna tıklayın
3. Google OAuth flow'u başlamalı

---

## ⚠️ Önemli Notlar

1. **OAuth Consent Screen:**
   - Production'da Google'ın onayı gerekir
   - Test modunda sadece test kullanıcıları giriş yapabilir

2. **Redirect URIs:**
   - Tüm kullanılacak URL'leri ekleyin
   - Development ve production URL'leri farklı olmalı

3. **Client Secret:**
   - Asla commit etmeyin!
   - Environment variables'da saklayın

4. **Production:**
   - OAuth Consent Screen'i publish edin
   - Google'ın onayını bekleyin (1-7 gün)

---

## 📝 Checklist

- [ ] Google Cloud Console'da proje oluşturuldu
- [ ] OAuth Consent Screen yapılandırıldı
- [ ] OAuth 2.0 Credentials oluşturuldu
- [ ] Client ID ve Client Secret kaydedildi
- [ ] Authorized Redirect URIs eklendi
- [ ] Payload CMS'e OAuth endpoint eklendi
- [ ] Environment variables ayarlandı
- [ ] Shop ve Sellercentral'de Google login butonları eklendi
- [ ] Test edildi ve çalışıyor

---

**Son Güncelleme:** 2024  
**Durum:** Google OAuth kurulum rehberi hazır. Implementation yapılmalı.

