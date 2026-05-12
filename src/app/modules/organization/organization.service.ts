import { IOrganization } from './organization.interface';
import { Organization } from './organization.model';

const createOrganization = async (
  payload: IOrganization,
): Promise<IOrganization> => {
  const result = await Organization.create(payload);
  return result;
};

const getAllOrganizations = async () => {
  const result = await Organization.find();
  return result;
};

const updateOrganization = async (
  id: string,
  payload: Partial<IOrganization>,
): Promise<IOrganization | null> => {
  const result = await Organization.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getOrganizationById = async (
  id: string,
): Promise<IOrganization | null> => {
  const result = await Organization.findById(id);
  return result;
};

const deleteOrganization = async (
  id: string,
): Promise<IOrganization | null> => {
  const result = await Organization.findByIdAndDelete(id);
  return result;
};

export const OrganizationService = {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  getOrganizationById,
  deleteOrganization,
};
