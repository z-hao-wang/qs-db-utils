import * as mongodb from 'mongodb';
export declare function syncIndex(fromDb: mongodb.Collection, toDb: mongodb.Collection): Promise<void>;
export declare function dbCreateIndex(collection: mongodb.Collection, indexConfig: Record<string, any>, indexOptions: mongodb.CreateIndexesOptions): Promise<string>;
