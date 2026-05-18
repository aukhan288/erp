import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import moment from "moment";

export default function ProjectActivities({ projectId, refreshKey }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef(null);
  const loaderRef = useRef(null);

  const fetchActivities = async (pageNum = 1) => {
    if (loadingMore || (!hasMore && pageNum !== 1)) return;

    pageNum === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const res = await api.get(
        `/project-activities/${projectId}?page=${pageNum}`
      );

      const newData = res.data.data || [];

      setActivities((prev) =>
        pageNum === 1 ? newData : [...prev, ...newData]
      );

      setHasMore(res.data.current_page < res.data.last_page);
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch activities", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // reset on change
  useEffect(() => {
    if (projectId) {
      setActivities([]);
      setPage(1);
      setHasMore(true);
      fetchActivities(1);
    }
  }, [projectId, refreshKey]);

  // lazy loading (FIXED)
  useEffect(() => {
    const root = containerRef.current;
    const target = loaderRef.current;

    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchActivities(page + 1);
        }
      },
      {
        root, // IMPORTANT for inner scroll
        rootMargin: "150px",
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [page, hasMore, loadingMore]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 overflow-hidden">
      <h3 className="mb-3 font-semibold text-teal-700">Activity Log</h3>

      {loading ? (
        <p className="text-gray-500">Loading activities...</p>
      ) : (
        <ul
          ref={containerRef}
          className="space-y-2 text-sm max-h-[400px] overflow-y-auto"
        >
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-100 border-l border-teal-700"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden">
                <img
                  src={a?.user?.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {a?.user?.firstname + " " + a?.user?.lastname}
                </div>

                <div className="text-gray-400 text-xs">
                  {moment(a.created_at).format("Do MMM YYYY, h:mm A")}
                </div>

                <p className="text-gray-700 text-sm mt-1">
                  {a.description}
                </p>
              </div>
            </li>
          ))}

          <div
            ref={loaderRef}
            className="h-10 flex justify-center items-center"
          >
            {loadingMore && (
              <p className="text-gray-500 text-sm">Loading more...</p>
            )}
          </div>
        </ul>
      )}
    </div>
  );
}