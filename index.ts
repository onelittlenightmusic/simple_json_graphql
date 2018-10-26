import { GraphQLServer } from 'graphql-yoga'
import request from 'request-promise-native'
import { config } from 'dotenv'
config()

const PORT = process.env.PORT
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
    type Location {
      # Prefecture name written in Roman alphabet (example: "Fukushima", "Aichi"), String
      Prefecture: String
      # Japanese name of city written in Japanese Kanji character (example: "名古屋市"), String
      Japanese: String
      # Population (example: 2283289), Integer
      Population: Int
      # Country basically "Japan", String
      Country: String
      # Density (example: 6860), Integer
      Density: Float
      # Founded date in format of yyyy-MM-dd (example: "1889-10-01"), String
      Founded: String
      # Area (example: 326.45), unit km^2, Float
      Area: Float
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

  const formatResponse = (response:any) => {
    var meta = {
      data_origin: "Wikipedia",
      source_url: "https://en.wikipedia.org/wiki/List_of_cities_in_Japan",
      lisence_type: "https://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License"
    }
    return {
      ...response,
      meta
    }
  }
	const server = new GraphQLServer({ typeDefs, resolvers })
	server.start({port: PORT, formatResponse}, () =>
		console.log(`Your GraphQL server is running now ...`),
	)
}

try {
	run()
} catch(e) {
	console.log(e)
}
