import { RequestUpdateUserDto } from "../../dto/User/req-update-user.dto";
import { User } from "../../entity/User";

export const updateUser = async (
  requestUserDto: RequestUpdateUserDto
): Promise<User> => {
  const user = await User.findOneByOrFail({ id: requestUserDto.id });

  Object.assign(user, requestUserDto);

  return await User.save(user);
};

export const findUser = async (id: number) => {
  return await User.findOneByOrFail({ id: id });
};

export const deleteUser = async (id: number) => {
  const user = await User.findOneByOrFail({ id: id });
  return await User.softRemove(user);
};

export const truncateUser = async (id: number) => {
  const user = await User.findOneByOrFail({ id: id });
  return await User.remove(user);
};
