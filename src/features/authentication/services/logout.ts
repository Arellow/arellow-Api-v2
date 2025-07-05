
export class AuthService {
  logout(res: import("express").Response): void {

    res.removeHeader("Authorization");
    res.removeHeader("x-refresh-token");

    res.clearCookie("login", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
    });
  }
}
