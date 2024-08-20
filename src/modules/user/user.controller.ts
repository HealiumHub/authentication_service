import { Request, Response } from "express";
import { RequestUpdateUserDto } from "../../dto/User/req-update-user.dto";
import { ResponseUserDto } from "../../dto/User/res-user.dto";
import { asyncHandler } from "../../middleware/async";
import { deleteUser, findUser, truncateUser, updateUser } from "./user.service";

export const findUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id) {
      throw new Error("invalid id");
    }

    const user = await findUser(+id);
    const resUser = ResponseUserDto.fromEntity(user);

    res.json({
      success: true,
      data: resUser,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const requestUserDto: RequestUpdateUserDto = req.body;

    const updatedUser = await updateUser(requestUserDto);
    const resUser = ResponseUserDto.fromEntity(updatedUser);

    res.json({
      success: true,
      data: resUser,
    });
  }
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      throw new Error("invalid id");
    }

    await deleteUser(+id);

    res.json({
      success: true,
    });
  }
);

export const truncateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      throw new Error("invalid id");
    }

    await truncateUser(+id);

    res.json({
      success: true,
    });
  }
);
