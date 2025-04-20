// app/api//route.js
import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);
const dbName = 'users';

export async function POST(request) {
  try {
    const { username, email, password, languages } = await request.json();

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check for existing email
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 409
      });
    }

    // Insert new user
    await usersCollection.insertOne({ username, email, password, languages });

    return new Response(JSON.stringify({ message: 'Signup successful!' }), {
      status: 201
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500
    });
  } finally {
    await client.close();
  }
}
