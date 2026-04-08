import React, { useEffect, useState } from 'react';
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

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [backlogRefreshKey, setBacklogRefreshKey] = useState(0);
  const [sprintsRefreshKey, setSprintsRefreshKey] = useState(0);
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);

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

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found.</p>;


  return (
    <div className="">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-teal-700 dark:text-white">
            {project.name}
          </h2>
          <Badge size="sm" color="success" variant="light" >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
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
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-4">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Project Overview</h3>
            <p className="font-medium text-sm mb-2 text-black dark:text-white">Description</p>
            
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

        {/* Middle Column */}
        <div className="col-span-12 md:col-span-6 xl:col-span-3 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-2">
            <strong className="text-teal-700 dark:text-teal-700">Duration</strong>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-medium uppercase">Start Date</label>
                <div className="flex items-center justify-between border rounded p-1 dark:border-gray-200">
                  <span className="text-[10px]">{moment(project?.start_date).format('DD MMM YYYY') || 'N/A'}</span>
                  <span>📅</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-medium uppercase">End Date</label>
                <div className="flex items-center justify-between border rounded p-1 dark:border-strokedark">
                  <span className="text-[10px]">{moment(project?.end_date).format('DD MMM YYYY') || 'N/A'}</span>
                  <span>📅</span>
                </div>
              </div>
            </div>
          </div>
          <TasksByStatusChart projectId={project?.id}  />
          {/* Team Members */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-2">
            <h3 className="mb-4 font-semibold text-black dark:text-white">Team Members</h3>
           <div className="space-y-4">
  {project.team?.length > 0 ? (
    project.team.map((member) => (
      <div key={member.id} className="flex items-center gap-3">
        <img
          src={member.avatar_url} // Fallback avatar
          alt={member.name}
          className="h-8 w-8 rounded-full"
        />
        <div className="text-xs font-medium text-black dark:text-white">
          {member.name}
        </div>
      </div>
    ))
  ) : (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      No team members found.
    </p>
  )}
</div>

          </div>
          <Sprints projectId={project?.id} sprintRefreshKey={sprintsRefreshKey}  />
        </div>

        {/* Right Column */}
        <div className="col-span-12 md:col-span-6 xl:col-span-3 space-y-6">
          <ProjectActivities projectId={project?.id} refreshKey={activityRefreshKey} />
   

   

          {/* Progress Card */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-2">
            <div className="h-2 w-full rounded-full bg-stroke dark:bg-strokedark mb-4">
              <div className="h-full w-0 rounded-full bg-primary"></div>
            </div>
            <p className="text-sm font-semibold text-black dark:text-white">Progress: 0%</p>
            <p className="text-xs text-body">Key dependencies in Windows met.</p>
          </div>
        </div>

      </div>
      <div className="mt-6">
        <BackLog projectId={project?.id}
           onTaskDrag={() => {
            setBacklogRefreshKey(prev => prev + 1);
            setSprintsRefreshKey(prev => prev + 1);
            setTasksRefreshKey(prev => prev + 1);
          }}
          refreshKey={backlogRefreshKey}
        />
      </div>
    </div>
  );

}