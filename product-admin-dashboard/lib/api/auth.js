import api from "@/lib/axios";

export function loginRequest(username, password) {
  return api
    .post("/auth/login", {
      username,
      password,
      expiresInMins: 60,
    })
    .then((res) => res.data);
}
