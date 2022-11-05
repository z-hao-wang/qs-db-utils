import * as mongodb from 'mongodb';
export declare function moveBatch(fromDb: mongodb.Collection, toDb: mongodb.Collection, criteria: Record<string, any>, onBatchComplete?: (result: {
    inserted: number;
    skipped: number;
}) => void, batchSize?: number): Promise<void>;
export declare function rebuildCollectionData(db: mongodb.Db, collectionName: string): Promise<void>;
export declare function rebuildAllCollectionData(db: mongodb.Db): Promise<void>;
