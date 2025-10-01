import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Project from "../models/project.models.js";

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
