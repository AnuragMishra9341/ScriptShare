import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Project from "../models/project.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
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
  const project = await Project.findById(projectId);

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