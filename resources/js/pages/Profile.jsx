import React, { useState, useEffect } from "react";
import  UserInfoCard  from "../components/UserProfile/UserInfoCard";
import  UserMetaCard from "../components/UserProfile/UserMetaCard"
import  UserPermissionsCard from "../components/UserProfile/UserPermissionsCard"
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/profile/${id}`); // Adjust endpoint as needed
        
        setProfile(response?.data);
        setPermissions(response.data.permissions || []); // Assuming permissions are part of the user data
        
        setCompanies(response?.data?.companies || []); // Assuming permissions are part of the user data
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };

    fetchUser();
  }, [id]);

 if (!profile) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-teal-700">Profile</h1>

      <UserMetaCard profile={profile}  />
      <div className="clearfix my-6 border-t border-gray-200 dark:border-gray-700" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left section: 8 columns */}
        <div className="lg:col-span-8"> 
          <UserInfoCard profile={profile} />
        </div>

        {/* Right section: 3 columns */}
        <div className="lg:col-span-4">
          <UserPermissionsCard profile={profile} permissions = {permissions} setProfile={setProfile} companies={companies} />
        </div>
      </div>


      
      <div className="clearfix my-6 border-t border-gray-200 dark:border-gray-700" />
      
    
    </div>
  );
}