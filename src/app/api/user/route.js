// import UserService from "../../../lib/services/sheetsImpl/UserService";
// import UserRepository from "@/lib/repositories/sheetsImpl/UserRepository";

// const userService = new UserService(
//     new UserRepository()
// );

// export async function PATCH(req) {
//   try {
//     const { id, mobileNumber } = await req.json();
//     console.log(id, mobileNumber)
//     const result = await userService.update(id, mobileNumber);
//     return Response.json({ message: "Successfully Updated", data: result }, { status: 200 });
//   } catch (err) {
//     console.error("User API Error:", err);
//     return Response.json({ error: err.message }, { status: 500 });
//   }
// }

// export async function GET() {
//   return Response.json({message: "Up"})
// }
