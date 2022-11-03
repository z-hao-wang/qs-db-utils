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
exports.insertManyIgnoreDup = void 0;
function insertManyIgnoreDup(collection, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let skipped = 0;
        if (data.length === 0) {
            return { inserted: 0, skipped: 0 };
        }
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
                    skipped =
                        err && err.code === 11000
                            ? err.writeErrors.filter((e) => e.code === 11000).length
                            : 0;
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
