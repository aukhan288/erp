export default function TableLoader({ rows = 5, columns = 4 }) {
  return (
    <table>
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-2">
              <div className="h-4 bg-gray-700 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
    </table>
  );
}