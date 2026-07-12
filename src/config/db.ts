import mongoose from 'mongoose';
import env from './env';

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) return mongoose;

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log(`MongoDB connected: ${connection.connection.host}/${connection.connection.name}`);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log('MongoDB disconnected');
}

export default connectDB;
