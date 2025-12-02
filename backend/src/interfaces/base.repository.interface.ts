import mongoose from "mongoose";

export interface IBaseRepository<T extends mongoose.Document> {
    create(data:Partial<T>):Promise<T>;
}