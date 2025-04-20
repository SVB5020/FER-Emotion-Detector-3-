import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);
const dbName = 'users';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Check if the user exists
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
      });
    }

    // Verify password
    if (user.password !== password) {
      return new Response(JSON.stringify({ message: 'Invalid password' }), {
        status: 401,
      });
    }

    // Return success response with user's languages
    return new Response(
      JSON.stringify({
        message: 'Login successful!',
        languages: user.languages,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  } finally {
    await client.close();
  }
}