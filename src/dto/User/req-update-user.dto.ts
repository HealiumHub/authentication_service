import { User } from "../../entity/User";

export class RequestUpdateUserDto {
  id: number;
  username: string;
  email: string;
  password: string;
  subscription: string;

  constructor(props: {
    id: number;
    username: string;
    email: string;
    password: string;
    subscription: string;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.subscription = props.subscription;
  }

  static fromEntity(user: User) {
    return new RequestUpdateUserDto({
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      subscription: user.subscription,
    });
  }
}
