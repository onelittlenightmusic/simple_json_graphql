import { GraphQLServer } from 'graphql-yoga'
import request from 'request-promise-native'

var download = async function(url: string) {
  var body = await request.get({url});
  var cities = {}
  console.log(body)
  if(typeof body == 'string') {
       cities = JSON.parse(body)
  }
  return cities
}

async function run() {
    var cities: any = await download('https://gist.githubusercontent.com/onelittlenightmusic/0740ae9a64da0c867e0868926f97d5e2/raw/f3ac83bbe2334a2a9fce81154cab25a225ab5265/japancities.json')

    const locations = cities['data']
    console.log(locations)
	const typeDefs = `
    # Comments in GraphQL are defined with the hash (#) symbol.
    # This "Book" type can be used in other type declarations.
    type Location {
      #"City (Special Ward)": String
      Prefecture: String
      Population: Int
      Country: String
      Density: Int
      Founded: String
      Japanese: String
      #'City (Special Ward)': String
    }
    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
      locations: [Location]
      location(name: String!): Location
    }
  `;

  const resolvers = {
    Query: {
      locations: () => locations,
      location: (obj:any, param:any, context: any) => locations.find((element: any) => {return element.Japanese === param.name})
    },
  };

	const server = new GraphQLServer({ typeDefs, resolvers })
	server.start({port: 4040}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
}

try {
	run()
} catch(e) {
	console.log(e)
}
