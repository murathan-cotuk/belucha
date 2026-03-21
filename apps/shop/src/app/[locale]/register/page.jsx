"use client";

import React, { useState } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import styled from "styled-components";
import { useMedusaAuth } from "@/hooks/useMedusaAuth";
import { useCustomerAuth as useAuth, useAuthGuard } from "@belucha/lib";

/* ── Styled components ─────────────────────────────────────────────────── */
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 24px;
  position: relative;
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 700;
  color: #0ea5e9;
  font-family: "Manrope", sans-serif;
  letter-spacing: 0.05em;
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover { color: #0284c7; }
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  max-height: 92vh;
  overflow-y: auto;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-align: center;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  background: white;
  transition: border-color 0.15s;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
  &::placeholder { color: #9ca3af; }
`;

const Select = styled.select`
  width: 100%;
  padding: 11px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  &:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,.1); }
`;

const PasswordWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const ShowHideBtn = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  &:hover { text-decoration: underline; }
  &:focus { outline: none; }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover:not(:disabled) { background: #5568d3; transform: translateY(-1px); box-shadow: 0 4px 8px rgba(102,126,234,.3); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  color: #9ca3af;
  font-size: 0.875rem;
  &::before, &::after { content: ""; flex: 1; height: 1px; background: #e5e7eb; }
  span { padding: 0 16px; }
`;

const LoginLink = styled(Link)`
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
  &:hover { color: #5568d3; text-decoration: underline; }
`;

const ErrorBox = styled.div`
  width: 100%;
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
`;

const SectionLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;

/* ── Account type toggle ───────────────────────────────────────────────── */
const TypeToggle = styled.div`
  display: flex;
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
`;

const TypeBtn = styled.button`
  flex: 1;
  padding: 11px 0;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  background: ${p => p.$active ? '#667eea' : '#fff'};
  color: ${p => p.$active ? '#fff' : '#6b7280'};
  &:hover:not(:disabled) {
    background: ${p => p.$active ? '#5568d3' : '#f3f4f6'};
  }
`;

/* ── Monkey avatar ─────────────────────────────────────────────────────── */
const Avatar = styled.div`
  --sz: 100px;
  width: var(--sz); height: var(--sz);
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  --sz-svg: calc(var(--sz) - 10px);
  svg { position: absolute; height: var(--sz-svg); width: var(--sz-svg); pointer-events: none; }
  svg#mh {
    transform-style: preserve-3d;
    transform: ${p => p.$blind ? 'translate3d(0,0,0) rotateX(0deg)' : 'translateY(calc(var(--sz)/1.25)) rotateX(-21deg)'};
    transition: transform 0.2s ease;
    z-index: 2;
  }
`;

const MonkeyAvatar = ({ blind }) => (
  <Avatar $blind={blind}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="mk">
      <ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"/>
      <ellipse cx="53.7" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"/>
      <ellipse cx="10.2" cy="33" rx="8.2" ry="8.2" fill="#89664c"/>
      <ellipse cx="10.2" cy="33" rx="5.4" ry="5.4" fill="#ffc5d3"/>
      <path d="m43.4 10.8c1.1-.6 1.9-.9 1.9-.9-3.2-1.1-6-1.8-8.5-2.1 1.3-1 2.1-1.3 2.1-1.3-20.4-2.9-30.1 9-30.1 19.5h46.4c-.7-7.4-4.8-12.4-11.8-15.2" fill="#89664c"/>
      <path d="m55.3 27.6c0-9.7-10.4-17.6-23.3-17.6s-23.3 7.9-23.3 17.6c0 2.3.6 4.4 1.6 6.4-1 2-1.6 4.2-1.6 6.4 0 9.7 10.4 17.6 23.3 17.6s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4 1-2 1.6-4.2 1.6-6.4" fill="#89664c"/>
      <path d="m52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7-1.3 1.7-2.1 3.6-2.1 5.7 0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7 4.4-2.7 7.3-7 7.3-11.7" fill="#e0ac7e"/>
      <path d="m35.1 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.6.1 1 1 1 2.1" fill="#3b302a"/>
      <path d="m30.9 38.7c0 1.1-.4 2.1-1 2.1-.6 0-1-.9-1-2.1 0-1.1.4-2.1 1-2.1.5.1 1 1 1 2.1" fill="#3b302a"/>
      <ellipse cx="40.7" cy={blind ? "30" : "31.7"} rx="3.5" ry={blind ? "0.5" : "4.5"} fill="#3b302a"/>
      <ellipse cx="23.3" cy={blind ? "30" : "31.7"} rx="3.5" ry={blind ? "0.5" : "4.5"} fill="#3b302a"/>
    </svg>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="mh">
      <path fill="#89664C" d="M9.4,32.5L2.1,61.9H14c-1.6-7.7,4-21,4-21L9.4,32.5z"/>
      <path fill="#FFD6BB" d="M15.8,24.8c0,0,4.9-4.5,9.5-3.9c2.3,0.3-7.1,7.6-7.1,7.6s9.7-8.2,11.7-5.6c1.8,2.3-8.9,9.8-8.9,9.8s10-8.1,9.6-4.6c-0.3,3.8-7.9,12.8-12.5,13.8C11.5,43.2,6.3,39,9.8,24.4C11.6,17,13.3,25.2,15.8,24.8"/>
      <path fill="#89664C" d="M54.8,32.5l7.3,29.4H50.2c1.6-7.7-4-21-4-21L54.8,32.5z"/>
      <path fill="#FFD6BB" d="M48.4,24.8c0,0-4.9-4.5-9.5-3.9c-2.3,0.3,7.1,7.6,7.1,7.6s-9.7-8.2-11.7-5.6c-1.8,2.3,8.9,9.8,8.9,9.8s-10-8.1-9.7-4.6c0.4,3.8,8,12.8,12.6,13.8c6.6,1.3,11.8-2.9,8.3-17.5C52.6,17,50.9,25.2,48.4,24.8"/>
    </svg>
  </Avatar>
);

