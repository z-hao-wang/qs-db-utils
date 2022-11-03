import * as mongodb from 'mongodb';
export declare function insertManyIgnoreDup(collection: mongodb.Collection, data: any[]): Promise<{
    inserted: number;
    skipped: number;
}>;
