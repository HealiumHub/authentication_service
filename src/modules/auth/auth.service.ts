import axios from "axios";
import { addMinutes, differenceInMinutes, parseISO } from "date-fns";
import { producer } from "../../cfg/kafka";
import { AppDataSource } from "../../data-source";
import { BasicMailDto } from "../../dto/Mail/BasicMailDto";
import { ResponseTokenDto } from "../../dto/Token/res-token.dto";
import { RequestUserDto } from "../../dto/User/req-user.dto";
import { ResponseUserDto } from "../../dto/User/res-user.dto";
import { User } from "../../entity/User";
import { NOTIFICATION_SEND_EMAIL } from "../../topics";
import { genRandomString } from "../../utils/randomString";
import {
  GoogleUser,
  OauthGoogleTokenParams,
} from "./types/oauth-google/google.types";

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const RST_PASSWORD_EXPIRE_MINUTE = 5; // 5 Minutes

export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.AC_PRIVATE_KEY, {
    expiresIn: "3h",
  });
};

export const generateRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.RF_PRIVATE_KEY, {
    expiresIn: "7d",
  });
};

export const getOauthGoogleToken = async (code: string) => {
  const params: OauthGoogleTokenParams = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: process.env.GOOGLE_REDICRECT_URI || "",
    grant_type: "authorization_code",
  };
  const constructedUrl = new URL(process.env.GOOGLE_TOKEN_URI || "");
  Object.keys(params).forEach((key) =>
    constructedUrl.searchParams.append(
      key,
      params[key as keyof OauthGoogleTokenParams]
    )
  );

  const { data } = await axios.post(constructedUrl.href, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return data;
};

export const getGoogleUser = async (id_token: string, access_token: string) => {
  const { data } = await axios.get(process.env.GOOGLE_USERINFO_URI || "", {
    params: {
      access_token,
      alt: "json",
    },
    headers: {
      Authorization: `Bearer ${id_token}`,
    },
  });

  let ggUser: GoogleUser = data;
  return ggUser;
};

export const handleSignUp = async (requestUserDto: RequestUserDto) => {
  let user = new User();
  user.username = requestUserDto.username;
  user.email = requestUserDto.email;
  user.password = await bcrypt.hash(
    requestUserDto.password,
    parseInt(process.env.BCRYPT_SALT_ROUNDS || "2")
  );
  await AppDataSource.manager.save(user);

  return user;
};

const _createPaymentCustomer = async (user: User) => {
  const paymentUrl = _resolveCreatePaymentCustomerUrl();

  try {
    const requestCreatePaymentCustomer = await axios.post(paymentUrl, {
      content: {
        email: user.email,
      },
    });

    if (requestCreatePaymentCustomer.status !== 200) {
      throw new Error("create payment customer failed");
    }
  } catch (err) {
    // If failed, delete user
    await AppDataSource.manager.delete(User, { id: user.id });
    throw err;
  }
};

const _resolveCreatePaymentCustomerUrl = (): string => {
  // const protocol = process.env.PAYMENT_SERVICE_PROTOCOL;
  // const host = process.env.PAYMENT_SERVICE_HOST;
  // const port = process.env.PAYMENT_SERVICE_PORT;
  const baseUrl = process.env.PAYMENT_SERVICE_BASE_URL;
  const createPaymentRecordUri =
    process.env.PAYMENT_SERVICE_CREATE_PAYMENT_RECORD_URI;

  return `${baseUrl}${createPaymentRecordUri}`;
};

export const handleSignIn = async (
  email: string,
  password: string
): Promise<ResponseTokenDto> => {
  const user = await AppDataSource.getRepository(User).findOneBy({
    email: email,
  });

  if (!user) {
    throw new Error("invalid credentials");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new Error("invalid credentials");
  }

  let userDto = ResponseUserDto.fromEntity(user);

  let refresh_token = generateRefreshToken({ ...userDto });
  user.refreshToken = refresh_token;
  await AppDataSource.getRepository(User).save(user);

  let token = new ResponseTokenDto({
    access_token: generateAccessToken({ ...userDto }),
    refresh_token: refresh_token,
  });

  return token;
};

export const handleVerifyAccessToken = (token: string): ResponseUserDto => {
  try {
    const decoded: ResponseUserDto = jwt.verify(
      token,
      process.env.AC_PRIVATE_KEY
    );
    return decoded;
  } catch (err) {
    throw err;
  }
};

export const handleVerifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.RF_PRIVATE_KEY);
};