/* ── Component ──────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  useAuthGuard({ requiredRole: 'customer', redirectTo: '/', redirectIfAuthenticated: true });

  const [accountType, setAccountType] = useState("privat");
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    gender: "", birthDate: "",
    address: "", addressLine2: "", zipCode: "", city: "", country: "DE",
    companyName: "", vatNumber: "",
    billingSameAsShipping: true,
    billingAddress: "", billingZipCode: "", billingCity: "", billingCountry: "DE",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const { register: registerMedusa, login: loginMedusa, loading } = useMedusaAuth();

  const set = (key) => (e) => setFormData(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) { setError("E-Mail und Passwort sind erforderlich."); return; }
    if (formData.password.length < 6) { setError("Das Passwort muss mindestens 6 Zeichen lang sein."); return; }
    if (accountType === "gewerbe" && !formData.companyName.trim()) { setError("Firmenname ist erforderlich."); return; }

    try {
      const extra = {
        account_type: accountType,
        phone: formData.phone,
        gender: formData.gender,
        birth_date: formData.birthDate || undefined,
        address_line1: formData.address,
        address_line2: formData.addressLine2,
        zip_code: formData.zipCode,
        city: formData.city,
        country: formData.country,
        company_name: formData.companyName || undefined,
        vat_number: formData.vatNumber || undefined,
        billing_address_line1: formData.billingSameAsShipping !== false ? undefined : (formData.billingAddress || undefined),
        billing_zip_code: formData.billingSameAsShipping !== false ? undefined : (formData.billingZipCode || undefined),
        billing_city: formData.billingSameAsShipping !== false ? undefined : (formData.billingCity || undefined),
        billing_country: formData.billingSameAsShipping !== false ? undefined : (formData.billingCountry || undefined),
      };
      const registerResult = await registerMedusa(formData.email, formData.password, formData.firstName, formData.lastName, extra);
      if (!registerResult?.customer) { setError("Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut."); return; }

      const loginResult = await loginMedusa(formData.email, formData.password);
      if (loginResult?.customer?.id) {
        const token = loginResult.access_token || loginResult.token;
        if (token) { login(token, loginResult.customer.id); router.push("/"); router.refresh(); }
        else setError("Registrierung erfolgreich. Bitte melden Sie sich an.");
      } else {
        setError("Registrierung erfolgreich. Bitte melden Sie sich an.");
      }
    } catch (err) {
      setError(err.message || "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <Container>
      <LogoContainer><Logo href="/">Belucha</Logo></LogoContainer>
      <Card>
        <MonkeyAvatar blind={!showPassword} />
        <Title>Konto erstellen</Title>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Form onSubmit={handleSubmit}>
          {/* Account type toggle */}
          <FormGroup>
            <Label>Kontotyp</Label>
            <TypeToggle>
              <TypeBtn type="button" $active={accountType === "privat"} onClick={() => setAccountType("privat")}>
                👤 Privatkunde
              </TypeBtn>
              <TypeBtn type="button" $active={accountType === "gewerbe"} onClick={() => setAccountType("gewerbe")}>
                🏢 Geschäftskunde
              </TypeBtn>
            </TypeToggle>
          </FormGroup>

          {/* Business fields — only for Gewerbe */}
          {accountType === "gewerbe" && (
            <>
              <SectionLabel>Unternehmensdaten</SectionLabel>
              <FormGroup>
                <Label htmlFor="companyName">Firmenname *</Label>
                <Input id="companyName" value={formData.companyName} onChange={set("companyName")} placeholder="Muster GmbH" required />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="vatNumber">USt-IdNr. (optional)</Label>
                <Input id="vatNumber" value={formData.vatNumber} onChange={set("vatNumber")} placeholder="DE123456789" />
              </FormGroup>
              <SectionLabel>Ansprechpartner</SectionLabel>
            </>
          )}

          {/* Name */}
          <Row>
            <FormGroup>
              <Label htmlFor="firstName">Vorname *</Label>
              <Input id="firstName" value={formData.firstName} onChange={set("firstName")} placeholder="Max" required />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="lastName">Nachname *</Label>
              <Input id="lastName" value={formData.lastName} onChange={set("lastName")} placeholder="Mustermann" required />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label htmlFor="gender">Geschlecht</Label>
              <Select id="gender" value={formData.gender} onChange={set("gender")}>
                <option value="">Bitte wählen</option>
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
                <option value="diverse">Divers</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor="birthDate">Geburtsdatum</Label>
              <Input type="date" id="birthDate" value={formData.birthDate} onChange={set("birthDate")} />
            </FormGroup>
          </Row>

          {/* Contact */}
          <FormGroup>
            <Label htmlFor="email">E-Mail *</Label>
            <Input type="email" id="email" value={formData.email} onChange={set("email")} placeholder="ihre@email.de" required autoComplete="email" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input type="tel" id="phone" value={formData.phone} onChange={set("phone")} placeholder="+49 123 456789" autoComplete="tel" />
          </FormGroup>

          {/* Address */}
          <SectionLabel>Lieferadresse</SectionLabel>
          <FormGroup>
            <Label htmlFor="address">Straße und Hausnummer</Label>
            <Input id="address" value={formData.address} onChange={set("address")} placeholder="Musterstraße 1" autoComplete="street-address" />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label htmlFor="zipCode">PLZ</Label>
              <Input id="zipCode" value={formData.zipCode} onChange={set("zipCode")} placeholder="12345" autoComplete="postal-code" />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="city">Stadt</Label>
              <Input id="city" value={formData.city} onChange={set("city")} placeholder="Berlin" autoComplete="address-level2" />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label htmlFor="country">Land</Label>
            <Select id="country" value={formData.country} onChange={set("country")} autoComplete="country">
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
              <option value="TR">Türkiye</option>
              <option value="FR">France</option>
              <option value="IT">Italia</option>
              <option value="ES">España</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
            </Select>
          </FormGroup>

          {/* Billing address */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <input
              type="checkbox"
              id="billingSame"
              checked={formData.billingSameAsShipping !== false}
              onChange={e => setFormData(f => ({ ...f, billingSameAsShipping: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="billingSame" style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>
              Rechnungsadresse = Lieferadresse
            </label>
          </div>

          {formData.billingSameAsShipping === false && (
            <>
              <SectionLabel>Rechnungsadresse</SectionLabel>
              <FormGroup>
                <Label htmlFor="billingAddress">Straße und Hausnummer</Label>
                <Input id="billingAddress" value={formData.billingAddress || ""} onChange={set("billingAddress")} placeholder="Musterstraße 1" />
              </FormGroup>
              <Row>
                <FormGroup>
                  <Label htmlFor="billingZipCode">PLZ</Label>
                  <Input id="billingZipCode" value={formData.billingZipCode || ""} onChange={set("billingZipCode")} placeholder="12345" />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="billingCity">Stadt</Label>
                  <Input id="billingCity" value={formData.billingCity || ""} onChange={set("billingCity")} placeholder="Berlin" />
                </FormGroup>
              </Row>
              <FormGroup>
                <Label htmlFor="billingCountry">Land</Label>
                <Select id="billingCountry" value={formData.billingCountry || "DE"} onChange={set("billingCountry")}>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="TR">Türkiye</option>
                  <option value="FR">France</option>
                  <option value="IT">Italia</option>
                  <option value="ES">España</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                </Select>
              </FormGroup>
            </>
          )}

          {/* Password */}
          <FormGroup>
            <Label htmlFor="password">Passwort * (min. 6 Zeichen)</Label>
            <PasswordWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={set("password")}
                placeholder="Ihr Passwort"
                style={{ paddingRight: 88 }}
                required
                autoComplete="new-password"
              />
              <ShowHideBtn type="button" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? "Verbergen" : "Anzeigen"}
              </ShowHideBtn>
            </PasswordWrapper>
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "Wird registriert…" : "Konto erstellen"}
          </SubmitButton>

          <Divider><span>oder</span></Divider>

          <button
            type="button"
            style={{ width: "100%", padding: 14, background: "white", color: "#374151", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: "1rem", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Mit Google registrieren
          </button>
        </Form>

        <LoginLink href="/login">Bereits ein Konto? Anmelden</LoginLink>
      </Card>
    </Container>
  );
}
