export default function TableLoader({ rows = 10 }) {
  return (
    <table className="w-full">
      <tbody className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            <td className="px-2 py-1">
              <div className="h-10 bg-gray-300 rounded animate-pulse w-full"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}