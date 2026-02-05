"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Card } from "@belucha/ui";
import { getMedusaAdminClient } from "@/lib/medusa-admin-client";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &:nth-child(4) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Section = styled(Card)`
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #6b7280;
`;

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const medusaClient = getMedusaAdminClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsData = await medusaClient.getProducts();
        const totalProducts = productsData.products?.length || 0;

        // TODO: Fetch orders, revenue, pending orders from Medusa REST API
        // const ordersData = await medusaClient.getOrders();
        // const totalOrders = ordersData.orders?.length || 0;
        // const totalRevenue = ordersData.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
        // const pendingOrders = ordersData.orders?.filter(order => order.status === 'pending')?.length || 0;

        setStats({
          totalProducts,
          totalOrders: 0, // TODO: Implement
          totalRevenue: 0, // TODO: Implement
          pendingOrders: 0, // TODO: Implement
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: "32px" }} />
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Section>
          <div style={{ padding: "16px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#991b1b" }}>
            Error loading dashboard: {error}
          </div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalProducts}</StatValue>
          <StatLabel>Total Products</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>€{stats.totalRevenue.toFixed(2)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.pendingOrders}</StatValue>
          <StatLabel>Pending Orders</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>Recent Activity</SectionTitle>
        <p style={{ color: "#6b7280" }}>Recent activity will appear here</p>
      </Section>

      <Section>
        <SectionTitle>Quick Actions</SectionTitle>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onClick={() => window.location.href = "/products/single-upload"}
          >
            Add Product
          </button>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onClick={() => window.location.href = "/orders"}
          >
            View Orders
          </button>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onClick={() => window.location.href = "/analytics"}
          >
            View Analytics
          </button>
        </div>
      </Section>
    </Container>
  );
}
