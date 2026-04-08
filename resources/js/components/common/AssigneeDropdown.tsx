import { useState } from "react";

export default function AssigneeSelector({ users, selectedId, onChange }) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (id) => {
    onChange(id);
    setModalOpen(false);
    alert(`Assigned to ${id ? users.find(u => u.id === id).name : "Unassigned"}`);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="px-3 py-1 border rounded hover:bg-gray-100"
      >
       <img src="" alt="" /> {selectedId ? users.find(u => u.id === selectedId)?.name : "Assign"}
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-sm p-4">
            <h4 className="text-lg font-semibold mb-3">Select Assignee</h4>
            <div className="max-h-60 overflow-auto">
              {users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u.id)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-teal-700 hover:text-white cursor-pointer rounded"
                >
                  <img src={u.avatar_url} alt={u.name} className="w-6 h-6 rounded-full" />
                  <span>{u.name}</span>
                </div>
              ))}
     
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 rounded border hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}