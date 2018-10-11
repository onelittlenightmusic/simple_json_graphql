import { GraphQLServer } from 'graphql-yoga'

// (1)データを保持
const locations = [
  {Japanese: "三鷹市",
  Prefecture: "Tokyo",
  Population: 180797},
  {Japanese: '香取市',
  Prefecture: 'Chiba',
  Population: 85193},
]

  // (2)クエリを受け付け
  const typeDefs = `
    type Location {
      Japanese: String
      Prefecture: String
      Population: Int
    }
    type Query {
      locations: [Location]
    }
  `;

  // (3)クエリにあわせたデータを返す
  const resolvers = {
    Query: {
      locations: () => locations,
    },
  };


	const server = new GraphQLServer({ typeDefs, resolvers })
	server.start({port: 4040}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
