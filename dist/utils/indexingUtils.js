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
exports.dbCreateIndex = exports.syncIndex = void 0;
function syncIndex(fromDb, toDb) {
    return __awaiter(this, void 0, void 0, function* () {
        const indexesSrc = yield fromDb.listIndexes().toArray();
        for (let indexItem of indexesSrc) {
            if (indexItem.name === '_id_')
                continue;
            const options = { background: indexItem.background };
            if (indexItem.unique) {
                options.unique = true;
            }
            yield toDb.createIndex(indexItem.key, options);
        }
    });
}
exports.syncIndex = syncIndex;
function dbCreateIndex(collection, indexConfig, indexOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield collection.createIndex(indexConfig, indexOptions);
    });
}
exports.dbCreateIndex = dbCreateIndex;
