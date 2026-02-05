"use client";

import React from "react";
import styled from "styled-components";
import { Card } from "@belucha/ui";

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #d1d5db;
  margin: 0;
`;

const Section = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

export default function PlatformSettingsPage() {
  return (
    <Container>
      <Header>
        <Title>Platform Settings</Title>
        <Subtitle>Global platform configuration and settings</Subtitle>
      </Header>

      <Section>
        <h2 style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
          Platform Settings
        </h2>
        <p style={{ color: "#6b7280" }}>Platform settings coming soon.</p>
      </Section>
    </Container>
  );
}
