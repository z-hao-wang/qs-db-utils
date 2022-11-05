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
  await db.collection(collectionName).rename(collectionName + '_tmp');
  await syncIndex(db.collection(collectionName + '_tmp'), db.collection(collectionName));

  await moveBatch(db.collection(collectionName + '_tmp'), db.collection(collectionName), {}, (result) => {
    console.log(`${db.databaseName} ${collectionName} inserted ${result.inserted} skipped ${result.skipped}`);
  });
  // expect tmp collection has 0 value
  const count = await db
    .collection(collectionName + '_tmp')
    .find({})
    .count();
  const countNew = await db.collection(collectionName).find({}).count();
  if (count !== 0) {
    throw new Error(`move Batch failed, data length ${count} is not 0 countNew=${countNew}`);
  }
}

export async function rebuildAllCollectionData(db: mongodb.Db) {
  const collectionNames = await getCollectionNames(db);
  for (let collectionName of collectionNames) {
    await rebuildCollectionData(db, collectionName);
  }
}
