
export class AuthService {
  logout(res: import("express").Response): void {
    res.clearCookie("login", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
    });
  }
}
