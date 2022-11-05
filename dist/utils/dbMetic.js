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
exports.getAllMongoSizes = void 0;
const mongoUtils_1 = require("./mongoUtils");
function isPromise(p) {
    return typeof p === 'object' && typeof p.then === 'function';
}
function getAllMongoSizes(con, onStat) {
    return __awaiter(this, void 0, void 0, function* () {
        const dbs = yield (0, mongoUtils_1.getAllDatabases)(con);
        const dbSizes = dbs.databases.map((d) => ({
            name: d.name,
            size: d.sizeOnDisk ? Math.round(d.sizeOnDisk / 1000000).toLocaleString() : 0,
        }));
        for (let dbInfo of dbSizes) {
            const { name } = dbInfo;
            if (['config', 'local', 'admin'].includes(name))
                continue;
            const db = con.db(name);
            const collections = yield db.listCollections({}, { nameOnly: true }).toArray();
            for (let col of collections) {
                try {
                    const stats = yield db.collection(col.name).stats();
                    const r = onStat({ dbName: name, collectionName: col.name, stats });
                    if (isPromise(r)) {
                        yield r;
                    }
                }
                catch (e) {
                    console.error(`list size error ${name} ${col.name}`, e);
                }
            }
        }
    });
}
exports.getAllMongoSizes = getAllMongoSizes;
