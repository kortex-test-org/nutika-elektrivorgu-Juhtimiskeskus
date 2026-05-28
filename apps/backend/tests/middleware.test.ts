process.env.JWT_SECRET = "test-secret"

import { beforeEach, describe, expect, it, mock } from "bun:test"
import { Elysia } from "elysia"

// Setup dynamic mock first before importing the middleware
const mockGetUserById = mock((id: string) => {
  if (id === "non-existent-user-id") return Promise.resolve(null)
  if (id === "deactivated-user-id") {
    return Promise.resolve({
      id: "deactivated-user-id",
      username: "deactivated",
      role: "user",
      isActive: false,
    })
  }
  if (id === "active-user-id") {
    return Promise.resolve({
      id: "active-user-id",
      username: "activeuser",
      role: "user",
      isActive: true,
    })
  }
  if (id === "user-id") {
    return Promise.resolve({
      id: "user-id",
      username: "regularuser",
      role: "user",
      isActive: true,
    })
  }
  if (id === "admin-id") {
    return Promise.resolve({
      id: "admin-id",
      username: "adminuser",
      role: "master",
      isActive: true,
    })
  }
  return Promise.resolve(null)
})

mock.module("../src/db/repository/user", () => ({
  getUserById: mockGetUserById,
}))

mock.module("../src/config", () => ({
  config: { jwtSecret: "test-secret", port: 3000 },
}))

import { jwt } from "@elysiajs/jwt"
import { authMiddleware } from "../src/middleware/auth"
import { roleMiddleware } from "../src/middleware/role"

describe("middleware tests", () => {
  beforeEach(() => {
    mockGetUserById.mockClear()
  })

  const generateToken = async (payload: { id: string }): Promise<string> => {
    const jwtHelper = new Elysia().use(jwt({ name: "jwt", secret: "test-secret" }))
    const appTemp = jwtHelper.get("/", async ({ jwt }) => {
      return await jwt.sign(payload)
    })
    const res = await appTemp.handle(new Request("http://localhost/"))
    return await res.text()
  }

  it("authMiddleware throws 401 when no authorization header is present", async () => {
    const app = new Elysia().use(authMiddleware).get("/test", () => "success")

    const response = await app.handle(new Request("http://localhost/test"))
    expect(response.status).toBe(401)
  })

  it("authMiddleware throws 401 with invalid authorization header format", async () => {
    const app = new Elysia().use(authMiddleware).get("/test", () => "success")

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { authorization: "InvalidToken" },
      }),
    )
    expect(response.status).toBe(401)
  })

  it("authMiddleware throws 401 if user does not exist in DB", async () => {
    const token = await generateToken({ id: "non-existent-user-id" })

    const app = new Elysia().use(authMiddleware).get("/test", () => "success")

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { authorization: `Bearer ${token}` },
      }),
    )

    expect(response.status).toBe(401)
    expect(mockGetUserById).toHaveBeenCalledWith("non-existent-user-id")
  })

  it("authMiddleware throws 401 if user is deactivated", async () => {
    const token = await generateToken({ id: "deactivated-user-id" })

    const app = new Elysia().use(authMiddleware).get("/test", () => "success")

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { authorization: `Bearer ${token}` },
      }),
    )

    expect(response.status).toBe(401)
  })

  it("authMiddleware resolves user details and returns 200", async () => {
    const token = await generateToken({ id: "active-user-id" })

    const app = new Elysia().use(authMiddleware).get("/test", ({ user }) => {
      return { user }
    })

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { authorization: `Bearer ${token}` },
      }),
    )

    expect(response.status).toBe(200)
    const json = (await response.json()) as any
    expect(json.user.id).toBe("active-user-id")
    expect(json.user.role).toBe("user")
  })

  it("roleMiddleware throws 403 for user role", async () => {
    const token = await generateToken({ id: "user-id" })

    const app = new Elysia()
      .use(authMiddleware)
      .use(roleMiddleware)
      .get("/admin", () => "admin-success")

    const response = await app.handle(
      new Request("http://localhost/admin", {
        headers: { authorization: `Bearer ${token}` },
      }),
    )

    expect(response.status).toBe(403)
  })

  it("roleMiddleware returns 200 for master role", async () => {
    const token = await generateToken({ id: "admin-id" })

    const app = new Elysia()
      .use(authMiddleware)
      .use(roleMiddleware)
      .get("/admin", () => "admin-success")

    const response = await app.handle(
      new Request("http://localhost/admin", {
        headers: { authorization: `Bearer ${token}` },
      }),
    )

    expect(response.status).toBe(200)
  })
})
