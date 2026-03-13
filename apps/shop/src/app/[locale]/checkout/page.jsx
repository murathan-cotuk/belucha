"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import ShopHeader from "@/components/ShopHeader";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { formatPriceCents } from "@/lib/format";
import { resolveImageUrl } from "@/lib/image-url";
import { Link } from "@/i18n/navigation";
import { tokens } from "@/design-system/tokens";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${tokens.background.main};
  padding-top: calc(${tokens.navbar.height} + ${tokens.topBar.height});
`;

const Main = styled.main`
  flex: 1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 24px 64px;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 32px;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: flex-start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: ${(p) => p.$cols || "1fr"};
  gap: 16px;
  margin-bottom: 16px;
`;

const FieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${(p) => (p.$error ? "#ef4444" : "#d1d5db")};
  border-radius: 8px;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #111827;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
  &:focus { border-color: ${tokens.primary.DEFAULT}; }
`;

const ErrorMsg = styled.span`
  font-size: 0.75rem;
  color: #ef4444;
`;

const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  position: sticky;
  top: 64px;
`;

const SummaryTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px;
`;

const SummaryItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const SummaryThumb = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const SummaryItemDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const SummaryItemTitle = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SummaryItemQty = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const SummaryItemPrice = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 16px 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
  color: #4b5563;
  margin-bottom: 8px;
`;

const SummaryTotal = styled(SummaryRow)`
  font-weight: 700;
  font-size: 1.0625rem;
  color: #111827;
  margin-top: 4px;
`;

const PayBtn = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: ${tokens.primary.DEFAULT};
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: ${tokens.primary.hover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 16px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  text-decoration: none;
  margin-bottom: 24px;
  &:hover { color: #374151; }
`;

function useField(initial = "") {
  const [value, setValue] = useState(initial);
  const [touched, setTouched] = useState(false);
  return { value, touched, onChange: (e) => setValue(e.target.value), onBlur: () => setTouched(true), reset: () => { setValue(initial); setTouched(false); } };
}

function CheckoutForm({ clientSecret, cartId, items, subtotalCents }) {
  const t = useTranslations("checkout");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "de";
  const { setCart } = useCart();

  const email = useField("");
  const firstName = useField("");
  const lastName = useField("");
  const phone = useField("");
  const address = useField("");
  const address2 = useField("");
  const city = useField("");
  const postalCode = useField("");
  const country = useField("DE");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const required = (field) => field.touched && !field.value.trim();
  const invalidEmail = email.touched && !validateEmail(email.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Mark all as touched for validation display
    [email, firstName, lastName, address, city, postalCode, country].forEach((f) => f.onBlur());

    if (!email.value.trim() || !validateEmail(email.value) || !firstName.value.trim() || !lastName.value.trim() || !address.value.trim() || !city.value.trim() || !postalCode.value.trim()) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || t("paymentError"));
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const res = await fetch("/api/store-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart_id: cartId,
            payment_intent_id: paymentIntent.id,
            email: email.value.trim(),
            first_name: firstName.value.trim(),
            last_name: lastName.value.trim(),
            phone: phone.value.trim(),
            address_line1: address.value.trim(),
            address_line2: address2.value.trim(),
            city: city.value.trim(),
            postal_code: postalCode.value.trim(),
            country: country.value.trim(),
          }),
        });
        const data = await res.json();
        const orderId = data?.order?.id;
        if (orderId) {
          if (typeof window !== "undefined") {
            try { window.localStorage.removeItem("belucha_cart_id"); } catch (_) {}
          }
          setCart(null);
          router.push(`/${locale}/order/${orderId}`);
        }
      } catch (err) {
        setError(err?.message || t("paymentError"));
      }
    }
    setProcessing(false);
  };

  const Field = ({ label, field, type = "text", placeholder, fullWidth, validate }) => {
    const isRequired = !fullWidth ? required(field) : (field.touched && !field.value.trim());
    const isInvalid = validate ? (field.touched && !validate(field.value)) : isRequired;
    return (
      <FieldWrap style={fullWidth ? { gridColumn: "1/-1" } : {}}>
        <Label>{label}</Label>
        <Input
          type={type}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder}
          $error={isInvalid}
          autoComplete="off"
        />
        {isInvalid && <ErrorMsg>{validate && !required(field) ? t("invalidEmail") : t("requiredField")}</ErrorMsg>}
      </FieldWrap>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormCard style={{ marginBottom: 24 }}>
        <SectionTitle>{t("contactInfo")}</SectionTitle>
        <FieldGrid>
          <Field label={t("email")} field={email} type="email" validate={validateEmail} />
          <Field label={t("phone")} field={phone} type="tel" />
        </FieldGrid>
        <FieldGrid $cols="1fr 1fr">
          <Field label={t("firstName")} field={firstName} />
          <Field label={t("lastName")} field={lastName} />
        </FieldGrid>
      </FormCard>

      <FormCard style={{ marginBottom: 24 }}>
        <SectionTitle>{t("shippingAddress")}</SectionTitle>
        <FieldGrid>
          <Field label={t("address")} field={address} fullWidth />
          <Field label={t("address2")} field={address2} fullWidth />
        </FieldGrid>
        <FieldGrid $cols="1fr 1fr">
          <Field label={t("postalCode")} field={postalCode} />
          <Field label={t("city")} field={city} />
        </FieldGrid>
        <FieldGrid>
          <FieldWrap>
            <Label>{t("country")}</Label>
            <select
              value={country.value}
              onChange={(e) => country.onChange({ target: { value: e.target.value } })}
              style={{
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                fontSize: "0.9375rem",
                fontFamily: "inherit",
                color: "#111827",
                background: "#fff",
              }}
            >
              <option value="DE">Deutschland</option>
              <option value="AT">Österreich</option>
              <option value="CH">Schweiz</option>
              <option value="TR">Türkiye</option>
              <option value="FR">France</option>
              <option value="IT">Italia</option>
              <option value="ES">España</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
            </select>
          </FieldWrap>
        </FieldGrid>
      </FormCard>

      <FormCard>
        <SectionTitle>{t("payment")}</SectionTitle>
        <PaymentElement />
        {error && <ErrorBox>{error}</ErrorBox>}
        <PayBtn type="submit" disabled={!stripe || !elements || processing}>
          {processing ? t("processing") : `${t("placeOrder")} – ${formatPriceCents(subtotalCents)} €`}
        </PayBtn>
      </FormCard>
    </form>
  );
}

