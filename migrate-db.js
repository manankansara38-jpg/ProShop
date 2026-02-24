import { MongoClient } from 'mongodb';

const LOCAL_URI = 'mongodb://localhost:27017';
const ATLAS_URI = 'mongodb+srv://ProShop:ProShop1234@cluster0.ugouwfr.mongodb.net/?retryWrites=true&w=majority';

async function migrateDatabase() {
  let localClient, atlasClient;

  try {
    console.log('🔄 Connecting to local MongoDB...');
    localClient = new MongoClient(LOCAL_URI);
    await localClient.connect();
    console.log('✅ Connected to local MongoDB');

    console.log('🔄 Connecting to MongoDB Atlas...');
    atlasClient = new MongoClient(ATLAS_URI);
    await atlasClient.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const localDb = localClient.db('e-commerce');
    const atlasDb = atlasClient.db('e-commerce');

    // Get all collections from local DB
    const collections = await localDb.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections to migrate:\n`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`📥 Migrating "${collectionName}"...`);
      
      // Get all documents from local collection
      const docs = await localDb.collection(collectionName).find({}).toArray();
      
      if (docs.length === 0) {
        console.log(`   ⚠️  Collection empty, skipping...\n`);
        continue;
      }

      // Insert into Atlas collection
      await atlasDb.collection(collectionName).insertMany(docs);
      console.log(`   ✅ Migrated ${docs.length} documents\n`);
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    process.exit(0);
  }
}

migrateDatabase();

