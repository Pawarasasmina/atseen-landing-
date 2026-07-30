import mongoose from 'mongoose';
async function ensureLeadTextIndex() {
  const leads = mongoose.connection.collection('leads');
  const indexes = await leads.indexes();
  const textIndex = indexes.find((index) => Object.values(index.key).includes('text'));

  if (textIndex?.language_override === 'language') {
    await leads.dropIndex(textIndex.name);
    await leads.createIndex(
      { fullName: 'text', email: 'text', instagram: 'text', tiktok: 'text' },
      { name: textIndex.name, default_language: 'english', language_override: 'searchLanguage' },
    );
    console.log('Updated lead text index language override');
  }
}

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await ensureLeadTextIndex();
  console.log('MongoDB connected');
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
