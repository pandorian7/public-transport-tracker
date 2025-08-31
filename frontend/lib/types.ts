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
  route: string;
  distance: string;
  polyline: string;
  coordinates: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  };
};

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
};

export type Route = {
  id: number;
  A_LAT: number;
  A_LON: number;
  A_Name: string;
  B_LAT: number;
  B_LON: number;
  B_Name: string;
  distance: number;
  polyline: string;
};

export type Place = {
  place_id: number;
  lat: number;
  lon: number;
  name: string;
};

export type Trip = {
  id?: number;
  Route_Id: number;
  Direction: "forward" | "backward";
  Loc_LAT: number;
  Loc_LON: number;
  Loc_Frac: number;
  Loc_TimeStamp: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
};
