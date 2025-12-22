const mongoose = require("mongoose");


const homeSchema = new mongoose.Schema({
    banner: [{
        image: {
            type: String
        },
        link: {
            type: String
        }

    }],
    banner2: {
        image: {
            type: String
        },
        link: {
            type: String
        }

    },
    banner3: {
        image: {
            type: String
        },
        link: {
            type: String
        }

    },
    collection1: {
        image: {
            type: String
        },
        link: {
            type: String
        },
        name: {

            type: String
        }

    },
    collection2: {
        image: {
            type: String
        },
        link: {
            type: String
        },
        name: {

            type: String
        }

    },
    dealsSectionBanner: {
        image: String,
        link: String,
    },
    threeBannerSection: {
        image1: String,
        image2: String,
        image3: String,
        link: String,
    },
    twoBannerSection: {
        image1: String,
        image2: String,
        link: String,
    },
    lastBannerSection: {
        image1: String,
        image2: String,
        link: String,
    },
    topBannerSection: {
        image1: String,
        image2: String,
    },
    categorySection1: {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        },
        categoryName: String,
        categorySlug: String,
    },
    bannerLast: {
        type: Array,
        default: Array(9).fill(
            {
                image: "",
                link: "",
                order: 0
            }
        )
    }

}, { timestamps: true });



module.exports = mongoose.model("Home", homeSchema);
