import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    trim: true,
    required: true,  
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   
      required: true, 
    }
  ]
}, {
  timestamps: true 
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
