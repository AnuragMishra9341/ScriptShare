import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Project from "../models/project.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import Message from "../models/chats.models.js";
export const createProject = asyncHandler(async (req, res) => {
  const { projectName } = req.body;
  if (!projectName) {
    throw new ApiError(400, "Project Name is required");
  }

  const user = req.user;
  //   console.log(user._id);
  const project = await Project.create({
    projectName,
    users: user._id,
  });

  if (!project) {
    throw new ApiError(500, "User is not created");
  }

  //   console.log('user id is ->',project.user);

  res
    .status(201)
    .json(new ApiResponse(201, [project], "Project created successfully"));
});


export const addUser = asyncHandler(async (req, res) => {
  const sender = req.user;
  const { email:partnerEmail, projectId } = req.body;
  if (!partnerEmail || !projectId) {
    throw new ApiError(400, "Collaborating credentials are invalid");
  }

  const partner = await User.findOne({ email: partnerEmail });
  if (!partner) {
    throw new ApiError(404, "Not registered");
  }

  const project_Id = new mongoose.Types.ObjectId(projectId);

  const object = await Project.findByIdAndUpdate(
    project_Id,
    { $addToSet: { users: partner._id } },
    { new: true }
  );
   res.status(200).json(new ApiResponse(200,object,'Partner added successfully'));
});


export const getCollaborators = asyncHandler(async (req,res)=>{
          const { projectId } = req.params;

  // 1. Find the project
   const project_Id = new mongoose.Types.ObjectId(projectId);
  const project = await Project.findById(project_Id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // 2. Fetch all users whose _id is in project.users
  const users = await User.find({ _id: { $in: project.users } }).select("email");

  // 3. Map emails
  const emails = users.map((user) => user.email);

  // 4. Return emails array
  res.status(200).json({ data: emails })
})


export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?._id;

  console.log(`deleteProject called for projectId = ${projectId}, by user = ${userId}`);

  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: "Project ID is required",
    });
  }

  // ✅ Convert string → ObjectId
  let mongoId;
  try {
    mongoId = new mongoose.Types.ObjectId(projectId);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID format",
    });
  }

  // find the project now using real ObjectId
  const project = await Project.findById(mongoId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  
  // delete project
  await Project.findByIdAndDelete(mongoId);

  // delete related messages (message.projectId must match project._id)
  await Message.deleteMany({ projectId: project._id });

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
});