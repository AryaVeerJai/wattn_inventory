// class APIFeatures {
//   constructor(query, queryStr) {
//     this.query = query;
//     this.queryStr = queryStr;
//   }

//   search() {
//     // console.log(this.query)
//     if (!this.queryStr.searchBy) {
//       this.queryStr.searchBy = "name";
//     }
//     const keyword = this.queryStr.keyword
//       ? {
//         $or: [
//           {
//             [this.queryStr.searchBy]: {
//               $regex: this.queryStr.keyword,
//               $options: "i",
//             },
//           }
//         ],
//       }
//       : {};

//     this.query = this.query.find({ ...keyword });
//     return this;
//   }

//   filter() {
//     const queryCopy = { ...this.queryStr };
//     console.log(this.queryStr)

//     //Removing unwanted fields from queryStr like keyword,limit,page
//     //We removing elements from queryStr coz there is no such presence in our mongoDB document
//     const removeFields = ["keyword", "limit", "page", "sorted", "sortby", "searchBy"];
//     removeFields.forEach((el) => delete queryCopy[el]);

//     // console.log(queryCopy);
//     //Advance filtering for Price, Ratings and many more
//     // Why JSON.stringify ? queryCopy contain object for apply functionalities need to convert into String
//     let queryStr = JSON.stringify(queryCopy);
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|or)\b/g, (match) => `$${match}`); //(gt|gte|lt|lte) this are mongo operators
//     console.log(queryStr);
//     this.query = this.query.find(JSON.parse(queryStr));
//     return this;
//   }

//   pagination(resPerPage) {
//     const currentPage = parseInt(this.queryStr.page) || 1;
//     // console.log(currentPage);
//     const skip = resPerPage * (currentPage - 1);
//     this.query = this.query.limit(resPerPage).skip(skip);
//     return this;
//   }
//   sort() {
//     this.query = this.query.sort({ [this.queryStr.sortby]: this.queryStr.sorted });
//     return this;
//   }
// }

// module.exports = APIFeatures;


class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    if (!this.queryStr.searchBy) {
      this.queryStr.searchBy = "name";
    }
    const keyword = this.queryStr.keyword
      ? {
        $or: [
          {
            [this.queryStr.searchBy]: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        ],
      }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  // filter() {
  //   const queryCopy = { ...this.queryStr };

  //   // Removing unwanted fields from queryStr like keyword, limit, page
  //   const removeFields = ["keyword", "limit", "page", "sorted", "sortby", "searchBy"];
  //   removeFields.forEach((el) => delete queryCopy[el]);

  //   // Advanced filtering for Price, Ratings, etc.
  //   let queryStr = JSON.stringify(queryCopy);
  //   queryStr = queryStr.replace(/\b(gt|gte|lt|lte|or)\b/g, (match) => `$${match}`);
  //   this.query = this.query.find(JSON.parse(queryStr));

  //   if (queryCopy.category) {
  //     this.query = this.query.find({ "category.categoryName": queryCopy.category });
  //   } else {
  //     this.query = this.query.find(JSON.parse(queryStr));
  //   }
  //   return this;
  // }

  filter() {
    const queryCopy = { ...this.queryStr };

    // Removing unwanted fields from queryStr like keyword, limit, page
    const removeFields = ["keyword", "limit", "page", "sorted", "sortby", "searchBy", "category"];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Advanced filtering for Price, Ratings, etc.
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|or)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    
    return this;
}

  pagination(resPerPage) {
    const currentPage = parseInt(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }

  sort() {
    const validSortFields = ['name', 'createdAt', 'price']; // Add valid fields as needed

    if (this.queryStr.sortby && validSortFields.includes(this.queryStr.sortby)) {
      const sortOrder = this.queryStr.sorted === '1' ? 1 : -1; // 1 for ascending, -1 for descending
      this.query = this.query.sort({ [this.queryStr.sortby]: sortOrder });
    } else {
      this.query = this.query.sort('-createdAt'); // Default sort
    }
    return this;
  }
}

module.exports = APIFeatures;
