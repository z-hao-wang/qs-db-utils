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
exports.objectIdWithTimestamp = exports.getTempValue = exports.setTempValue = exports.dbCreateIndex = exports.connectDb = exports.getAllCollectionNames = exports.insertManyIgnoreDup = void 0;
const mongodb = __importStar(require("mongodb"));
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
function getAllCollectionNames(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const collections = yield db.listCollections().toArray();
        const ret = [];
        for (let collection of collections) {
            if (collection && collection.type === 'collection') {
                ret.push(collection.name);
            }
        }
        return ret;
    });
}
exports.getAllCollectionNames = getAllCollectionNames;
function connectDb(mongoUrlOverride, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!mongoUrlOverride) {
            throw Error('invalid mongoddb url');
        }
        return yield mongodb.MongoClient.connect(mongoUrlOverride, options);
    });
}
exports.connectDb = connectDb;
function dbCreateIndex(collection, indexConfig, indexOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield collection.createIndex(indexConfig, indexOptions);
    });
}
exports.dbCreateIndex = dbCreateIndex;
// getCollectionNames exclude views
// export async function getCollectionNames(db: mongodb.Db) {
//   const collections = await db.listCollections();
//   const collectionNames = (() => {
//     const _collectionNames: string[] = [];
//     collections.each((_err: any, collection: any) => {
//       if (
//         collection &&
//         !collection.options.viewOn &&
//         collection.name !== "system.views"
//       ) {
//         _collectionNames.push(collection.name);
//       } else if (!collection) {
//         return _collectionNames;
//       }
//     });
//   })();
//   return collectionNames;
// }
function setTempValue(db, key, doc) {
    return __awaiter(this, void 0, void 0, function* () {
        // store a value to temp db
        return yield db.collection('temp').updateOne({
            key,
        }, Object.assign(Object.assign({}, doc), { key }), {
            upsert: true,
        });
    });
}
exports.setTempValue = setTempValue;
function getTempValue(db, key, doc) {
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
