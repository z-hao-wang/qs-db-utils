import { getAllDatabases } from './mongoUtils';
import { CollStats, MongoClient } from 'mongodb';

function isPromise(p: any) {
  return typeof p === 'object' && typeof p.then === 'function';
}

export async function getAllMongoSizes(
  con: MongoClient,
  onStat: (options: { dbName: string; collectionName: string; stats: CollStats }) => any,
) {
  const dbs = await getAllDatabases(con);
  const dbSizes = dbs.databases.map((d) => ({
    name: d.name,
    size: d.sizeOnDisk ? Math.round(d.sizeOnDisk / 1000000).toLocaleString() : 0,
  }));
  for (let dbInfo of dbSizes) {
    const { name } = dbInfo;
    if (['config', 'local', 'admin'].includes(name)) continue;
    const db = con.db(name);
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    for (let col of collections) {
      try {
        const stats = await db.collection(col.name).stats();
        const r = onStat({ dbName: name, collectionName: col.name, stats });
        if (isPromise(r)) {
          await r;
        }
      } catch (e) {
        console.error(`list size error ${name} ${col.name}`, e);
      }
    }
  }
}
