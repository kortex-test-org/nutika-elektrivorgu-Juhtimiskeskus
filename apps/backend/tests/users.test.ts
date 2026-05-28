import { beforeEach, describe, expect, it, mock } from "bun:test"

const mockGetUserById = mock(() => Promise.resolve(null))
const mockDeleteUser = mock(() => Promise.resolve())
const mockUpdateUser = mock(() => Promise.resolve(null))

mock.module("../src/db/repository/user", () => ({
  getUserById: mockGetUserById,
  deleteUser: mockDeleteUser,
  updateUser: mockUpdateUser,
  getAllUsers: mock(() => Promise.resolve([])),
  insertUser: mock(() => Promise.resolve(null)),
}))

describe("users service", () => {
  beforeEach(() => {
    mockGetUserById.mockClear()
    mockDeleteUser.mockClear()
    mockUpdateUser.mockClear()
  })

  it("removeUser deletes normal user successfully", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-normal",
      username: "normal",
      role: "user",
    })

    const { removeUser } = await import("../src/modules/users/users.service")
    await removeUser("user-normal")

    expect(mockGetUserById).toHaveBeenCalledWith("user-normal")
    expect(mockDeleteUser).toHaveBeenCalledWith("user-normal")
  })

  it("removeUser throws error when trying to delete master user", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-admin",
      username: "admin",
      role: "master",
    })

    const { removeUser } = await import("../src/modules/users/users.service")

    await expect(removeUser("user-admin")).rejects.toThrow(
      "Cannot delete master administrator account",
    )
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it("deactivateUser deactivates normal user successfully", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-normal",
      username: "normal",
      role: "user",
      isActive: true,
    })

    const { deactivateUser } = await import("../src/modules/users/users.service")
    await deactivateUser("user-normal")

    expect(mockGetUserById).toHaveBeenCalledWith("user-normal")
    expect(mockUpdateUser).toHaveBeenCalledWith("user-normal", { isActive: false })
  })

  it("deactivateUser throws error when trying to deactivate master user", async () => {
    mockGetUserById.mockResolvedValue({
      id: "user-admin",
      username: "admin",
      role: "master",
      isActive: true,
    })

    const { deactivateUser } = await import("../src/modules/users/users.service")

    await expect(deactivateUser("user-admin")).rejects.toThrow(
      "Cannot deactivate master administrator account",
    )
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })
})
