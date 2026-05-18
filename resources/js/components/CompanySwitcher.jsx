import React from "react";
import api from "../services/api"; // ✅ FIXED (use your configured axios)
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

export default function CompanySwitcher() {

  const { user, loading } = useSelector((state) => state.auth);

  if (loading || !user) return null;

  const companies = user.companies || [];
  const activeCompany = user.active_company || null;

  const openSwitcher = () => {

    if (companies.length === 0) {
      Swal.fire("No companies assigned");
      return;
    }

    Swal.fire({
      title: "Switch Company",
      html: renderCompanyList(),
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Close",
      width: "500px",
      didOpen: () => bindEvents(),
    });
  };

  const renderCompanyList = () => {
    return `
      <div id="company-list">
        ${companies.map(c => `
          <button 
            id="company-${c.id}"
            style="
              width:100%;
              padding:10px;
              margin:5px 0;
              border:1px solid #ddd;
              border-radius:6px;
              text-align:left;
              cursor:pointer;
              ${activeCompany?.id === c.id ? "background:#f3f4f6" : ""}
            "
          >
              🏢 ${c.name}
              ${activeCompany?.id === c.id ? " (Current)" : ""}
          </button>
        `).join("")}
      </div>
    `;
  };

  const bindEvents = () => {
    companies.forEach((c) => {
      const btn = document.getElementById(`company-${c.id}`);
      if (btn) {
        btn.onclick = () => switchCompany(c.id);
      }
    });
  };

  const switchCompany = async (companyId) => {

    Swal.fire({
      title: "Switching...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {

      // ✅ FIXED: NO /api because baseURL already has /api
      await api.post("/companies/switch", {
        company_id: companyId,
      });

      Swal.fire({
        icon: "success",
        title: "Company switched",
        timer: 1000,
        showConfirmButton: false,
      });

      setTimeout(() => window.location.reload(), 800);

    } catch (err) {

      console.log(err.response?.data || err.message);

      Swal.fire({
        icon: "error",
        title: "Failed to switch company",
        text: err.response?.data?.message || "Unauthorized",
      });

    }
  };

  return (
    <button
      onClick={openSwitcher}
      className="px-4 py-2 bg-white border border-gray-200 text-white rounded"
    >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

  <path
    d="M4 8H16C18 8 20 10 20 12"
    stroke="#0d9488"
    stroke-width="2"
    stroke-linecap="round"
  />

  <path
    d="M16 5L20 8L16 11"
    stroke="#0d9488"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  
  <path
    d="M20 16H8C6 16 4 14 4 12"
    stroke="#0d9488"
    stroke-width="2"
    stroke-linecap="round"
  />

  <path
    d="M8 13L4 16L8 19"
    stroke="#0d9488"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
    </button>
  );
}