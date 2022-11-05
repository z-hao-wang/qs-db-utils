import { CollStats } from "mongodb";
export declare function getAllMongoSizes(dbUrl: string, onStat: (options: {
    dbName: string;
    collectionName: string;
    stats: CollStats;
}) => any): Promise<void>;
