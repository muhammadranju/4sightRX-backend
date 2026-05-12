import { ILog } from './log.interface';
import { Log } from './log.model';

const createLog = async (payload: ILog) => {
  const result = await Log.create(payload);
  return result;
};

const getLogsByOrganization = async (organizationId: string, type?: string) => {
  const query: any = { organizationId };
  if (type) query.type = type;
  const result = await Log.find(query).sort({ createdAt: -1 });
  return result;
};

export const LogService = {
  createLog,
  getLogsByOrganization,
};
