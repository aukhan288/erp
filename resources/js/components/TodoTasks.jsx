import React, { useState, useEffect } from 'react';
import api from '../services/api';
import moment from 'moment';

export default function TodoTasks({ userId }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/todos/${userId}`);
      setTodos(Array.isArray(res.data.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : []);
      
    } catch (err) {
      console.error('Failed to fetch todos', err);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const markAsDone = async (id) => {
    try {
      await api.post(`/task-completed/${id}`);
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Failed to mark todo as done', err);
    }
  };


  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-4">

      {loading ? (
        <p className="text-gray-500">Loading ...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {todos.map((todo) => (
           <div
  key={todo.id}
  className={`border rounded-lg shadow overflow-hidden flex flex-col h-full
    ${moment(todo?.due_date) < moment() ? 'bg-rose-50 border-rose-200' : 'bg-white border-gray-200'}`}
>
  <h2 className={`text-lg font-semibold pl-2 py-1 
    ${moment(todo?.due_date) < moment() ? 'bg-rose-800 text-white' : 'bg-teal-700 text-white'}`}
  >
    {todo.title}
  </h2>

  <div className="px-4 pt-4 flex flex-col flex-1">
    <div className="space-y-1">
      <p className="text-sm text-gray-700"><span className="font-medium">Project:</span> {todo.project?.name || '-'}</p>
      <p className="text-sm text-gray-700"><span className="font-medium">Milestone:</span> {todo.milestone?.name || '-'}</p>
      <p className="text-sm text-gray-700"><span className="font-medium">Due:</span> {moment(todo.due_date).format('Do MMMM YYYY')}</p>
      <p className="text-sm text-gray-700"><span className="font-medium">Priority:</span> {todo.priority}</p>
      {moment(todo?.due_date) < moment() && (
        <p className="text-sm text-rose-700 font-medium">
          Overdue by {moment().diff(moment(todo.due_date), 'days')} days
        </p>
      )}
    </div>

    {/* Push button to bottom */}
    <button
      onClick={() => markAsDone(todo.id)}
      className="mt-auto w-full text-teal-700 underline py-1 text-right transition"
    >
      Mark as Done
    </button>
  </div>
</div>
          ))}

        </div>
      )}

    </div>
  );
}