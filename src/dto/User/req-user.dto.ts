import { User } from "../../entity/User";

export class RequestUserDto {
  username: string;
  email: string;
  password: string;
  subscription: string;

  constructor(props: {
    username: string;
    email: string;
    password: string;
    subscription: string;
  }) {
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.subscription = props.subscription;
  }

  static fromEntity(user: User) {
    return new RequestUserDto({
      username: user.username,
      email: user.email,
      password: user.password,
      subscription: user.subscription,
    });
  }
}
