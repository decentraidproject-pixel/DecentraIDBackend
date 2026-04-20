const mongoose = require("mongoose");

const institutionBasicSchema = new mongoose.Schema({
  officialName: String,
  organizationType: String,
  fullInstitutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstitutionFull"
  }
}, { timestamps: true });

module.exports = mongoose.model(
  "VerifierBasic",
  institutionBasicSchema,
  "verifier_basic"
);
