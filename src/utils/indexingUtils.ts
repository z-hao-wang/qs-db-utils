import * as mongodb from 'mongodb';

export async function syncIndex(fromDb: mongodb.Collection, toDb: mongodb.Collection) {
  const indexesSrc = await fromDb.listIndexes().toArray();
  for (let indexItem of indexesSrc) {
    if (indexItem.name === '_id_') continue;
    const options: Record<string, any> = { background: indexItem.background };
    if (indexItem.unique) {
      options.unique = true;
    }
    await toDb.createIndex(indexItem.key, options);
  }
}

export async function dbCreateIndex(
  collection: mongodb.Collection,
  indexConfig: Record<string, any>,
  indexOptions: mongodb.CreateIndexesOptions,
) {
  return await collection.createIndex(indexConfig, indexOptions);
}
