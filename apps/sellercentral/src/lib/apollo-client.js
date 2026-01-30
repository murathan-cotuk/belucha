import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

// GraphQL endpoint - şimdilik yok, placeholder
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all', // Hataları graceful handle et
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
