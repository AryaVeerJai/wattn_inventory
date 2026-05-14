const mongoose = require("mongoose");

class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }


    search() {
        console.log(this.query, this.queryStr);

        const keyword = this.queryStr.keyword
            ? {

                [this.queryStr.searchBy]: this.queryStr.searchBy == "_id" || this.queryStr.searchBy == "userId" ? mongoose.Types.ObjectId(this.queryStr.keyword) : {
                    $regex: this.queryStr.keyword,
                    $options: "i",
                }
            }
            : {};
        this.query = this.query.match({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        //Removing unwanted fields from queryStr like keyword,limit,page
        //We removing elements from queryStr coz there is no such presence in our mongoDB document
        const removeFields = ["keyword", "limit", "page", "sorted", "sortby", "searchBy"];
        removeFields.forEach((el) => delete queryCopy[el]);

        console.log(queryCopy);

        //Advance filtering for Price, Ratings and many more
        // Why JSON.stringify ? queryCopy contain object for apply functionalities need to convert into String
        let queryStr = JSON.stringify(queryCopy);
        console.log(queryStr);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`); //(gt|gte|lt|lte) this are mongo operators

        this.query = this.query.match(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage) {
        const currentPage = parseInt(this.queryStr.page) || 1;
        console.log(currentPage);
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.skip(skip).limit(resPerPage);
        return this;
    }
    sort() {
        this.query = this.query.sort({ [this.queryStr.sortby]: this.queryStr.sorted });
        return this;
    }
}

module.exports = APIFeatures;
