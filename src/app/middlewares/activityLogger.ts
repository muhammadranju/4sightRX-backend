import { NextFunction, Request, Response } from 'express';
import { User } from '../modules/user/user.model';
import { Activity } from '../modules/activity/activity.model';

const activityLogger = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only track POST requests
    if (req.method === 'POST') {
      // We wait for the response to finish to ensure the action was successful
      res.on('finish', async () => {
        // Log only successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // User should be available if auth middleware was used
            if (req.user) {
              const userData = await User.findById(req.user.id);
              if (userData) {
                const actionDescription = getActionDescription(req);
                
                // If we don't want to log certain POST requests (like login/register), 
                // we can return early in getActionDescription or here.
                if (actionDescription) {
                  await Activity.create({
                    user: userData._id,
                    name: userData.name,
                    specialization: userData.specialty || 'N/A',
                    action: actionDescription,
                  });
                }
              }
            }
          } catch (error) {
            // Silently log error to console but don't disrupt the request flow
            console.error('Activity Logging Error:', error);
          }
        }
      });
    }
    next();
  };
};

const getActionDescription = (req: Request): string | null => {
  const url = req.originalUrl || req.url;
  
  // Skip logging for auth related POST requests if needed
  if (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/verify-email')) {
    return null;
  }

  if (url.includes('/patients')) return 'Created a new patient';
  if (url.includes('/medications/extract-text')) return 'Extracted medication from image';
  if (url.includes('/medications/bulk')) return 'Bulk added medications';
  if (url.includes('/medications')) return 'Added a new medicine';
  if (url.includes('/formulary-comparison')) return 'Performed formulary comparison';
  if (url.includes('/therapeutics')) return 'Added therapeutic data';

  // Default action description if no specific match
  return `Performed a ${req.method} operation on ${url.split('?')[0]}`;
};

export default activityLogger;
