import { ApolloServer, gql, PubSub } from 'apollo-server-express';
import http from 'http';
import cookie from 'cookies';
import schema from './schema';
import { users } from './db';
import { app } from './app';
import { origin, port } from './env';



const pubsub = new PubSub();

const server = new ApolloServer({
  schema,
  context : (session : any) => {
    // Access the request object
    let req = session.connection
    ? session.connection.context.request
    : session.req;

    // It's subscription
    if(session.connection) {
      req.cookies = cookie.parse(req.headers.cookie || '');
    }

    return {
      currentUser : users.find(u => u.id === req.cookies.currentUserId),
      pubsub
    };
  },
  
  subscriptions : {
    onConnect(params, ws, ctx) {
      //  pass the request object to context
      return {
        request : ctx.request,
      };
    },
  },
});

server.applyMiddleware({
  app,
  path: '/graphql',
  cors : { credentials : true, origin },
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);


httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
