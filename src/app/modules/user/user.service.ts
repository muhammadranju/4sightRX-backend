import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import unlinkFile from '../../../shared/unlinkFile';
import { IUser } from './user.interface';
import { User } from './user.model';
import Medication from '../medication/medication.model';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.USER;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  // //send email
  // const otp = generateOTP();
  // const values = {
  //   name: createUser.name,
  //   otp: otp,
  //   email: createUser.email!,
  // };
  // const createAccountTemplate = emailTemplate.createAccount(values);
  // emailHelper.sendEmail(createAccountTemplate);

  // //save to DB
  // const authentication = {
  //   oneTimeCode: otp,
  //   expireAt: new Date(Date.now() + 3 * 60000),
  // };
  // await User.findOneAndUpdate(
  //   { _id: createUser._id },
  //   { $set: { authentication } }
  // );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser> & { medicationCount: number }> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  const findMedication = await Medication.find({ user: id }).countDocuments();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return { ...isExistUser.toObject(), medicationCount: findMedication };
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
};
