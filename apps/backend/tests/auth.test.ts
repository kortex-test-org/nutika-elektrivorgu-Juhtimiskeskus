import { beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("../src/config", () => ({
  config: { jwtSecret: "test-secret", port: 3000 },
}))

describe("auth service", () => {
  const mockGetUserByEmail = mock(() => Promise.resolve(null))
  const mockGetUserCount = mock(() => Promise.resolve(0))
  const mockInsertUser = mock(() =>
    Promise.resolve({ id: "user-1", email: "test@test.com", role: "user" }),
  )
  const mockGetUserById = mock(() => Promise.resolve(null))

  mock.module("../src/db/repository/user", () => ({
    getUserByEmail: mockGetUserByEmail,
    getUserCount: mockGetUserCount,
    insertUser: mockInsertUser,
    getUserById: mockGetUserById,
    getAllUsers: mock(() => Promise.resolve([])),
    updateUser: mock(() => Promise.resolve(null)),
    deleteUser: mock(() => Promise.resolve()),
  }))

  mock.module("@node-rs/argon2", () => ({
    hash: mock(() => Promise.resolve("hashed-password")),
    verify: mock(() => Promise.resolve(true)),
  }))

  beforeEach(() => {
    mockGetUserByEmail.mockClear()
    mockGetUserCount.mockClear()
    mockInsertUser.mockClear()
  })

  it("registers first user as master when no users exist", async () => {
    mockGetUserByEmail.mockResolvedValue(null)
    mockGetUserCount.mockResolvedValue(0)

    const { registerUser } = await import("../src/modules/auth/auth.service")
    const result = await registerUser("admin@test.com", "password123")

    expect(mockInsertUser).toHaveBeenCalledWith(expect.objectContaining({ role: "master" }))
    expect(result).toBeDefined()
  })

  it("registers subsequent users as regular user role", async () => {
    mockGetUserByEmail.mockResolvedValue(null)
    mockGetUserCount.mockResolvedValue(1)

    const { registerUser } = await import("../src/modules/auth/auth.service")
    await registerUser("user@test.com", "password123")

    expect(mockInsertUser).toHaveBeenCalledWith(expect.objectContaining({ role: "user" }))
  })

  it("throws when email already exists", async () => {
    mockGetUserByEmail.mockResolvedValue({
      id: "existing-1",
      email: "taken@test.com",
      role: "user",
    })

    const { registerUser } = await import("../src/modules/auth/auth.service")

    await expect(registerUser("taken@test.com", "password123")).rejects.toThrow(
      "Email already in use",
    )
  })

  it("throws when user not found during login", async () => {
    mockGetUserByEmail.mockResolvedValue(null)

    const { loginUser } = await import("../src/modules/auth/auth.service")

    await expect(loginUser("noone@test.com", "pass")).rejects.toThrow("Invalid credentials")
  })

  it("throws when password is incorrect during login", async () => {
    mockGetUserByEmail.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      passwordHash: "wrong-hash",
      role: "user",
      isActive: true,
    })

    const { verify } = await import("@node-rs/argon2")
    ;(verify as ReturnType<typeof mock>).mockResolvedValue(false)

    const { loginUser } = await import("../src/modules/auth/auth.service")

    await expect(loginUser("test@test.com", "wrongpass")).rejects.toThrow("Invalid credentials")
  })
})
