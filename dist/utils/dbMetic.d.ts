import { CollStats, MongoClient } from 'mongodb';
export declare function getAllMongoSizes(con: MongoClient, onStat: (options: {
    dbName: string;
    collectionName: string;
    stats: CollStats;
}) => any): Promise<void>;
