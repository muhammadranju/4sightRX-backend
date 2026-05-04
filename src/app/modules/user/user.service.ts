import mongoose from 'mongoose';
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

const getAllUsersFromDB = async (
  page = 1,
  limit = 10,
  searchTerm?: string,
  agencyId?: string,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc',
) => {
  const skip = (page - 1) * limit;

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'facilities',
        localField: 'agencyId',
        foreignField: '_id',
        as: 'agency',
      },
    },
    { $unwind: { path: '$agency', preserveNullAndEmptyArrays: true } },
  ];

  const match: any = {};
  if (searchTerm) {
    const searchableFields = [
      'name',
      'email',
      'role',
      'hospitalName',
      'specialty',
      'agency.facilityName',
    ];
    match.$or = searchableFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    }));
  }

  if (agencyId) {
    match.agencyId = new mongoose.Types.ObjectId(agencyId);
  }

  pipeline.push({ $match: match });

  // Sorting logic
  const sortStage: any = {};
  if (sortBy === 'agencyName') {
    sortStage['agency.facilityName'] = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortStage[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;
  }
  pipeline.push({ $sort: sortStage });

  const [data, countResult] = await Promise.all([
    User.aggregate(pipeline).skip(skip).limit(limit),
    User.aggregate([...pipeline, { $count: 'total' }]),
  ]);

  const total = countResult[0]?.total || 0;

  return { data, total, page, limit };
};

const updateStatusToDB = async (id: string, status: string) => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    { status },
    {
      new: true,
    },
  );

  return updateDoc;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsersFromDB,
  updateStatusToDB,
};
