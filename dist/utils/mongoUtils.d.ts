import * as mongodb from 'mongodb';
export declare function connectDb(mongoUrl: string, options?: mongodb.MongoClientOptions): Promise<mongodb.MongoClient>;
export declare function insertManyIgnoreDup(collection: mongodb.Collection, data: any[]): Promise<{
    inserted: number;
    skipped: number;
}>;
export declare function getAllCollectionNames(db: mongodb.Db): Promise<string[]>;
export declare function getCollectionNames(db: mongodb.Db): Promise<string[]>;
export declare function setTempValue(db: mongodb.Db, key: string, doc: {
    [key: string]: any;
}): Promise<mongodb.UpdateResult>;
export declare function getTempValue(db: mongodb.Db, key: string): Promise<mongodb.WithId<mongodb.Document> | null>;
export declare function objectIdWithTimestamp(timestamp: number): mongodb.ObjectId;
export declare function getAllDatabases(con: mongodb.MongoClient): Promise<mongodb.ListDatabasesResult>;
