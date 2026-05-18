import React, { useState } from "react";
import DocumentsTable from "../components/tables/DocumentsTable";
import DropzoneComponent from "../components/DropZone";
import api from "../services/api";

export default function Documents() {

  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    title: "",
    document_number: "",
    expiry_type: "fixed",
    expiry_date: "",
    issued_date: "",
  });

  const openModal = (doc = null) => {
    setEditingDocument(doc);

    if (doc) {
      setForm({
        title: doc.title || "",
        document_number: doc.document_number || "",
        expiry_type: doc.expiry_type || "fixed",
        expiry_date: doc.expiry_date || "",
        issued_date: doc.issued_date || "",
      });

      setFiles(doc.file ? [doc.file] : []);
    } else {
      setForm({
        title: "",
        document_number: "",
        expiry_type: "fixed",
        expiry_date: "",
        issued_date: "",
      });

      setFiles([]);
    }

    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {

      const file_id = files.length ? files[0].id : null;

      const payload = {
        ...form,
        file_id
      };

      if (editingDocument) {
        await api.put(`/company-documents/${editingDocument.id}`, payload);
      } else {
        await api.post("/company-documents", payload);
      }

      setModalOpen(false);
      setRefreshKey(prev => prev + 1);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">

        <h2 className="text-xl font-bold text-teal-700">
          Company Documents
        </h2>

        <button
          onClick={() => openModal()}
          className="bg-teal-600 text-white px-3 py-1 rounded"
        >
          New Document
        </button>

      </div>

      {/* Table */}
      <DocumentsTable
        refreshKey={refreshKey}
        setRefreshKey={setRefreshKey}
        openModal={openModal}
      />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white w-full max-w-lg p-6 rounded-lg">

            <h3 className="text-lg font-semibold mb-4">
              {editingDocument ? "Edit Document" : "Add Document"}
            </h3>

            <div className="space-y-3">

              <input
                className="w-full border p-2 rounded"
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />

              <input
                className="w-full border p-2 rounded"
                placeholder="Document Number"
                value={form.document_number}
                onChange={(e) =>
                  setForm({ ...form, document_number: e.target.value })
                }
              />

              <select
                className="w-full border p-2 rounded"
                value={form.expiry_type}
                onChange={(e) =>
                  setForm({ ...form, expiry_type: e.target.value })
                }
              >
                <option value="none">None</option>
                <option value="fixed">Fixed</option>
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>

              <input
                type="date"
                className="w-full border p-2 rounded"
                value={form.issued_date}
                onChange={(e) =>
                  setForm({ ...form, issued_date: e.target.value })
                }
              />

              <input
                type="date"
                className="w-full border p-2 rounded"
                value={form.expiry_date}
                onChange={(e) =>
                  setForm({ ...form, expiry_date: e.target.value })
                }
              />

              {/* Dropzone */}
              <DropzoneComponent
                files={files}
                setFiles={setFiles}
              />

            </div>

            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-3 py-1 bg-teal-600 text-white rounded"
              >
                Save
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}