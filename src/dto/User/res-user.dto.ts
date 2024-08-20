import { User } from "../../entity/User";

export class ResponseUserDto {
  id: number;
  username: string;
  email: string;
  subscription: string;

  constructor(props: {
    id: number;
    username: string;
    email: string;
    subscription: string;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.subscription = this.subscription;
  }

  static fromEntity(user: User) {
    return new ResponseUserDto({
      id: user.id,
      username: user.username,
      email: user.email,
      subscription: user.subscription,
    });
  }
}
