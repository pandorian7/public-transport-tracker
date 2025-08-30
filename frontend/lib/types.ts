import { z } from "zod";
import {
  bookingSchema,
  createServiceSchema,
  departmentSchema,
  feedbackSchema,
  loginSchema,
  onboardingSchema,
  registerSchema,
} from "./schema";

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type CreateServiceFormData = z.infer<typeof createServiceSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export type Status = {
  status: "default" | "success" | "error";
  message: string;
  data?: object;
};

export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

export type TransportOption = {
  id: string;
  type: "bus" | "train" | "metro";
  route: string;
  arrival: string;
  duration: string;
  stops: number;
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  nationalId: string;
  dateOfBirth: Date;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  isVerified: boolean;
  role: string;
  employeeId?: string;
  departmentId?: string;
  createdAt: Date;
};

export type Feedback = {
  id: string;
  rating: number;
  comment: string | null;
  isAnonymous: boolean;
  createdAt: string;
  user: User;
};
