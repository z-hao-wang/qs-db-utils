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

export async function getAllCollectionNames(db: mongodb.Db): Promise<string[]> {
  const collections = await db.listCollections().toArray();
  const ret: string[] = [];
  for (let collection of collections) {
    if (collection && collection.type === 'collection') {
      ret.push(collection.name);
    }
  }
  return ret;
}

export async function connectDb(
  mongoUrlOverride: string,
  options: mongodb.MongoClientOptions,
): Promise<mongodb.MongoClient> {
  if (!mongoUrlOverride) {
    throw Error('invalid mongoddb url');
  }

  return await mongodb.MongoClient.connect(mongoUrlOverride, options);
}

export async function dbCreateIndex(
  collection: mongodb.Collection,
  indexConfig: any,
  indexOptions: mongodb.CreateIndexesOptions,
) {
  return await collection.createIndex(indexConfig, indexOptions);
}

// getCollectionNames exclude views
// export async function getCollectionNames(db: mongodb.Db) {
//   const collections = await db.listCollections();
//   const collectionNames = (() => {
//     const _collectionNames: string[] = [];
//     collections.each((_err: any, collection: any) => {
//       if (
//         collection &&
//         !collection.options.viewOn &&
//         collection.name !== "system.views"
//       ) {
//         _collectionNames.push(collection.name);
//       } else if (!collection) {
//         return _collectionNames;
//       }
//     });
//   })();
//   return collectionNames;
// }

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

export async function getTempValue(db: mongodb.Db, key: string, doc: { [key: string]: any }) {
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
