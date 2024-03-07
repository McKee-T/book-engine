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

// Serve static files from the React app dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
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

  // Explicitly serve static files from the 'assets' directory
  app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets')));

  app.get('*', (req, res, next) => {
    // Skip any requests for static files (by checking the extension)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return next();
    }

    // For all other paths, send back the React index.html file
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
  
}

db.once('open', () => {
  startApolloServer(typeDefs, resolvers).then(() => {
    app.listen(PORT, () => console.log(`🌍 Now listening on http://localhost:${PORT}, GraphQL at /graphql`));
  });
});
