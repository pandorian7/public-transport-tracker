"use server";
import { FieldValues } from "react-hook-form";
import { axiosPublic } from "./axios";
import { isAxiosError } from "axios";
import { Status } from "./types";

//auth actions
export const loginAction = async (data: FieldValues) => {
  try {
    const response = await axiosPublic.post("/auth/sign-in", data);
    console.log(response.data);
    const accessToken = response.data.accessToken;
    const refreshToken = response.data.refreshToken;
    const accessTokenExpiresIn = response.data.accessTokenExpiresIn;
    const refreshTokenExpiresIn = response.data.refreshTokenExpiresIn;
    return {
      data: {
        user: { ...response.data.user },
        tokenInfo: {
          accessToken,
          refreshToken,
          accessTokenExpiresIn,
          refreshTokenExpiresIn,
        },
      },
      message: response.data.message,
      status: "success",
    } as Status;
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        message: error.response?.data.message,
        status: "error",
      } as Status;
    }
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axiosPublic.get("/auth/refresh", {
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    console.log(response);
    const newAccessToken = response.data.accessToken;
    const newRefreshToken = response.data.refreshToken;
    const newAccessTokenExpiresIn = response.data.accessTokenExpiresIn;
    const newRefreshTokenExpiresIn = response.data.refreshTokenExpiresIn;

    return {
      data: {
        accessToken: newAccessToken,
        accessTokenExpiresIn: newAccessTokenExpiresIn,
        refreshToken: newRefreshToken,
        refreshTokenExpiresIn: newRefreshTokenExpiresIn,
      },
      message: response.data.message,
      status: "success",
    } as Status;
  } catch (error) {
    if (isAxiosError(error)) {
      return {
        message: error.response?.data.message,
        status: "error",
      } as Status;
    }
  }
};

export const signUpAction = async (data: FieldValues) => {
  try {
    const response = await axiosPublic.post("auth/sign-up", data);
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: response.data.message as string,
    } as Status;
  } catch (error) {
    console.log(error, "SIGN UP ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

export const completeOnboarding = async (userId: string, data: FieldValues) => {
  try {
    const response = await axiosPublic.post(
      `auth/complete-onboarding?id=${userId}`,
      data
    );
    console.log(response.data);
    return {
      status: "success",
      data: response.data.updatedUser,
      message: response.data.message as string,
    } as Status;
  } catch (error) {
    console.log(error, "ONBORDING ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

//routes actions
export const getAllRoutes = async () => {
  try {
    const response = await axiosPublic.get("routes");
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: response.data.message as string,
    } as Status;
  } catch (error) {
    console.log(error, "FETCHING ALL ROUTES ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

// search places by querry
export const searchPlaces = async (query: string) => {
  try {
    const response = await axiosPublic.get(
      `routes/search?query=${encodeURIComponent(query)}`
    );
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: "Places found successfully",
    } as Status;
  } catch (error) {
    console.log(error, "SEARCH PLACES ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

// create route between two places
export const createRouteSegment = async (placeA: number, placeB: number) => {
  try {
    const response = await axiosPublic.get(
      `routes/segment?A=${placeA}&B=${placeB}`
    );
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: "Route created successfully",
    } as Status;
  } catch (error) {
    console.log(error, "CREATE ROUTE ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

// get specific route by ID
export const getRouteById = async (id: number) => {
  try {
    const response = await axiosPublic.get(`routes/${id}`);
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: "Route fetched successfully",
    } as Status;
  } catch (error) {
    console.log(error, "FETCH ROUTE BY ID ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};

// save current location as a place
export const saveCurrentLocationAsPlace = async (
  lat: number,
  lng: number,
  name: string = "My Location"
) => {
  try {
    const locationQuery = `${lat},${lng}`;
    const response = await axiosPublic.get(
      `routes/search?query=${encodeURIComponent(locationQuery)}`
    );
    console.log(response.data);
    return {
      status: "success",
      data: response.data,
      message: "Current location saved successfully",
    } as Status;
  } catch (error) {
    console.log(error, "SAVE CURRENT LOCATION ERROR");
    if (isAxiosError(error)) {
      return {
        status: "error",
        message: error.response?.data.message,
      } as Status;
    }
  }
};