let stripePromise = null;
function getStripe() {
  if (!stripePromise && STRIPE_PK) {
    stripePromise = loadStripe(STRIPE_PK);
  }
  return stripePromise;
}

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { cart, subtotalCents } = useCart();
  const items = cart?.items || [];

  const [clientSecret, setClientSecret] = useState(null);
  const [loadingPI, setLoadingPI] = useState(false);
  const [piError, setPiError] = useState(null);

  useEffect(() => {
    if (!cart?.id || items.length === 0 || !STRIPE_PK) return;
    setLoadingPI(true);
    setPiError(null);
    fetch("/api/store-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart_id: cart.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          setPiError(data?.message || t("configError"));
        }
      })
      .catch(() => setPiError(t("configError")))
      .finally(() => setLoadingPI(false));
  }, [cart?.id]);

  const stripeInstance = getStripe();

  return (
    <PageWrap>
      <ShopHeader />
      <Main>
        <BackLink href="/cart">
          <i className="fas fa-arrow-left" style={{ fontSize: 13 }} /> {t("backToCart")}
        </BackLink>
        <Title>{t("title")}</Title>

        {!STRIPE_PK ? (
          <ErrorBox style={{ maxWidth: 540 }}>{t("configError")}</ErrorBox>
        ) : items.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: "1rem" }}>
            <Link href="/cart" style={{ color: tokens.primary.DEFAULT }}>{t("backToCart")}</Link>
          </div>
        ) : (
          <Layout>
            <div>
              {piError && <ErrorBox style={{ marginBottom: 24 }}>{piError}</ErrorBox>}
              {loadingPI && <p style={{ color: "#6b7280" }}>{t("processing")}</p>}
              {clientSecret && stripeInstance && (
                <Elements
                  stripe={stripeInstance}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: tokens.primary.DEFAULT,
                        fontFamily: tokens.fontFamily.sans,
                        borderRadius: "8px",
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    cartId={cart.id}
                    items={items}
                    subtotalCents={subtotalCents}
                  />
                </Elements>
              )}
            </div>

            <SummaryCard>
              <SummaryTitle>{t("orderSummary")}</SummaryTitle>
              {items.map((item) => (
                <SummaryItem key={item.id}>
                  <SummaryThumb>
                    {item.thumbnail ? (
                      <img src={resolveImageUrl(item.thumbnail)} alt={item.title || ""} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#e5e7eb" }} />
                    )}
                  </SummaryThumb>
                  <SummaryItemDetails>
                    <SummaryItemTitle>{item.title}</SummaryItemTitle>
                    <SummaryItemQty>× {item.quantity}</SummaryItemQty>
                  </SummaryItemDetails>
                  <SummaryItemPrice>
                    {formatPriceCents((item.unit_price_cents || 0) * (item.quantity || 1))} €
                  </SummaryItemPrice>
                </SummaryItem>
              ))}
              <Divider />
              <SummaryRow>
                <span>{t("subtotal")}</span>
                <span>{formatPriceCents(subtotalCents)} €</span>
              </SummaryRow>
              <SummaryRow>
                <span>{t("shipping")}</span>
                <span>{t("freeShipping")}</span>
              </SummaryRow>
              <SummaryTotal>
                <span>{t("total")}</span>
                <span>{formatPriceCents(subtotalCents)} €</span>
              </SummaryTotal>
            </SummaryCard>
          </Layout>
        )}
      </Main>
      <Footer />
    </PageWrap>
  );
}
