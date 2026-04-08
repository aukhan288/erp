import React, { useState } from 'react';
import UsersTable from '../components/tables/UsersTable';
import api from '../services/api';

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      mobile: '',
      role: '',
      cnic: '',
      address: ''
    });

  
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Add User Logic
  const addUser = async (e) => {
  e.preventDefault(); // Prevent page refresh
  setIsSubmitting(true);

  try {
    // 1. Make API POST request to add a user
    const response = await api.post('/create-user', formData); 
    // '/users' should match your Laravel API route

    // 2. SUCCESS LOGIC:
    setIsModalOpen(false); // Close modal
    setFormData({ name: '', email: '', mobile: '', role: '', cnic: '', address: '' }); // Reset form
    alert("User added successfully!");

    // 3. Optional: trigger table refresh
    // fetchUsers();  // if you have a function to reload your table

  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      // Laravel validation errors
      setErrors(error.response.data.errors);
    } else {
      // Generic error
      setErrors({ ...errors, general: "Failed to add user" });
      console.error("Failed to add user", error);
    }
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">

        {/* Header and New User button */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-teal-700">
            Users
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 flex items-center hover:bg-teal-700 text-white py-1 px-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New User
          </button>
        </div>

        {/* Users table */}
        <UsersTable />

        {/* Modal */}
        {isModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-60">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-96 p-6 relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Add New User
              </h3>

              {/* Simple form */}
              <form className="space-y-4">
          <input
  type="text"
  placeholder="Name"
  name="name"
  onChange={handleChange}
  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
/>
<small className="text-red-500">{errors.name}</small>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                <small className="text-red-500">{errors.email}</small>  
                <input
                  type="text"                  
                  name="mobile"
                  placeholder="Mobile Number"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                  <small className="text-red-500">{errors.mobile}</small>
                <select
                  onChange={handleChange}
                  name="role"
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.role ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                  <small className="text-red-500">{errors.role}</small>
                 <input
                  type="text"
                  name="cnic"
                  placeholder="CNIC Number"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.cnic ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                  <small className="text-red-500">{errors.cnic}</small>
                   <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                  <small className="text-red-500">{errors.address}</small>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
                    onClick={addUser}
                  >
                   {isSubmitting ? "Saving..." : "Save User"}
                  </button>
                </div>
              </form>

              {/* Close button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}