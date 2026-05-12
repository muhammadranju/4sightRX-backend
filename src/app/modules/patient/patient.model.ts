import { Schema, model } from 'mongoose';
import { LifeExpectancy, INewPatient, Sex } from './patient.interface';
import { PartialStatus } from '../../../enums/user';

const patientSchema = new Schema<INewPatient>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    patientIdMrn: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    age: { type: Number },
    sex: {
      type: String,
      enum: Object.values(Sex),
      required: [true, 'Sex is required'],
    },
    allergies: [
      {
        allergyId: {
          type: Schema.Types.ObjectId,
          ref: 'Allergy',
        },
        name: { type: String },
        custom: { type: Boolean, default: false },
      },
    ],
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
    },
    lifeExpectancy: {
      type: String,
      enum: Object.values(LifeExpectancy),
      required: [true, 'Life expectancy is required'],
    },
    status: {
      type: String,
      enum: Object.values(PartialStatus),
      default: PartialStatus.PENDING,
    },
    patientUploads: [
      {
        url: { type: String },
        type: { type: String, default: 'image' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true },
);

// Compound index if needed
// patientSchema.index({ ... });

const Patient = model<INewPatient>('Patient', patientSchema);

export default Patient;
