import { GraphQLServer } from 'graphql-yoga'
import fetch from 'node-fetch'
import { config } from 'dotenv'
config()

const PORT = process.env.PORT
var download = async function(url: string) {
  var response = await fetch(url);
  return (await response.json())
}

async function run() {
    var cities: any = await download('https://gist.githubusercontent.com/onelittlenightmusic/84fcbe3e8843b369c531866acd02977b/raw/japancities.json')

    const locations = cities['data']
	const typeDefs = `
    type Location {
      # Name
      Name: String
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
      # Homepage
      Homepage: String
    }
    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
      # Get array of cities (Option: select by name array)
      locations(Japanese_in: [String]): [Location]
      # Get one city by Japanese name
      location(Japanese: String!): Location
    }
  `;

  const resolvers = {
    Query: {
      locations: (obj: any, param: any, context: any) => {
        if(param != null) {
          var names = param.Japanese_in
          if(names != null) {
            return locations.filter((element: any) => {return names.includes(element['Japanese'])})
          }
        }
        return locations
      },
      location: (obj:any, param:any, context: any) => locations.find((element: any) => {return element.Japanese === param.Japanese})
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
