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
  var data: any = await download('https://gist.githubusercontent.com/onelittlenightmusic/84fcbe3e8843b369c531866acd02977b/raw/japancities.json')

  const locations = data['data']
	const typeDefs = 'schema.graphql';

  const resolvers = {
    Query: {
      locations: (obj: any, param: any, context: any) => {
        if(param != null) {
          var names = param.Japanese_in
          if(names != null) {
            // return locations.filter((element: any) => {return names.includes(element['Japanese'])})
            return names.map((name: any) => locations.find((e: any) => e['Japanese'] === name))
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
