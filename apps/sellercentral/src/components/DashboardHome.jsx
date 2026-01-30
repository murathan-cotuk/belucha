"use client";

import React from "react";
import { useQuery, gql } from "@apollo/client";
import styled from "styled-components";
import { Card } from "@belucha/ui";

const GET_SELLER_STATS = gql`
  query GetSellerStats {
    Products(limit: 100) {
      totalDocs
    }
    Orders(limit: 100) {
      totalDocs
    }
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  color: #1f2937;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  padding: 24px;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: #0ea5e9;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 16px;
  color: #6b7280;
`;

const Section = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
`;

export default function DashboardHome() {
  const { data, loading, error } = useQuery(GET_SELLER_STATS, {
    errorPolicy: 'all', // Hataları graceful handle et
    skip: !process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // GraphQL endpoint yoksa query'yi skip et
  });

  // GraphQL endpoint yoksa veya hata varsa placeholder göster
  const hasGraphQL = !!process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  const showPlaceholder = !hasGraphQL || error;

  return (
    <Container>
      <Title>Dashboard</Title>
      {showPlaceholder && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fef3c7', 
          border: '1px solid #fbbf24', 
          borderRadius: '8px', 
          marginBottom: '24px',
          color: '#92400e'
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>⚠️ GraphQL endpoint not configured</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Seller dashboard features will be available once GraphQL endpoint is configured.
          </p>
        </div>
      )}
      <StatsGrid>
        <StatCard>
          <StatValue>{loading ? '...' : (data?.Products?.totalDocs || 0)}</StatValue>
          <StatLabel>Total Products</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{loading ? '...' : (data?.Orders?.totalDocs || 0)}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>$0</StatValue>
          <StatLabel>Revenue</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>10%</StatValue>
          <StatLabel>Commission Rate</StatLabel>
        </StatCard>
      </StatsGrid>
      <Section>
        <SectionTitle>Quick Actions</SectionTitle>
        <p>Add new products, manage inventory, and view analytics from here.</p>
      </Section>
    </Container>
  );
}

