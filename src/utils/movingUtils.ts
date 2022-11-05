import * as mongodb from 'mongodb';
import { getCollectionNames, insertManyIgnoreDup } from './mongoUtils';
import { syncIndex } from './indexingUtils';

export async function moveBatch(
  fromDb: mongodb.Collection,
  toDb: mongodb.Collection,
  criteria: Record<string, any>,
  onBatchComplete?: (result: { inserted: number; skipped: number }) => void,
  batchSize = 1000,
) {
  let data: any[];
  const batchLimit = batchSize;
  do {
    // console.log(`loading data ${JSON.stringify(condition)} with limit ${batchLimit}`);
    data = await fromDb.find(criteria).sort({ _id: 1 }).limit(batchLimit).toArray();
    const insertedRes = await insertManyIgnoreDup(toDb, data);
    const ids = data.map((d) => d._id);
    // directly delete the data without verification
    await fromDb.deleteMany({ _id: { $in: ids } });
    onBatchComplete && onBatchComplete(insertedRes);
  } while (data.length === batchLimit);
}

export async function rebuildCollectionData(db: mongodb.Db, collectionName: string) {
  const tmpCollectionName = collectionName + '_tmp';
  const existingTmp = await db.listCollections({ name: tmpCollectionName }).toArray();
  if (existingTmp && existingTmp.length > 0) {
    console.log(`tmp collection exists for ${tmpCollectionName}, continue to move`);
  } else {
    console.log(`rename ${collectionName} to ${tmpCollectionName}`);
    await db.collection(collectionName).rename(tmpCollectionName);
  }

  await syncIndex(db.collection(tmpCollectionName), db.collection(collectionName));

  await moveBatch(db.collection(tmpCollectionName), db.collection(collectionName), {}, (result) => {
    console.log(`${db.databaseName} ${collectionName} inserted ${result.inserted} skipped ${result.skipped}`);
  });
  // expect tmp collection has 0 value
  const count = await db.collection(tmpCollectionName).find({}).count();
  if (count !== 0) {
    throw new Error(`move Batch failed, data length ${count} is not 0`);
  } else {
    console.log(`done, dropping collection ${tmpCollectionName}`);
    await db.dropCollection(tmpCollectionName);
  }
}

export async function rebuildAllCollectionData(db: mongodb.Db) {
  const collectionNames = await getCollectionNames(db);
  for (let collectionName of collectionNames) {
    await rebuildCollectionData(db, collectionName);
  }
}
