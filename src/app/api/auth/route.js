import AuthService from "../../../lib/services/sheetsImpl/AuthService";
import UserRepository from "@/lib/repositories/sheetsImpl/UserRepository";

const authService = new AuthService(
    new UserRepository()
);

export async function POST(req) {
  try {
    const body = await req.json();
    // verify email is already signed up
    if (body.action === "check-email") {
      const { email } = body;
      if (!email) throw new Error("Email is required");
      const result = await authService.checkEmail(email);
      return Response.json({data: result}, { status: 200 });
    }

    // --- 2️⃣ Handle sign-up ---
    if (body.action === "signup") {
      const { firstName, lastName, email, phone, password } = body;

      // --- Validation ---
      if (!firstName || !lastName || !email || !phone || !password)
        throw new Error("All fields are required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("Invalid email format");

      // You can also validate password strength or phone number here
      // e.g. if (password.length < 8) throw new Error("Password too short");

      // --- Check if email already exists ---
      const existingUser = await authService.checkEmail(email);
      if (existingUser?.exists)
        throw new Error("Email already registered. Please log in.");

      const user = await authService.createUser({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      return Response.json(
          {
            message: "Account created successfully",
            data: { user },
          },
          { status: 201 }
      );
    }

    // Handle google signin
    const { provider, idToken } = body;
    if (provider === 'google') {
      const result = await authService.googleSignIn(idToken);
      return Response.json({message: "Login Successful", data: result},
          {status: 200});
    } else {
      const {email, password} = body;
      const result = await authService.localSignIn(email, password);
      return Response.json({message: "Login Successful", data: result},
          {status: 200});
    }
  } catch (err) {
    console.error("Auth API Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({message: "Up"})
}
