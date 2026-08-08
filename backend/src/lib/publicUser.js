export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  commune: true,
  role: true,
  createdAt: true,
};

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone ?? "",
    commune: user.commune ?? "",
    role: user.role,
    createdAt: user.createdAt,
  };
}
