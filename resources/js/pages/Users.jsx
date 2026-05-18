import React, { useState } from 'react';
import UsersTable from '../components/tables/UsersTable';
import api from '../services/api';
import Swal from 'sweetalert2';
const dayLabels = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usersTableRefreshKey, setUsersTableRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      cnic: '',
      address: '',
      working_days: {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 4,
        sunday: 0
      },
      daily_hours: 8
    });

  
    const [errors, setErrors] = useState({});

 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prev) => {
    // 🟢 Checkbox array (working_days)
    if (name === "working_days") {
      let updatedDays = [...prev.working_days];

      if (checked) {
        // add day
        updatedDays.push(value);
      } else {
        // remove day
        updatedDays = updatedDays.filter((day) => day !== value);
      }

      return {
        ...prev,
        working_days: updatedDays,
      };
    }

    // 🟢 normal inputs
    return {
      ...prev,
      [name]: value,
    };
  });
};

  // Add User Logic
  const addUser = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const response = await api.post('/create-user', formData);

    // SUCCESS ALERT
    Swal.fire({
      icon: 'success',
      title: 'User Created',
      text: 'User has been added successfully!',
      timer: 2000,
      showConfirmButton: false
    });

    setIsModalOpen(false);

    setFormData({
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      cnic: '',
      address: '',
      working_days: {
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 4,
        sunday: 0
      },
      daily_hours: 8
    });

    setUsersTableRefreshKey(prev => prev + 1);

  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      setErrors(error.response.data.errors);

      // VALIDATION ERROR ALERT
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the highlighted fields'
      });

    } else {
      setErrors({ ...errors, general: "Failed to add user" });

      // GENERAL ERROR ALERT
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong while creating user!'
      });

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
          <h2 className="text-xl font-semibold text-gray-800 text-teal-700">
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
        <UsersTable usersTableRefreshKey={usersTableRefreshKey } setUsersTableRefreshKey={setUsersTableRefreshKey} />

        {/* Modal */}
        {isModalOpen && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 bg-opacity-60">
            <div className="bg-white rounded-lg w-[600px] p-6 relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add New User
              </h3>

              {/* Simple form */}
              <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
  <div>
    <label htmlFor="firstname">First Name<span className="text-rose-800">*</span></label>
    <input
      type="text"
      placeholder="First Name"
      name="firstname"
      onChange={handleChange}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
        ${errors.firstname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
    />
    <small className="text-red-500">{errors.firstname}</small>
  </div>

  <div>
        <label htmlFor="firstname">Last Name</label>
    <input
      type="text"
      placeholder="Last Name"
      name="lastname"
      onChange={handleChange}
      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
        ${errors.lastname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
    />
    <small className="text-red-500">{errors.lastname}</small>
  </div>
</div>
    <label htmlFor="firstname">Email<span className="text-rose-800">*</span></label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                <small className="text-red-500">{errors.email}</small>  
                    <label htmlFor="firstname">Mobile Number<span className="text-rose-800">*</span></label>
                <input
                  type="text"                  
                  name="mobile"
                  placeholder="Mobile Number"
                  onChange={handleChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2
    ${errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`}
                />
                  <small className="text-red-500">{errors.mobile}</small>
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
<div className="flex flex-wrap gap-1.5">
  {Object?.keys(formData?.working_days).map((day) => {
    const value = formData.working_days?.[day] ?? 0;

    const updateValue = (newValue) => {
      setFormData((prev) => ({
        ...prev,
        working_days: {
          ...prev.working_days,
          [day]: newValue,
        },
      }));
    };

    return (
      <div
        key={day}
        className="flex items-center border-right gap-1  px-1.5 py-0.5 bg-white"
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={value > 0}
          onChange={(e) => updateValue(e.target.checked ? 8 : 0)}
          className="accent-teal-600 scale-100"
        />

        {/* Day */}
        <span className="text-[14px] mr-4 font-medium  text-gray-700">
          {dayLabels[day] || day}
        </span>

        {/* - */}
        <button
          type="button"
          disabled={value <= 0}
          onClick={() => updateValue(Math.max(0, value - 1))}
          className="w-4 h-4 text-[14px] rounded-full flex items-center justify-center bg-gray-200 text-gray-700 disabled:opacity-40"
        >
          −
        </button>

        {/* value */}
        <span className="w-4 text-center text-[14px] font-semibold text-gray-700 dark:text-gray-200">
          {value}
        </span>

        {/* + */}
        <button
          type="button"
          disabled={value >= 12}
          onClick={() => updateValue(Math.min(12, value + 1))}
          className="w-4 h-4 text-[14px] rounded-full flex items-center justify-center bg-teal-600 text-white disabled:opacity-40"
        >
          +
        </button>

        {/* hrs */}
        <span className="text-[14px] text-gray-400">h</span>
      </div>
    );
  })}
</div>
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