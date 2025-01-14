const mongoose = require("mongoose").set("debug", true);
const ObjectId = mongoose.Types.ObjectId;
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const saltRounds = constants.SALT_ROUNDS;
const httpStatus = require("http-status");
const { getModelByTenant } = require("@config/database");
const logger = require("log4js").getLogger(
  `${constants.ENVIRONMENT} -- user-model`
);
const { logObject, HttpError } = require("@utils/shared");
const { mailer } = require("@utils/common");
const FIELDS_TO_EXCLUDE = ["password"];

// Base user schema for common fields across all user types
const baseUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      required: true,
      enum: [
        "entrepreneur",
        "investor",
        "bdsProvider",
        "academia",
        "generalPartner",
        "stiStaff",
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: false },
    loginCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    analyticsVersion: { type: Number },
    userName: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return this.email ? this.email : null;
      },
    },
    google_id: { type: String },
    profilePicture: {
      type: String,
      maxLength: 200,
      validate: {
        validator: function (v) {
          const urlRegex =
            /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
          return urlRegex.test(v);
        },
        message:
          "Profile picture URL must be a valid URL & must not exceed 200 characters.",
      },
    },
    website: { type: String },
  },
  {
    timestamps: true,
    discriminatorKey: "userType",
  }
);

// Entrepreneur-specific schema
const entrepreneurSchema = new Schema({
  business: {
    name: { type: String, required: true },
    description: { type: String },
    stage: {
      type: String,
      enum: ["idea", "startup", "growth", "established"],
    },
    sector: { type: String },
    employeeCount: { type: Number },
    yearFounded: { type: Number },
  },
  fundingNeeds: {
    amount: { type: Number },
    purpose: { type: String },
    timeline: { type: String },
  },
  connectedInvestors: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  connectedBDSProviders: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

// Investor-specific schema
const investorSchema = new Schema({
  organization: {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["VC", "Angel", "PE", "Corporate", "Other"],
    },
  },
  investmentPreferences: {
    sectors: [String],
    stages: [
      {
        type: String,
        enum: ["idea", "startup", "growth", "established"],
      },
    ],
    ticketSize: {
      min: Number,
      max: Number,
    },
    geographicFocus: [String],
  },
  portfolio: [
    {
      company: {
        type: ObjectId,
        ref: "User",
      },
      investmentDate: Date,
      amount: Number,
      status: {
        type: String,
        enum: ["active", "exited", "written-off"],
      },
    },
  ],
});

// BDS Provider-specific schema
const bdsProviderSchema = new Schema({
  organization: {
    name: { type: String, required: true },
    description: { type: String },
    yearFounded: Number,
  },
  services: [
    {
      name: { type: String },
      description: { type: String },
      category: {
        type: String,
        enum: ["consulting", "training", "mentoring", "technical", "other"],
      },
      pricing: {
        type: String,
        enum: ["free", "paid", "negotiable"],
      },
    },
  ],
  clientele: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

// Academia-specific schema
const academiaSchema = new Schema({
  institution: {
    name: { type: String, required: true },
    department: { type: String },
    position: { type: String },
  },
  research: [
    {
      title: { type: String },
      description: { type: String },
      field: { type: String },
      publicationDate: Date,
      collaborators: [
        {
          type: ObjectId,
          ref: "User",
        },
      ],
    },
  ],
});

// General Partner (UIRI, etc) specific schema
const generalPartnerSchema = new Schema({
  organization: {
    name: { type: String, required: true },
    type: { type: String },
    description: { type: String },
  },
  supportAreas: [
    {
      name: { type: String },
      description: { type: String },
    },
  ],
  supportedEntrepreneurs: [
    {
      entrepreneur: {
        type: ObjectId,
        ref: "User",
      },
      supportType: { type: String },
      startDate: Date,
      endDate: Date,
    },
  ],
});

// STI Staff-specific schema
const stiStaffSchema = new Schema({
  position: { type: String, required: true },
  department: { type: String },
  responsibilities: [String],
  managedPrograms: [
    {
      name: { type: String },
      description: { type: String },
      startDate: Date,
      endDate: Date,
    },
  ],
});

// Public Profile schema
const publicProfileSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    headline: { type: String },
    bio: { type: String },
    achievements: [
      {
        title: { type: String },
        description: { type: String },
        date: Date,
      },
    ],
    skills: [String],
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "connections"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for common query patterns
baseUserSchema.index({ userType: 1, status: 1 });
baseUserSchema.index({ email: 1, status: 1 });

// Apply plugins and create models
[baseUserSchema, publicProfileSchema].forEach((schema) => {
  schema.plugin(uniqueValidator, { message: "{VALUE} is already taken." });
});

// Add authentication methods required by passport
baseUserSchema.methods.authenticateUser = function (password) {
  return bcrypt.compareSync(password, this.password);
};

baseUserSchema.pre(
  ["updateOne", "findOneAndUpdate", "updateMany", "update", "save"],
  async function (next) {
    // Determine if this is a new document or an update
    const isNew = this.isNew;

    // Safely get updates object, accounting for different mongoose operations
    let updates = {};
    if (this.getUpdate) {
      updates = this.getUpdate() || {};
    } else if (!isNew) {
      updates = this.toObject();
    } else {
      updates = this;
    }

    if (updates.email && !updates.userName) {
      updates.userName = updates.email;
    }

    if (this.isModified("password")) {
      this.password = bcrypt.hashSync(this.password, saltRounds);
    }

    if (this.isNew) {
      try {
        await getPublicProfileModel("sti").create({
          user: this._id,
          visibility: "public",
        });
      } catch (error) {
        logger.error(`Failed to create public profile: ${error.message}`);
      }
    }
    next();
  }
);

baseUserSchema.pre(["find", "findOne"], function () {
  this.select("-password"); // Exclude password field from find queries
});

// User Static Methods
const userStaticMethods = {
  async register(args, next) {
    try {
      const data = await this.create({
        ...args,
      });
      logObject("the data being created", data);
      if (!isEmpty(data)) {
        return {
          success: true,
          data,
          message: "User successfully created",
          status: httpStatus.OK,
        };
      }

      return {
        success: true,
        data,
        message: "Operation successful but user NOT created",
        status: httpStatus.OK,
      };
    } catch (err) {
      logObject("the error being gotten", err);
      logger.error(`Registration error: ${err.message}`);
      let response = {};
      let message = "Validation errors for provided fields";
      let status = httpStatus.CONFLICT;

      if (err.code === 11000) {
        const duplicate_record = args.email ? args.email : args.userName;
        response[duplicate_record] = `${duplicate_record} must be unique`;

        // Send email notification for duplicate registration attempt
        try {
          const { email, firstName, lastName } = args;
          await mailer.existingUserRegistrationRequest(
            { email, firstName, lastName },
            next
          );
        } catch (emailError) {
          logger.error(`Email notification error: ${emailError.message}`);
        }
      } else if (err.errors) {
        Object.entries(err.errors).forEach(([key, value]) => {
          response[key] = value.message;
        });
      }

      next(new HttpError(message, status, response));
    }
  },

  async list(
    { skip = 0, limit = 100, filter = {}, sort = { createdAt: -1 } } = {},
    next
  ) {
    try {
      const totalCount = await this.countDocuments(filter).exec();

      const response = await this.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "publicprofiles",
            localField: "_id",
            foreignField: "user",
            as: "profile",
          },
        },
        { $unset: FIELDS_TO_EXCLUDE },
        { $sort: sort },
        { $skip: parseInt(skip) },
        { $limit: parseInt(limit) },
      ]);

      return {
        success: true,
        message: !isEmpty(response)
          ? "Users retrieved successfully"
          : "No users found",
        data: response,
        totalCount,
        status: httpStatus.OK,
      };
    } catch (error) {
      logObject("the error", error);
      logger.error(`List error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async findByEmail(email, next) {
    try {
      const user = await this.findOne({ email }).exec();

      if (!user) {
        return next(new HttpError("User not found", httpStatus.NOT_FOUND));
      }

      return {
        success: true,
        data: user,
        message: "User found successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Find by email error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateById(userId, updateData, next) {
    try {
      const user = await this.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      if (!user) {
        return next(new HttpError("User not found", httpStatus.NOT_FOUND));
      }

      return {
        success: true,
        data: user,
        message: "User updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async deleteById(userId, next) {
    try {
      const user = await this.findByIdAndDelete(userId).exec();

      if (!user) {
        return next(new HttpError("User not found", httpStatus.NOT_FOUND));
      }

      return {
        success: true,
        data: user,
        message: "User deleted successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Delete error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async bulkUpdate(filter, update, next) {
    try {
      const result = await this.updateMany(filter, update).exec();

      return {
        success: true,
        data: result,
        message: `Successfully updated ${result.modifiedCount} users`,
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Bulk update error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async listByUserType(userType, options = {}, next) {
    try {
      const { skip = 0, limit = 100, sort = { createdAt: -1 } } = options;

      const users = await this.find({ userType })
        .sort(sort)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();

      const totalCount = await this.countDocuments({ userType }).exec();

      return {
        success: true,
        data: users,
        totalCount,
        message: `Successfully retrieved ${userType} users`,
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`List by user type error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateLoginStats(userId, next) {
    try {
      const user = await this.findByIdAndUpdate(
        userId,
        {
          $set: { lastLogin: new Date() },
          $inc: { loginCount: 1 },
        },
        { new: true }
      ).exec();

      if (!user) {
        return next(new HttpError("User not found", httpStatus.NOT_FOUND));
      }

      return {
        success: true,
        data: user,
        message: "Login stats updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update login stats error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async searchUsers(searchQuery, options = {}, next) {
    try {
      const { skip = 0, limit = 100, sort = { createdAt: -1 } } = options;

      const query = {
        $or: [
          { firstName: { $regex: searchQuery, $options: "i" } },
          { lastName: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { userName: { $regex: searchQuery, $options: "i" } },
        ],
      };

      const users = await this.find(query)
        .sort(sort)
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();

      const totalCount = await this.countDocuments(query).exec();

      return {
        success: true,
        data: users,
        totalCount,
        message: "Search completed successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Search users error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async retrieveUsersInBulk(
    userIds,
    {
      fields = null, // Optional field projection
      lean = true, // Default to lean queries for better performance
      batchSize = 1000, // For cursor pagination
    } = {}
  ) {
    try {
      // Validate and prepare userIds
      const validUserIds = userIds
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      // Create base query
      let query = this.find({
        _id: { $in: validUserIds },
      });
      // Add field projection if specified
      if (fields) {
        query = query.select(fields);
      }
      // For small result sets (under batchSize)
      if (validUserIds.length <= batchSize) {
        // Use lean for better performance when we don't need document methods
        if (lean) {
          query = query.lean();
        }
        const users = await query.exec();
        // Maintain the order of requested userIds
        const userMap = new Map(
          users.map((user) => [user._id.toString(), user])
        );
        return validUserIds.map((id) => userMap.get(id.toString()) || null);
      }
      // For large result sets, use cursor-based pagination
      const users = [];
      const cursor = query.cursor({ batchSize });

      // Process in batches
      for (
        let doc = await cursor.next();
        doc != null;
        doc = await cursor.next()
      ) {
        users.push(lean ? doc.toObject() : doc);

        // Optional: Add delay between batches to reduce server load
        if (users.length % batchSize === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      // Maintain the order of requested userIds
      const userMap = new Map(users.map((user) => [user._id.toString(), user]));
      return validUserIds.map((id) => userMap.get(id.toString()) || null);
    } catch (error) {
      logger.error(`Bulk user retrieval error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },
};

// User Instance Methods
const userInstanceMethods = {
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      logger.error(`Password verification error: ${error.message}`);
      return false;
    }
  },

  async generateAuthToken() {
    try {
      const token = jwt.sign(
        {
          _id: this._id,
          userType: this.userType,
          email: this.email,
          verified: this.verified,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return token;
    } catch (error) {
      logger.error(`Token generation error: ${error.message}`);
      throw error;
    }
  },

  async generatePasswordResetToken() {
    try {
      const resetToken = crypto.randomBytes(32).toString("hex");
      this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      await this.save();
      return resetToken;
    } catch (error) {
      logger.error(`Reset token generation error: ${error.message}`);
      throw error;
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const isMatch = await this.verifyPassword(currentPassword);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      this.password = await bcrypt.hash(newPassword, 10);
      await this.save();
      return true;
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      throw error;
    }
  },

  getPublicProfile() {
    return {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userType: this.userType,
      profileComplete: this.profileComplete,
      verified: this.verified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  },

  toJSON() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
  },

  async toAuthJSON() {
    const token = await this.createToken();
    logObject("the token being generated", token);
    return {
      _id: this._id,
      userName: this.userName,
      token: `JWT ${token}`,
      email: this.email,
    };
  },

  async createToken() {
    try {
      const filter = { _id: this._id };
      const userWithDerivedAttributes = await getUserModel("sti").list({
        filter,
      });
      if (
        userWithDerivedAttributes.success &&
        userWithDerivedAttributes.success === false
      ) {
        logger.error(
          `Internal Server Error -- ${JSON.stringify(
            userWithDerivedAttributes
          )}`
        );
        return userWithDerivedAttributes;
      } else {
        const user = userWithDerivedAttributes.data[0];
        const oneDayExpiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        const oneHourExpiry = Math.floor(Date.now() / 1000) + 60 * 60;
        logObject("user", user);
        return jwt.sign(
          {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            email: user.email,
            profilePicture: user.profilePicture,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin,
            // exp: oneHourExpiry,
          },
          constants.JWT_SECRET
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error --- ${error.message}`);
    }
  },
};

// Apply methods to schema
Object.assign(baseUserSchema.statics, userStaticMethods);
Object.assign(baseUserSchema.methods, userInstanceMethods);

// Public Profile Static Methods
const publicProfileStaticMethods = {
  async createProfile(profileData, next) {
    try {
      const existingProfile = await this.findOne({
        user: profileData.user,
      }).exec();
      if (existingProfile) {
        return next(
          new HttpError("Profile already exists", httpStatus.CONFLICT, {
            message: "User already has a public profile",
          })
        );
      }

      const profile = await this.create(profileData);

      return {
        success: true,
        data: profile,
        message: "Public profile created successfully",
        status: httpStatus.CREATED,
      };
    } catch (error) {
      logger.error(`Create profile error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async getPublicProfile(userId, next) {
    try {
      const profile = await this.findOne({ user: userId })
        .populate("user", "-password -resetPasswordToken -resetPasswordExpires")
        .exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Public profile retrieved successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Get profile error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateProfile(userId, updateData, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Public profile updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update profile error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async deleteProfile(userId, next) {
    try {
      const profile = await this.findOneAndDelete({ user: userId }).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Public profile deleted successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Delete profile error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateVisibility(userId, visibility, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        { $set: { visibility } },
        { new: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Profile visibility updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update visibility error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async addAchievement(userId, achievementData, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        {
          $push: {
            achievements: {
              ...achievementData,
              date: achievementData.date || new Date(),
            },
          },
        },
        { new: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Achievement added successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Add achievement error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async removeAchievement(userId, achievementId, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        { $pull: { achievements: { _id: achievementId } } },
        { new: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Achievement removed successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Remove achievement error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateSkills(userId, skills, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        { $set: { skills } },
        { new: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Skills updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update skills error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async updateSocialLinks(userId, socialLinks, next) {
    try {
      const profile = await this.findOneAndUpdate(
        { user: userId },
        { $set: { socialLinks } },
        { new: true }
      ).exec();

      if (!profile) {
        return next(
          new HttpError("Profile not found", httpStatus.NOT_FOUND, {
            message: "Public profile does not exist for this user",
          })
        );
      }

      return {
        success: true,
        data: profile,
        message: "Social links updated successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Update social links error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async listPublicProfiles({ skip = 0, limit = 100, filter = {} } = {}, next) {
    try {
      // Only fetch profiles with public visibility unless specifically filtered
      const visibility = filter.visibility || "public";
      const queryFilter = { ...filter, visibility };

      const totalCount = await this.countDocuments(queryFilter).exec();

      const profiles = await this.find(queryFilter)
        .populate("user", "-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();

      return {
        success: true,
        data: profiles,
        totalCount,
        message: "Public profiles retrieved successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`List profiles error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },

  async searchProfiles(searchQuery, options = {}, next) {
    try {
      const { skip = 0, limit = 100, visibility = "public" } = options;

      const query = {
        visibility,
        $or: [
          { headline: { $regex: searchQuery, $options: "i" } },
          { bio: { $regex: searchQuery, $options: "i" } },
          { skills: { $in: [new RegExp(searchQuery, "i")] } },
        ],
      };

      const totalCount = await this.countDocuments(query).exec();

      const profiles = await this.find(query)
        .populate("user", "-password -resetPasswordToken -resetPasswordExpires")
        .sort({ createdAt: -1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit))
        .exec();

      return {
        success: true,
        data: profiles,
        totalCount,
        message: "Search completed successfully",
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`Search profiles error: ${error.message}`);
      if (error instanceof HttpError) {
        return next(error);
      }
      return next(
        new HttpError("Internal Server Error", httpStatus.INTERNAL_SERVER_ERROR)
      );
    }
  },
};

// Public Profile Instance Methods
const publicProfileInstanceMethods = {
  toJSON() {
    const obj = this.toObject();

    // Clean up user object if populated
    if (obj.user && typeof obj.user === "object") {
      delete obj.user.password;
      delete obj.user.resetPasswordToken;
      delete obj.user.resetPasswordExpires;
    }

    return obj;
  },

  isVisible(requestingUserId) {
    if (this.visibility === "public") return true;
    if (this.visibility === "private")
      return this.user.toString() === requestingUserId.toString();
    // Add more visibility logic here if needed
    return false;
  },

  async updateLastModified() {
    this.updatedAt = new Date();
    await this.save();
  },
};

// Apply methods to schema
Object.assign(publicProfileSchema.statics, publicProfileStaticMethods);
Object.assign(publicProfileSchema.methods, publicProfileInstanceMethods);

function getUserModel(tenant) {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;

  try {
    let users = mongoose.model("users");
    return users;
  } catch (error) {
    let users = getModelByTenant(dbTenant, "user", baseUserSchema);

    // Array of discriminator configurations
    const discriminators = [
      { name: "entrepreneur", schema: entrepreneurSchema },
      { name: "investor", schema: investorSchema },
      { name: "bdsProvider", schema: bdsProviderSchema },
      { name: "academia", schema: academiaSchema },
      { name: "generalPartner", schema: generalPartnerSchema },
      { name: "stiStaff", schema: stiStaffSchema },
    ];

    // Safely create each discriminator
    discriminators.forEach(({ name, schema }) => {
      try {
        if (!users.discriminators || !users.discriminators[name]) {
          users.discriminator(name, schema);
        }
      } catch (err) {
        // Ignore if discriminator already exists
        if (!err.message.includes("already exists")) {
          throw err;
        }
      }
    });

    return users;
  }
}

function getPublicProfileModel(tenant) {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;

  try {
    let publicProfiles = mongoose.model("publicprofiles");
    return publicProfiles;
  } catch (error) {
    let publicProfiles = getModelByTenant(
      dbTenant,
      "publicprofile",
      publicProfileSchema
    );
    return publicProfiles;
  }
}

module.exports = {
  UserModel: getUserModel,
  PublicProfileModel: getPublicProfileModel,
};
