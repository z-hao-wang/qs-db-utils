"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getAllDatabases = exports.objectIdWithTimestamp = exports.getTempValue = exports.setTempValue = exports.getCollectionNames = exports.getAllCollectionNames = exports.insertManyIgnoreDup = exports.connectDb = void 0;
const mongodb = __importStar(require("mongodb"));
function connectDb(mongoUrl, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoUrl) {
            throw Error('invalid mongoddb url');
        }
        return yield mongodb.MongoClient.connect(mongoUrl, options);
    });
}
exports.connectDb = connectDb;
function insertManyIgnoreDup(collection, data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (data.length === 0) {
            return { inserted: 0, skipped: 0 };
        }
        let skipped = 0;
        try {
            yield collection.insertMany(data, { ordered: false });
        }
        catch (_err) {
            const err = _err;
            if ((err === null || err === void 0 ? void 0 : err.code) !== undefined) {
                if (err.code !== 11000) {
                    console.error(`insertManyIgnoreDup collectionName=${collection.collectionName} err`, err);
                    throw err;
                }
                if (data.length === 1 || !err.writeErrors) {
                    skipped = err && err.code === 11000 ? 1 : 0;
                }
                else {
                    skipped = err && err.code === 11000 ? err.writeErrors.filter((e) => e.code === 11000).length : 0;
                }
            }
            else {
                throw err;
            }
        }
        return { inserted: data.length - skipped, skipped };
    });
}
exports.insertManyIgnoreDup = insertManyIgnoreDup;
// getAllCollectionNames with views
function getAllCollectionNames(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = yield db.listCollections({}, { nameOnly: true }).toArray();
        return collections.map((c) => c.name);
    });
}
exports.getAllCollectionNames = getAllCollectionNames;
// getCollectionNames exclude views
function getCollectionNames(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = yield db.listCollections({}, { nameOnly: false }).toArray();
        return collections.filter((c) => c.type === 'collection').map((c) => c.name);
    });
}
exports.getCollectionNames = getCollectionNames;
function setTempValue(db, key, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        // store a value to temp db
        return yield db.collection('temp').updateOne({
            key,
        }, {
            $set: doc,
        }, {
            upsert: true,
        });
    });
}
exports.setTempValue = setTempValue;
function getTempValue(db, key) {
    return __awaiter(this, void 0, void 0, function* () {
        // store a value to temp db
        return yield db.collection('temp').findOne({
            key,
        });
    });
}
exports.getTempValue = getTempValue;
function objectIdWithTimestamp(timestamp) {
    /* Convert date object to hex seconds since Unix epoch */
    const hexSeconds = Math.floor(timestamp / 1000).toString(16);
    /* Create an ObjectId with that hex timestamp */
    const constructedObjectId = new mongodb.ObjectId(hexSeconds + '0000000000000000');
    return constructedObjectId;
}
exports.objectIdWithTimestamp = objectIdWithTimestamp;
function getAllDatabases(con) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminDb = con.db('admin');
        // List all the available databases
        return yield adminDb.admin().listDatabases();
    });
}
exports.getAllDatabases = getAllDatabases;
