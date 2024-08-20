export class ResponseTokenDto {
  access_token: string;
  refresh_token: string;

  constructor(props: { access_token: string; refresh_token: string }) {
    this.access_token = props.access_token;
    this.refresh_token = props.refresh_token;
  }
}
