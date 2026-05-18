import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import  Badge  from '../components/ui/badge/Badge';
import  Milestones from "../components/Milestones";
import  Tasks from "../components/Tasks";
import  ProjectActivities from "../components/ProjectActivities";
import  Sprints from "../components/Sprints";
import moment from 'moment';
import TasksByStatusChart from '../components/charts/TasksByStatusChart';
import BackLog from '../components/BackLog';
import SprintTeamManager from '../components/SprintTeamManager';
import SprintPlaining from '../components/SprintPlaining';
import { useSelector } from 'react-redux';



export default function ProjectDetails() {
  const user = useSelector((state) => state.auth.user);
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [backlogRefreshKey, setBacklogRefreshKey] = useState(0);
  const [sprintsRefreshKey, setSprintsRefreshKey] = useState(0);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("Plaining");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dropboxUrl, setDropboxUrl] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/project/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error('Failed to fetch project', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

const downloadArtifacts = async () => {

 const url = project?.artifacts_url;

  if (!url) return;

  // Check if it's an external URL (Dropbox, Google Drive, etc.)
  const isExternalUrl = /^https?:\/\//.test(url);

  if (isExternalUrl) {
    window.open(url, "_blank");
    return;
  }
  try {
    const response = await api.get(`download-artifacts/${project?.id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "artifact.pdf"); // or dynamic name

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;


  return (
    <div className="">
          {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-teal-700">
            {project.name}
          </h2>
          <Badge size="sm" color="success" variant="light" >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">

  <div className="relative inline-flex items-center ">

    {/* Hidden checkbox controls dropdown */}
    <input type="checkbox" id="artifactMenu" className="peer hidden" />

    {/* Button */}
    <label
      htmlFor="artifactMenu"
      className="cursor-pointer rounded border  border-cyan-400 bg-white text-cyan-400 py-1.5   text-sm px-4  font-medium hover:bg-cyan-400 hover:text-white transition-colors duration-200"
    >
      Artifacts ▾
    </label>

    {/* Dropdown */}
    <div className="
      absolute right-0 top-9 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20
      hidden peer-checked:block overflow-hidden
    ">

      {/* Upload */}
      <button
        onClick={() => setUploadModal(true)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      >
        Upload
      </button>

      {/* Download */}
      {!!project?.artifacts_url && (
        <button
          onClick={downloadArtifacts}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
        >
          { /^https?:\/\//.test(project?.artifacts_url) ? 'Open Link' : 'Download' } 
        </button>
      )}

    </div>

  </div>

    
        <button className="rounded border border-teal-700 bg-white text-teal-700 py-1 px-4 font-medium hover:bg-teal-700 hover:text-white transition-colors duration-200">
          Edit Project
        </button>
          <button className="rounded border border-rose-900 bg-white text-rose-900 py-1 px-4 font-medium hover:bg-rose-900 hover:text-white transition-colors duration-200">Archive</button>
        </div>
      </div>
        {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
           {/* Left Column */}
        <div className="col-span-12 xl:col-span-6 space-y-6">
          {/* Project Overview */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden p-4">
            <h3 className="mb-4 text-xl font-semibold text-black ">Project Overview</h3>
            <p className="font-medium text-sm mb-2 text-black">Description</p>
            
            <p className="text-body leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Milestones */}
          <div className="">
            <Milestones projectId={project?.id} onMilestoneAdded={() => setActivityRefreshKey((prev) => prev + 1)} />
            <hr className="mt-4 mb-4 border border-gray-200" />
            <Tasks projectId={project?.id} tasksRefreshKey={tasksRefreshKey}  />
          </div>
        </div>
<div className="col-span-12 xl:col-span-6">
  <div className="grid grid-cols-12 gap-6">

    {/* Half width */}
    <div className="col-span-12 xl:col-span-6">

      <TasksByStatusChart projectId={project?.id} />
         <div className="rounded-lg border mt-2 border-gray-200 bg-white overflow-hidden p-2">
            <h3 className="mb-4 font-semibold text-black">Team Members</h3>
           <div className="space-y-4">
  {project.team?.length > 0 ? (
    project.team.map((member) => (
      <div key={member.id} className="flex items-center gap-3">
        <img
          src={member.avatar_url} // Fallback avatar
          alt={member.firstname + " " + member.lastname}
          className="h-8 w-8 rounded-full"
        />
        <div className="text-xs font-medium text-black">
          {member.firstname + " " + member.lastname}
        </div>
      </div>
    ))
  ) : (
    <p className="text-sm text-gray-500">
      No team members found.
    </p>
  )}
</div>

          </div>
    </div>
     <div className="col-span-12 xl:col-span-6">
      <ProjectActivities projectId={project?.id} refreshKey={activityRefreshKey} />
      </div>

    {/* Full width */}
    <div className="col-span-12">
      <Sprints 
        projectId={project?.id} 
        sprintRefreshKey={sprintsRefreshKey} 
      />
    </div>

  </div>
</div>

      </div>
       {user?.roles?.some(role => role.name === "admin") && (
       <div className="w-full border border-gray-200 mt-2 mb-5">
        <h2 className="px-2 py-2 text-lg font-bold text-teal-700 dark:text-white">Sprint Planning</h2>
      {/* Tabs Header */}
      <ul className="flex flex-wrap   bg-white rounded-md border-b border-gray-200">
        
        <li className="text-center pr-2">
          <button
            onClick={() => setActiveTab("Plaining")}
            className={`w-full py-2 px-2 text-sm flex items-center justify-center ${
              activeTab === "Plaining"
                ? "bg-teal-700 font-semibold text-white"
                : "bg-white text-teal-700"
            }`}
          >
            Planning
          </button>
        </li>

        <li className="text-center pr-2">
          <button
            onClick={() => setActiveTab("Team")}
            className={`w-full py-2 px-2 text-sm flex items-center justify-center ${
              activeTab === "Team"
              ? "bg-teal-700 font-semibold text-white"
              : "bg-white text-teal-700"
            }`}
          >
            Team
          </button>
        </li>

        <li className="text-center pr-2">
          <button
            onClick={() => setActiveTab("Backlogs")}
            className={`w-full py-2 px-2 text-sm flex items-center justify-center ${
              activeTab === "Backlogs"
              ? "bg-teal-700 font-semibold text-white"
              : "bg-white text-teal-700"
            }`}
          >
            Backlogs
          </button>
        </li>
      </ul>

      {/* Tabs Content */}
      <div className="p-4 mt-2">
        {activeTab === "Backlogs" && 
        <BackLog projectId={project?.id}
           onTaskDrag={() => {
            setBacklogRefreshKey(prev => prev + 1);
            setSprintsRefreshKey(prev => prev + 1);
            setTasksRefreshKey(prev => prev + 1);
          }}
          refreshKey={backlogRefreshKey}
        />
     
        }
        {activeTab === "Team" && <SprintTeamManager projectId={project?.id} />}
        {activeTab === "Plaining" &&    <SprintPlaining projectId={project?.id}
           onTaskDrag={() => {
            setBacklogRefreshKey(prev => prev + 1);
            setSprintsRefreshKey(prev => prev + 1);
            setTasksRefreshKey(prev => prev + 1);
          }}
          refreshKey={backlogRefreshKey}
        />}
      </div>
    </div>
      )}

      {uploadModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

    {/* Modal Box */}
    <div className="bg-white w-[400px] rounded-lg shadow-lg p-5 relative">

      {/* Close Button */}
      <button
        onClick={() => setUploadModal(false)}
        className="absolute top-2 right-3 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h2 className="text-lg font-semibold">Upload Artifact</h2>

      {/* Upload Form */}


<form
  onSubmit={async (e) => {
    e.preventDefault();

    // validation
    if (!selectedFile && !dropboxUrl) {
      alert("Please upload ZIP or provide Dropbox URL");
      return;
    }

    if (selectedFile && dropboxUrl) {
      alert("Please use only one option: ZIP or Dropbox URL");
      return;
    }

    const formData = new FormData();

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    if (dropboxUrl) {
      formData.append("dropbox_url", dropboxUrl);
    }

    try {
      await api.post(`upload-artifacts/${project?.id}`, formData);

      setUploadModal(false);
      setSelectedFile(null);
      setDropboxUrl("");

    } catch (error) {
      console.error(error);
    }
  }}
>
  <input
  type="file"
  accept=".zip,application/zip"
  ref={fileInputRef}
  className="w-full border p-2 rounded mb-3"
  onChange={(e) => {
    setSelectedFile(e.target.files[0]);
    setDropboxUrl(""); // clear URL if file selected
  }}
/>

<p className="text-center text-gray-500 text-sm mb-2">OR</p>

{/* Dropbox URL */}
<input
  type="url"
  placeholder="Paste Dropbox URL"
  className="w-full border p-2 rounded mb-4"
  value={dropboxUrl}
  onChange={(e) => {
    setDropboxUrl(e.target.value);
    setSelectedFile(null); // clear file if URL used
    fileInputRef.current.value = "";
  }}
/>

<button
  type="submit"
  className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800"
>
  Upload
</button>

</form>

    </div>

  </div>
)}
    </div>
  );

}