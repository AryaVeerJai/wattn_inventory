const mongoose = require("mongoose");

const prductSchema = new mongoose.Schema(
  {
    productDetails: {
      name: {
        type: String,
        required: [true, "Please Enter Product Name"],
      },
      slug: {
        type: String,
        required: [true, "Please Enter Slug Info"],
      },
      description: {
        type: String,
      },
      shortDescription: {
        type: String,
      },
      specificDescription: {
        type: String,
      },
    },
    pricing: [
      {
        price: {
          type: Number,
        },
        oldPrice: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        attribute: {
          type: Array,
          default: [],
        },
      },
    ],
    attributes: {
      type: mongoose.SchemaTypes.Mixed,
    },
    selectedAttributes: {
      type: mongoose.SchemaTypes.Mixed,
    },
    inventory: {
      inventory: [
        {
          SKU: {
            type: String,
          },

          stoke: {
            type: Number,
          },
          attribute: {
            type: Array,
            default: [],
          },
        },
      ],
      isStockManage: {
        type: Boolean,
        default: false,
      },
    },
    images: [
      {
        image: {
          type: String,
        },
        alt: {
          type: String,
        },
        order: {
          type: Number,
        },
        name: {
          type: String,
        },
        color: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Color",
        },
      },
    ],
    specification: [
      {
        key: {
          type: String,
        },
        value: { type: String },
      },
    ],
    seoDetails: {
      title: {
        type: String,
      },
      metaDescription: {
        type: String,
      },
    },
    visibility: {
      visibility: {
        type: String,
        enum: {
          values: ["Published", "Scheduled", "Hidden"],
          message: "Please select From Above Options",
        },
      },
      date: {
        type: Date,
      },
    },
    category: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        name: {
          type: String,
        },
      },
    ],
    tags: {
      type: Array,
      default: [],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    flash: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "pending",
      enum: {
        values: ["pending", "approved", "rejected"],
      },
    },
    rejectReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", prductSchema);
