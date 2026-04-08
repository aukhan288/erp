import React from "react";

// Dashboard card items
const cardItems = [
  { id: 1, type: "project", color: "teal", title: "Projects" },
  { id: 2, type: "task", color: "blue", title: "Tasks" },
  { id: 3, type: "milestone", color: "green", title: "Milestones" },
  { id: 4, type: "sprint", color: "yellow", title: "Sprints" },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {cardItems.map((card) => (
        <div
          key={card.id}
          className="col-span-12 md:col-span-6 lg:col-span-3 rounded shadow overflow-hidden"
        >
          {/* Card Header */}
          <div className={`pl-2 font-bold text-lg text-white bg-${card.color}-700`}>
            {card.title}
          </div>

          {/* Card Body */}
          <div className={`p-4 bg-${card.color}-100 text-${card.color}-700`}>
            {/* Empty body */}
          </div>
        </div>
      ))}
    </div>
  );
}