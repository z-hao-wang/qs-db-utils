"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebuildAllCollectionData = exports.rebuildCollectionData = exports.moveBatch = void 0;
const mongoUtils_1 = require("./mongoUtils");
const indexingUtils_1 = require("./indexingUtils");
function moveBatch(fromDb, toDb, criteria, onBatchComplete, batchSize = 1000) {
    return __awaiter(this, void 0, void 0, function* () {
        let data;
        const batchLimit = batchSize;
        do {
            // console.log(`loading data ${JSON.stringify(condition)} with limit ${batchLimit}`);
            data = yield fromDb
                .find(criteria)
                .sort({ _id: 1 })
                .limit(batchLimit)
                .toArray();
            const insertedRes = yield (0, mongoUtils_1.insertManyIgnoreDup)(toDb, data);
            const ids = data.map(d => d._id);
            // directly delete the data without verification
            yield fromDb.deleteMany({ _id: { $in: ids } });
            onBatchComplete && onBatchComplete(insertedRes);
        } while (data.length === batchLimit);
    });
}
exports.moveBatch = moveBatch;
function rebuildCollectionData(db, collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.collection(collectionName).rename(collectionName + '_tmp');
        yield (0, indexingUtils_1.syncIndex)(db.collection(collectionName + '_tmp'), db.collection(collectionName));
        yield moveBatch(db.collection(collectionName + '_tmp'), db.collection(collectionName), {}, (result => {
            console.log(`${db.databaseName} ${collectionName} inserted ${result.inserted} skipped ${result.skipped}`);
        }));
        // expect tmp collection has 0 value
        const count = yield db
            .collection(collectionName + '_tmp')
            .find({})
            .count();
        const countNew = yield db
            .collection(collectionName)
            .find({})
            .count();
        if (count !== 0) {
            throw new Error(`move Batch failed, data length ${count} is not 0 countNew=${countNew}`);
        }
    });
}
exports.rebuildCollectionData = rebuildCollectionData;
function rebuildAllCollectionData(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collectionNames = yield (0, mongoUtils_1.getCollectionNames)(db);
        for (let collectionName of collectionNames) {
            yield rebuildCollectionData(db, collectionName);
        }
    });
}
exports.rebuildAllCollectionData = rebuildAllCollectionData;
