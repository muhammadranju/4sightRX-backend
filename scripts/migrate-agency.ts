import mongoose from 'mongoose';
import { User } from '../src/app/modules/user/user.model';
import { Facility } from '../src/app/modules/facility/facility.model';
import config from '../src/config';

const migrate = async () => {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('Connected to database');

    // 1. Ensure at least one facility exists
    let defaultFacility = await Facility.findOne();
    if (!defaultFacility) {
      console.log('No facility found, creating a default one...');
      defaultFacility = await Facility.create({
        facilityName: 'General Agency',
        type: 'Hospice',
        location: 'Default',
        address: 'Default Address',
        phone: '000-000-0000',
        status: 'active',
      });
    }

    // 2. Update users without agencyId
    const usersWithoutAgency = await User.find({ agencyId: { $exists: false } });
    console.log(`Found ${usersWithoutAgency.length} users without agencyId`);

    if (usersWithoutAgency.length > 0) {
      const result = await User.updateMany(
        { agencyId: { $exists: false } },
        { $set: { agencyId: defaultFacility._id } }
      );
      console.log(`Updated ${result.modifiedCount} users`);
    }

    // 3. Update formulary data without agencyId
    // (Optional: you might want to assign them to the same default facility)
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
