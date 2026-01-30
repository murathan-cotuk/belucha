"use client";

import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "@/lib/apollo-client";

export default function Providers({ children }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
