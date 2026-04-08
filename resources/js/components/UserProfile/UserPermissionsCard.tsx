import React, { useState } from "react";
import api from "../../services/api"; // adjust the path

export default function UserPermissionsCard({ user, permissions, setUser }) {
  const [loadingIds, setLoadingIds] = useState<number[]>([]); // track loading per permission

  const handlePermissionToggle = async (permissionId: number) => {
    if (!user) return;

    const isAlreadyAssigned = user.permissions?.some((p) => p.id === permissionId);

    // Optimistically update UI
    const updatedPermissions = isAlreadyAssigned
      ? user.permissions.filter((p) => p.id !== permissionId)
      : [...(user.permissions || []), permissions.find((p) => p.id === permissionId)!];

    setUser({ ...user, permissions: updatedPermissions });

    // Mark this permission as loading
    setLoadingIds((prev) => [...prev, permissionId]);

    try {
      await api.post("/toggle-permission", {
        user_id: user.id,
        permission_id: permissionId,
      });
      // Optionally: update with server response to stay in sync
      // const response = await api.post(...);
      // setUser({ ...user, permissions: response.data.permissions });
    } catch (error) {
      console.error("Failed to update permission:", error);
      alert("Failed to update permission");

      // Revert UI if API fails
      setUser(user);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== permissionId));
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
        User Permissions
      </h4>

      {permissions && permissions.length > 0 ? (
        <ul className="space-y-2">
          {permissions.map((permission) => {
            const isChecked = user?.permissions?.some((p) => p?.id === permission?.id) || false;
            const isLoading = loadingIds.includes(permission.id);

            return (
              <li key={permission.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handlePermissionToggle(permission.id)}
                  disabled={isLoading} // disable while loading
                  className="w-4 h-4 accent-teal-700 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-teal-700 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-teal-700"
                />

                <label className="text-sm text-gray-700 dark:text-gray-400 flex-1">
                  { isLoading ? (
                    <span className="animate-pulse bg-gray-300 dark:bg-gray-600">Please wait...</span>
                  ) : (
                    permission.name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No permissions assigned.
        </p>
      )}
    </div>
  );
}