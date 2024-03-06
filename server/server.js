const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schema'); 
const { authMiddleware } = require('./utils/auth'); // Assuming this is your authentication middleware

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Use your authentication middleware to extract user info from the token
      const auth = await authMiddleware(req);
      return { user: auth.user }; // Attach the user to the context
    }
  });

  await server.start();
  server.applyMiddleware({ app });
}

db.once('open', () => {
  startApolloServer(typeDefs, resolvers).then(() => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}, GraphQL at /graphql`));
  });
});
