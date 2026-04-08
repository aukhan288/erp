import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Sidebar() {
    const user = useSelector(state => state.auth.user);

    const menu = [
        { name: "Dashboard", path: "/dashboard", roles: ["admin","manager","sales"] },
    ];

    return (
        <nav className="p-4 border-r h-screen w-64">
            {menu.filter(i => user?.roles.some(r => i.roles.includes(r.name)))
                 .map(i => <Link key={i.path} to={i.path} className="block mb-2">{i.name}</Link>)}
        </nav>
    );
}