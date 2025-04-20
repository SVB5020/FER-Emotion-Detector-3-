// app/api/top-songs/route.js
import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'music';

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const songsCollection = db.collection('songs');

    const songs = await songsCollection.find({}).toArray();

    // Group by language
    const grouped = songs.reduce((acc, song) => {
      const lang = song.language;
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push({
        title: song.title,
        artist: song.artist,
        url: song.url, // Ensure url is included in the song data
      });
      return acc;
    }, {});

    return new Response(JSON.stringify(grouped), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}
