import React, { useState, useEffect } from "react";
import ProjectsTable from "../components/tables/ProjectsTable";
import api from "../services/api";

export default function Projects() {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status_id: 1,
    start_date: "",
    end_date: "",
    customer_id: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to load customers", error);
    }
  };

  fetchCustomers();
}, []);
  const addProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      await api.post("/create-project", formData);

      alert("Project added successfully!");
      setRefreshKey(prev => prev + 1)

      setFormData({
        name: "",
        description: "",
        status_id: 1,
        start_date: "",
        end_date: "",
        customer_id: "",
      });

      setIsModalOpen(false);

    } catch (err) {

      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: "Failed to add project" });
        console.error(err);
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">

      <div className="col-span-12 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between w-full">

          <h2 className="text-xl font-semibold text-teal-700">
            Projects
          </h2>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white py-1 px-3 rounded"
          >
            + New Project
          </button>

        </div>

        {/* Table */}
        <ProjectsTable refreshKey={refreshKey} setRefreshKy={setRefreshKey} />

        {/* Modal */}
        {isModalOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

            <div className="bg-white dark:bg-gray-800 rounded-lg w-[420px] p-6 relative">

              <h3 className="text-lg font-semibold mb-4">
                Create Project
              </h3>

              <form onSubmit={addProject} className="space-y-4">

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full border rounded px-3 py-2 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  <small className="text-red-500">{errors.name}</small>
                </div>


                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                  />
                </div>


             


                {/* Dates */}
                <div className="flex gap-2">

                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
                    />
                  </div>

                </div>


               {/* Customer */}
{/* <div>
  <label className="block text-sm font-medium mb-1">
    Customer
  </label>

  <select
    name="customer_id"
    value={formData.customer_id}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 border-gray-300 focus:ring-teal-500"
  >
    <option value="">Select Customer (Optional)</option>

    {customers?.map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.name}
      </option>
    ))}
  </select>
</div> */}

                {/* Buttons */}
                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>

                </div>

              </form>

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-3 text-gray-500"
              >
                ×
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}