import { Client, TablesDB, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const SECRET_KEY = import.meta.env.VITE_APPWRITE_SECRET_KEY;

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)
    .setDevKey(SECRET_KEY)

const database = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
    //1. Use appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listRows(
            {databaseId: DATABASE_ID,
            tableId: TABLE_ID, 
            queries: [Query.equal('searchTerm', searchTerm)]});

        //2. if it does, update the count
        if(result.rows.length > 0) {
            const row = result.rows[0];

            await database.updateRow({
                databaseId: DATABASE_ID, 
                tableId: TABLE_ID, 
                rowId: row.$id, 
                data: {count: row.count + 1,}});
            //3. if it doesn't, create a new document with the search term and count as 1
        } else {
            await database.createRow(
                {databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            }});
        }
    } catch (error) {
        console.log(error);
        
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listRows(
            {databaseId: DATABASE_ID, 
            tableId: TABLE_ID, 
            queries: [Query.limit(5),Query.orderDesc("count")
        ]})

        return result.rows;
    } catch (error) {
        console.log(error);
        
    }
}