# Authentication Domain - Mevcut Durum Analizi

## 📋 İçindekiler
1. [Mevcut Auth Akışı Haritası](#mevcut-auth-akışı-haritası)
2. [Tekrarlanan Kodlar](#tekrarlanan-kodlar)
3. [Riskli Noktalar](#riskli-noktalar)
4. [Mimari İhlaller](#mimari-ihlaller)
5. [Önerilen Çözüm Yapısı](#önerilen-çözüm-yapısı)

---

## 🔍 Mevcut Auth Akışı Haritası

### 1. Shop App (Customer Authentication)

#### Akış Diyagramı:
```
User → Login Page → AuthContext.login() 
  → GraphQL: loginCustomers(email, password)
  → Payload CMS: JWT token + user data
  → localStorage.setItem("customerToken", token)
  → localStorage.setItem("customerUser", JSON.stringify(user))
  → Router.push("/")
```

#### Dosya Yapısı:
```
apps/shop/src/
├── contexts/
│   └── AuthContext.jsx          # Customer auth context
├── lib/
│   └── apollo-client.js         # Apollo client (customerToken kullanıyor)
├── app/
│   ├── login/page.jsx           # Login form
│   ├── register/page.jsx        # Register form
│   └── account/page.jsx         # Protected route
└── components/
    ├── ProtectedRoute.jsx        # Route guard
    └── Providers.jsx            # AuthProvider wrapper
```

#### GraphQL Mutations:
```graphql
# Login
mutation LoginCustomer($email: String!, $password: String!) {
  loginCustomers(email: $email, password: $password) {
    token
    user { id, email, firstName, lastName }
  }
}

# Register
mutation RegisterCustomer($data: JSON!) {
  createCustomers(data: $data) {
    id, email, firstName, lastName
  }
}
```

#### localStorage Keys:
- `customerToken` - JWT token
- `customerUser` - User object (JSON stringified)

#### Apollo Client Auth:
- Token: `localStorage.getItem("customerToken")`
- Header: `Authorization: Bearer ${token}`

---

### 2. Sellercentral App (Seller Authentication)

#### Akış Diyagramı:
```
User → Login Page → handleSubmit()
  → localStorage.setItem("sellerEmail", email)
  → localStorage.setItem("sellerLoggedIn", "true")
  → Router.push("/inventory")
  
User → Register Page → GraphQL: createSellers()
  → localStorage.setItem("sellerEmail", email)
  → localStorage.setItem("sellerId", id)
  → Router.push("/login")
```

#### Dosya Yapısı:
```
apps/sellercentral/src/
├── app/
│   ├── login/page.jsx           # Login form (FAKE AUTH!)
│   └── register/page.jsx           # Register form
├── components/
│   └── DashboardLayout.jsx      # Auth check + logout
└── (NO AuthContext!)
```

#### GraphQL Mutations:
```graphql
# Register (Login yok!)
mutation CreateSeller($data: JSON!) {
  createSellers(data: $data) {
    id, storeName, slug
  }
}
```

#### localStorage Keys:
- `sellerEmail` - Email address
- `sellerLoggedIn` - "true" string
- `sellerId` - Seller ID

#### Apollo Client Auth:
- **SORUN**: `packages/lib/src/apollo/client.js` `localStorage.getItem("token")` kullanıyor
- Sellercentral'da `token` key'i yok!
- Sellercentral'da JWT token yok!

---

### 3. Payload CMS (Backend)

#### Collections:
```javascript
// Sellers Collection
{
  slug: 'sellers',
  auth: true,  // ✅ Auth enabled
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user) {
        return { id: { equals: user.id } }
      }
      return false
    }
  }
}

// Customers Collection
{
  slug: 'customers',
  auth: true,  // ✅ Auth enabled
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => {
      if (user) {
        return { id: { equals: user.id } }
      }
      return false
    }
  }
}
```

#### Auth Endpoints:
- `POST /api/customers/login` - Customer login (JWT token döner)
- `POST /api/sellers/login` - Seller login (JWT token döner)
- `POST /api/customers` - Customer register
- `POST /api/sellers` - Seller register

---

## 🔄 Tekrarlanan Kodlar

### 1. localStorage Erişimi (3 Farklı Yer)

#### Shop App:
```javascript
// apps/shop/src/contexts/AuthContext.jsx
localStorage.getItem("customerToken")
localStorage.getItem("customerUser")
localStorage.setItem("customerToken", token)
localStorage.setItem("customerUser", JSON.stringify(user))
localStorage.removeItem("customerToken")
localStorage.removeItem("customerUser")

// apps/shop/src/lib/apollo-client.js
localStorage.getItem("customerToken")
```

#### Sellercentral App:
```javascript
// apps/sellercentral/src/app/login/page.jsx
localStorage.setItem("sellerEmail", email)
localStorage.setItem("sellerLoggedIn", "true")

// apps/sellercentral/src/app/register/page.jsx
localStorage.setItem("sellerEmail", email)
localStorage.setItem("sellerId", id)

// apps/sellercentral/src/components/DashboardLayout.jsx
localStorage.getItem("sellerId")
localStorage.getItem("sellerLoggedIn")
localStorage.removeItem("sellerLoggedIn")
localStorage.removeItem("sellerEmail")
localStorage.removeItem("sellerId")

// apps/sellercentral/src/components/pages/ProductsPage.jsx
localStorage.getItem("sellerId")

// apps/sellercentral/src/components/pages/products/SingleUploadPage.jsx
localStorage.getItem("sellerId")  // 2 kez!

// apps/sellercentral/src/components/pages/ProfilePage.jsx
localStorage.getItem("sellerEmail")
```

#### Shared Apollo Client:
```javascript
// packages/lib/src/apollo/client.js
localStorage.getItem("token")  // ❌ Hangi token? Customer mı Seller mı?
```

**Toplam**: 15+ farklı yerde localStorage direkt kullanılıyor!

---

### 2. Authentication Check Logic (2 Farklı Yer)

#### Shop App:
```javascript
// apps/shop/src/contexts/AuthContext.jsx
useEffect(() => {
  const storedToken = localStorage.getItem("customerToken");
  const storedUser = localStorage.getItem("customerUser");
  if (storedToken && storedUser) {
    setToken(storedToken);
    setUser(JSON.parse(storedUser));
  }
  setLoading(false);
}, []);

// apps/shop/src/components/ProtectedRoute.jsx
const { isAuthenticated, loading } = useAuth();
if (!loading && !isAuthenticated) {
  router.push("/login");
}
```

#### Sellercentral App:
```javascript
// apps/sellercentral/src/components/DashboardLayout.jsx
useEffect(() => {
  if (pathname === "/login" || pathname === "/register") {
    return;
  }
  const loggedIn = localStorage.getItem("sellerLoggedIn");
  if (!loggedIn) {
    router.push("/login");
  } else {
    setIsAuthenticated(true);
  }
}, [pathname, router]);
```

**Fark**: Shop app Context API kullanıyor, Sellercentral direkt localStorage check yapıyor!

---

### 3. Logout Logic (2 Farklı Yer)

#### Shop App:
```javascript
// apps/shop/src/contexts/AuthContext.jsx
const logout = () => {
  setUser(null);
  setToken(null);
  localStorage.removeItem("customerToken");
  localStorage.removeItem("customerUser");
  router.push("/");
};
```

#### Sellercentral App:
```javascript
// apps/sellercentral/src/components/DashboardLayout.jsx
const handleLogout = () => {
  localStorage.removeItem("sellerLoggedIn");
  localStorage.removeItem("sellerEmail");
  localStorage.removeItem("sellerId");
  router.push("/login");
};
```

**Fark**: Farklı localStorage key'leri, farklı redirect path'leri!

---

### 4. Apollo Client Auth Link (2 Farklı Yer)

#### Shop App:
```javascript
// apps/shop/src/lib/apollo-client.js
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("customerToken") 
    : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});
```

#### Shared Package:
```javascript
// packages/lib/src/apollo/client.js
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("token")  // ❌ Hangi token?
    : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});
```

**SORUN**: Shared package `token` key'ini kullanıyor ama hiçbir app'te `token` key'i yok!

---

## ⚠️ Riskli Noktalar

### 1. Sellercentral'da FAKE Authentication (KRİTİK)

**Lokasyon**: `apps/sellercentral/src/app/login/page.jsx`

```javascript
// Basit authentication - production'da gerçek auth kullanılmalı
// Şimdilik herhangi bir email/password ile giriş yapılabilir
localStorage.setItem("sellerEmail", formData.email);
localStorage.setItem("sellerLoggedIn", "true");
```

**Risk**:
- ❌ Password kontrolü yok!
- ❌ JWT token yok!
- ❌ Backend authentication yok!
- ❌ Herkes herhangi bir email ile giriş yapabilir!
- ❌ Seller ID kontrolü yok!

**Etki**: Güvenlik açığı - herkes seller olarak giriş yapabilir!

---

### 2. Token Formatı Tutarsızlığı (YÜKSEK RİSK)

**Sorun**:
- Shop app: `customerToken` key'i kullanıyor
- Sellercentral app: Token yok!
- Shared Apollo client: `token` key'i bekliyor (ama hiçbir yerde yok!)

**Risk**:
- Shared Apollo client çalışmıyor (token bulamıyor)
- Token formatı değişirse 3 yerde değişiklik gerekir
- Token refresh logic yok

---

### 3. localStorage Direkt Erişim (YÜKSEK RİSK)

**Sorun**: 15+ farklı yerde `localStorage` direkt kullanılıyor.

**Risk**:
- XSS attack ile token çalınabilir
- Token formatı değişirse tüm yerler güncellenmeli
- Token expiration kontrolü yok
- Token refresh yok
- HttpOnly cookie kullanılmıyor

**Mimari İhlal**: `docs/architecture.md` Rule 1: "LocalStorage'a direkt erişim yasak, service üzerinden gitmeli"

---

### 4. Role-Based Access Control Yok (YÜKSEK RİSK)

**Sorun**: 
- Shop app'te Customer auth var ama Seller auth kontrolü yok
- Sellercentral'da Seller auth var ama Customer auth kontrolü yok
- Karışık kullanım mümkün (Seller, shop app'ten login olabilir)

**Risk**:
- Seller, shop app'ten customer gibi davranabilir
- Customer, sellercentral'a erişmeye çalışabilir
- Role kontrolü yok

**Mimari İhlal**: `docs/architecture.md` Rule 1: "Shop app: Sadece Customer auth kullanabilir, Sellercentral app: Sadece Seller auth kullanabilir"

---

### 5. Token Refresh Yok (ORTA RİSK)

**Sorun**: JWT token'lar expire olabilir ama refresh logic yok.

**Risk**:
- Token expire olunca kullanıcı logout olur
- Kullanıcı deneyimi kötü
- Session management yok

---

### 6. Seller Registration'da Password Hash Yok (KRİTİK)

**Lokasyon**: `apps/sellercentral/src/app/register/page.jsx`

```javascript
const sellerData = {
  storeName: formData.storeName,
  slug: slug,
  status: "pending",
  // ❌ Email ve password gönderilmiyor!
};
```

**Sorun**: 
- Email ve password GraphQL mutation'a gönderilmiyor
- Seller collection'da `auth: true` var ama password field yok!
- Seller login yapılamıyor çünkü password yok!

**Etki**: Seller registration çalışmıyor, login yapılamıyor!

---

### 7. Apollo Client Token Key Tutarsızlığı (ORTA RİSK)

**Sorun**:
- Shop app: `customerToken` kullanıyor (kendi Apollo client'ı var)
- Sellercentral: Token yok (shared Apollo client kullanıyor ama token key'i yanlış)
- Shared package: `token` key'i bekliyor (ama hiçbir yerde yok)

**Etki**: Sellercentral'da GraphQL auth çalışmıyor!

---

### 8. Protected Route Logic Farklı (ORTA RİSK)

**Sorun**:
- Shop app: `ProtectedRoute` component kullanıyor
- Sellercentral: `DashboardLayout` içinde auth check yapıyor

**Risk**:
- Farklı implementasyonlar, farklı bug'lar
- Tutarsız kullanıcı deneyimi

---

## 🚨 Mimari İhlaller

### İhlal 1: Authentication Separation Rule

**Kural** (`docs/architecture.md`):
```
❌ YASAK:
- Shop app'ten Seller auth yapma
- Seller app'ten Customer auth yapma
- Token'ları karıştırma

✅ DOĞRU:
- Her domain kendi collection'ı
- Shared auth package kullan
- Role-based middleware
```

**Mevcut Durum**:
- ❌ Shop app'te Customer auth var ama Seller auth kontrolü yok
- ❌ Sellercentral'da Seller auth var ama Customer auth kontrolü yok
- ❌ Shared auth package yok
- ❌ Role-based middleware yok

---

### İhlal 2: LocalStorage Direkt Erişim

**Kural** (`docs/architecture.md`):
```
LocalStorage'a direkt erişim yasak, service üzerinden gitmeli
```

**Mevcut Durum**:
- ❌ 15+ farklı yerde localStorage direkt kullanılıyor
- ❌ Token service yok

---

### İhlal 3: Business Logic Frontend'te

**Kural** (`docs/architecture.md`):
```
❌ YASAK:
- Frontend'te business logic yapma

✅ DOĞRU:
- Kritik logic CMS hooks'ta
```

**Mevcut Durum**:
- ❌ Seller registration'da password hash frontend'te yapılmıyor (zaten yok!)
- ❌ Token validation frontend'te yok
- ❌ Auth logic her app'te duplicate

---

## 📊 Özet Tablo

| Özellik | Shop App | Sellercentral App | Shared Package | Durum |
|---------|----------|-------------------|----------------|-------|
| Auth Context | ✅ Var | ❌ Yok | ❌ Yok | ❌ Duplicate |
| Login Logic | ✅ GraphQL | ❌ Fake (localStorage) | ❌ Yok | ❌ Farklı |
| Register Logic | ✅ GraphQL | ⚠️ GraphQL (password yok) | ❌ Yok | ⚠️ Eksik |
| Logout Logic | ✅ Var | ✅ Var | ❌ Yok | ❌ Duplicate |
| Token Storage | ✅ customerToken | ❌ Yok | ❌ token (yanlış) | ❌ Tutarsız |
| Protected Routes | ✅ Component | ✅ Layout içinde | ❌ Yok | ❌ Farklı |
| Role Check | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Eksik |
| Token Refresh | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Eksik |
| Token Service | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Eksik |

---

## 🎯 Önerilen Çözüm Yapısı

### Hedef Yapı (Mimari Dokümantasyona Uygun):

```
packages/lib/auth/
├── AuthContext.jsx          # Shared context (role-aware)
├── useAuth.js               # Shared hook
├── tokenService.js          # Token management (localStorage abstraction)
├── roleGuards.js            # Role-based guards
├── customerAuth.js          # Customer-specific auth
├── sellerAuth.js            # Seller-specific auth
└── index.js                 # Public API
```

### Migration Planı:

1. **Token Service Oluştur** (`packages/lib/auth/tokenService.js`)
   - localStorage abstraction
   - Token get/set/remove
   - Token validation
   - Token refresh logic

2. **Auth Context Oluştur** (`packages/lib/auth/AuthContext.jsx`)
   - Role-aware context
   - Customer ve Seller desteği
   - Shared login/logout/register

3. **Role Guards Oluştur** (`packages/lib/auth/roleGuards.js`)
   - `useCustomerAuth()` hook
   - `useSellerAuth()` hook
   - `ProtectedCustomerRoute` component
   - `ProtectedSellerRoute` component

4. **Shop App Migration**
   - `AuthContext` → `packages/lib/auth` kullan
   - `localStorage` → `tokenService` kullan
   - `ProtectedRoute` → `ProtectedCustomerRoute` kullan

5. **Sellercentral App Migration**
   - Fake auth → Gerçek GraphQL auth
   - `localStorage` → `tokenService` kullan
   - `DashboardLayout` auth check → `ProtectedSellerRoute` kullan

6. **Apollo Client Fix**
   - Shared Apollo client'ı role-aware yap
   - Token service kullan

---

## 📝 Sonraki Adımlar

1. ✅ **Analiz Tamamlandı** (Bu dosya)
2. ⏭️ **Token Service Oluştur** (`packages/lib/auth/tokenService.js`)
3. ⏭️ **Auth Context Oluştur** (`packages/lib/auth/AuthContext.jsx`)
4. ⏭️ **Role Guards Oluştur** (`packages/lib/auth/roleGuards.js`)
5. ⏭️ **Shop App Migration**
6. ⏭️ **Sellercentral App Migration**
7. ⏭️ **Apollo Client Fix**
8. ⏭️ **Test & Validation**

---

**Son Güncelleme**: 2026-01-04
**Analiz Versiyonu**: 1.0.0

