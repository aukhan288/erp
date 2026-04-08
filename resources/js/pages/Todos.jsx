import React, { useState } from 'react';
import TodoTasks from "../components/TodoTasks";
import api from '../services/api';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

export default function Todos() {
      const { user } = useSelector((state) => state.auth);

    return (
         <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-12">
        <div className="flex items-center justify-between gap-4 w-full mb-3">
            <h2 className="text-xl font-bold text-teal-700 dark:text-white">Todos</h2>
        </div>
        <TodoTasks userId={user?.id} />
        </div>
        </div>
    );
}