import * as mongodb from 'mongodb';

export async function insertManyIgnoreDup(collection: mongodb.Collection, data: any[]) {
  if (data.length === 0) {
    return { inserted: 0, skipped: 0 };
  }
  let skipped = 0;
  try {
    await collection.insertMany(data, { ordered: false });
  } catch (_err) {
    const err = _err as mongodb.MongoError;
    if (err?.code !== undefined) {
      if (err.code !== 11000) {
        console.error(`insertManyIgnoreDup collectionName=${collection.collectionName} err`, err);
        throw err;
      }
      if (data.length === 1 || !(err as any).writeErrors) {
        skipped = err && err.code === 11000 ? 1 : 0;
      } else {
        skipped = err && err.code === 11000 ? (err as any).writeErrors.filter((e: any) => e.code === 11000).length : 0;
      }
    } else {
      throw err;
    }
  }
  return { inserted: data.length - skipped, skipped };
}

export async function connectDb(
  mongoUrl: string,
  options: mongodb.MongoClientOptions = {},
): Promise<mongodb.MongoClient> {
  if (!mongoUrl) {
    throw Error('invalid mongoddb url');
  }

  return await mongodb.MongoClient.connect(mongoUrl, options);
}

// getAllCollectionNames with views
export async function getAllCollectionNames(db: mongodb.Db): Promise<string[]> {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  return collections.map((c) => c.name);
}

// getCollectionNames exclude views
export async function getCollectionNames(db: mongodb.Db) {
  const collections = await db.listCollections({}, { nameOnly: false }).toArray();
  return collections.filter((c) => c.type === 'collection').map((c) => c.name);
}

export async function setTempValue(db: mongodb.Db, key: string, doc: { [key: string]: any }) {
  // store a value to temp db
  return await db.collection('temp').updateOne(
    {
      key,
    },
    {
      ...doc,
      key,
    },
    {
      upsert: true,
    },
  );
}

export async function getTempValue(db: mongodb.Db, key: string) {
  // store a value to temp db
  return await db.collection('temp').findOne({
    key,
  });
}

export function objectIdWithTimestamp(timestamp: number) {
  /* Convert date object to hex seconds since Unix epoch */
  const hexSeconds = Math.floor(timestamp / 1000).toString(16);

  /* Create an ObjectId with that hex timestamp */
  const constructedObjectId = new mongodb.ObjectId(hexSeconds + '0000000000000000');

  return constructedObjectId;
}

export async function getAllDatabases(con: mongodb.MongoClient) {
  const adminDb = con.db('admin');
  // List all the available databases
  return await adminDb.admin().listDatabases();
}