export const handleRevokeToken = async (
  token: string
): Promise<ResponseTokenDto> => {
  let decodedData: User = handleVerifyRefreshToken(token);
  let user = await AppDataSource.getRepository(User).findOneBy({
    email: decodedData.email,
  });

  if (user === null) {
    throw new Error("invalid credentials");
  }

  if (user.refreshToken !== token) {
    throw new Error("invalid credentials");
  }

  let userDto = ResponseUserDto.fromEntity(user);

  let refresh_token = generateRefreshToken({ ...userDto });
  user.refreshToken = refresh_token;
  await AppDataSource.getRepository(User).save(user);

  let resToken = new ResponseTokenDto({
    access_token: generateAccessToken({ ...userDto }),
    refresh_token: refresh_token,
  });

  return resToken;
};

export const handleOauthGoogle = async (
  id_token: string,
  access_token: string
): Promise<ResponseTokenDto> => {
  const googleUser: GoogleUser = await getGoogleUser(id_token, access_token);
  // If invalid email
  if (!googleUser.verified_email) {
    throw new Error("google email not verified");
  }

  // Create new user if not registered
  let user = await _createNewUserIfNotExist(googleUser);

  let userDto = ResponseUserDto.fromEntity(user);

  let refresh_token = generateRefreshToken({ ...userDto });
  user.refreshToken = refresh_token;
  await AppDataSource.getRepository(User).save(user);

  let resToken = new ResponseTokenDto({
    access_token: generateAccessToken({ ...userDto }),
    refresh_token: refresh_token,
  });

  return resToken;
};

export const _createNewUserIfNotExist = async (googleUser: GoogleUser) => {
  let user = await AppDataSource.getRepository(User).findOneBy({
    email: googleUser.email,
  });

  // Save new user with random pwd if email not exists
  if (!user) {
    const genPassword = await bcrypt.hash(
      genRandomString(),
      parseInt(process.env.BCRYPT_SALT_ROUNDS || "2")
    );
    let createUserDto = new RequestUserDto({
      email: googleUser.email,
      username: googleUser.name,
      subscription: "BASIC",
      password: genPassword,
    });

    user = await handleSignUp(createUserDto);

    // await _sendAutoGeneratedPasswordEmail(user.email, genPassword);
  }
  return user;
};

export const handleResetPassword = async (email: string) => {
  let user = await User.findOneByOrFail({
    email: email,
  });

  let code = genRandomString(10);
  let expDate = addMinutes(new Date(), RST_PASSWORD_EXPIRE_MINUTE);
  code = `${code}_${expDate.toISOString()}`;

  user.resetPasswordCode = code;
  await User.save(user);

  await _sendResetPasswordEmail(email, code);
};

const _sendResetPasswordEmail = async (email: string, code: string) => {
  const payload: BasicMailDto = {
    to: email,
    subject: "DoctorAI Reset password",
    message: `Please follow this link to reset your password ${process.env.CLIENT_HOST}/reset-password?code=${code}`,
  };

  await producer.send({
    topic: NOTIFICATION_SEND_EMAIL,
    messages: [
      {
        value: JSON.stringify(payload),
      },
    ],
  });
};

const _sendAutoGeneratedPasswordEmail = async (
  email: string,
  password: string
) => {
  const payload: BasicMailDto = {
    to: email,
    subject: "DoctorAI Password",
    message: `You have created new account on DoctorAI via Google. Your password is ${password}`,
  };

  await producer.send({
    topic: NOTIFICATION_SEND_EMAIL,
    messages: [
      {
        value: JSON.stringify(payload),
      },
    ],
  });
};

export const handleVerifyResetPassword = async (
  code: string,
  email: string,
  newPassword: string
) => {
  let user = await User.findOneByOrFail({
    email: email,
  });

  const receivedActualCode = code.split("_")[0];

  let savedCode = user.resetPasswordCode;
  let refCode = savedCode.split("_")[0];
  console.log("refCode", refCode);
  console.log("received Code", code);
  let expDate = parseISO(savedCode.split("_")[1]);

  if (refCode !== receivedActualCode) {
    throw new Error("invalid code");
  }

  if (differenceInMinutes(new Date(), expDate) > RST_PASSWORD_EXPIRE_MINUTE) {
    throw new Error("expired code");
  }

  user.password = await bcrypt.hash(
    newPassword,
    parseInt(process.env.BCRYPT_SALT_ROUNDS || "2")
  );

  await User.save(user);
};