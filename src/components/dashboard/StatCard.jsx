// const StatCard = ({ title, value, growth }) => {

//     return (

//         <div className="bg-white/70 backdrop-blur-xl rounded-xl p-5 shadow-md">
//             <p className="text-sm text-gray-500">{title}</p>
//             <h3 className="text-2xl font-bold mt-2">{value}</h3>
//             <p className={`text-sm mt-1 ${growth > 0 ? "text-green-500" : "text-red-500"}`}>
//                 {growth > 0 ? `+${growth}%` : `${growth}%`}
//             </p>
//         </div>
//     );
// }

// export default StatCard


// StatCard.jsx
const StatCard = ({ title, value, growth, icon, trend = "positive" }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
                <div className={`flex items-center text-sm ${trend === "positive" ? "text-green-600" : "text-red-600"}`}>
                    <span className="mr-1">{trend === "positive" ? "+" : "-"}{growth}%</span>
                    <span>{trend === "positive" ? "↑" : "↓"}</span>
                </div>
            </div>
            <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{title}</div>
            </div>
        </div>
    );
};

export default StatCard;