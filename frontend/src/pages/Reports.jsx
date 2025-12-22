import { useState } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const { isAuthenticated } = useAuth();
    const [selectedReport, setSelectedReport] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportTitle, setReportTitle] = useState('');

    const reports = [
        { id: 'adoption-rates', name: 'Adoption Rates Report', description: 'Overall adoption statistics' },
        { id: 'popular-breeds', name: 'Popular Breeds Report', description: 'Most popular breeds by adoption' },
        { id: 'waiting-times', name: 'Average Waiting Times', description: 'Time from intake to adoption' },
        { id: 'health-status', name: 'Health Status Report', description: 'Health status of all animals' },
        { id: 'shelter-performance', name: 'Shelter Performance', description: 'Adoption rates by shelter' },
        { id: 'follow-ups', name: 'Follow-Up Report', description: 'Adoption follow-up status' }
    ];

    const generateReport = async (reportId) => {
        try {
            setLoading(true);
            const response = await api.get(`/reports/${reportId}`);
            setReportData(response.data.data);
            setReportTitle(response.data.report);
            setSelectedReport(reportId);
        } catch (err) {
            console.error('Report error:', err);
            alert('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDataForDisplay = (data) => {
        if (Array.isArray(data)) {
            return data;
        }
        return [data];
    };

    if (!isAuthenticated) {
        return <div className="text-center py-12">Please log in to view reports</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Reports & Analytics</h1>
                    {reportData && (
                        <button
                            onClick={handlePrint}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg"
                        >
                            🖨️ Print Report
                        </button>
                    )}
                </div>

                {/* Report Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
                            onClick={() => generateReport(report.id)}
                        >
                            <h3 className="text-xl font-bold mb-2">{report.name}</h3>
                            <p className="text-slate-600 text-sm mb-4">{report.description}</p>
                            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">
                                Generate Report
                            </button>
                        </div>
                    ))}
                </div>

                {/* Report Display - Printable Format */}
                {loading && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="text-slate-600">Generating report...</div>
                    </div>
                )}

                {reportData && !loading && (
                    <div className="bg-white rounded-xl shadow-lg p-8 print:shadow-none">
                        {/* Report Header - Hidden when printing except on first page */}
                        <div className="mb-6 print:mb-4 border-b pb-4 print:border-b-2">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">{reportTitle}</h2>
                            <p className="text-slate-600">Generated on: {new Date().toLocaleString()}</p>
                        </div>

                        {/* Report Content */}
                        <div className="overflow-x-auto">
                            {Array.isArray(reportData) ? (
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100 print:bg-gray-200">
                                            {Object.keys(reportData[0] || {}).map((key) => (
                                                <th key={key} className="border border-slate-300 px-4 py-3 text-left font-bold">
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((row, index) => (
                                            <tr key={index} className="border-b print:border-b">
                                                {Object.values(row).map((value, i) => (
                                                    <td key={i} className="border border-slate-300 px-4 py-2">
                                                        {typeof value === 'number' && value % 1 !== 0 
                                                            ? value.toFixed(2) 
                                                            : value}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(reportData).map(([key, value]) => (
                                        <div key={key} className="flex justify-between border-b py-2">
                                            <span className="font-semibold">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                            </span>
                                            <span>
                                                {typeof value === 'number' && value % 1 !== 0 
                                                    ? value.toFixed(2) 
                                                    : value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Report Footer */}
                        <div className="mt-8 pt-4 border-t text-sm text-slate-600 print:mt-4">
                            <p>Pet Adoption System - Database Reports</p>
                            <p>This report contains JOIN queries across multiple tables</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { background: white; }
                    .print\\:shadow-none { box-shadow: none; }
                    .print\\:bg-gray-200 { background-color: #e5e7eb; }
                    .print\\:border-b-2 { border-bottom-width: 2px; }
                    .print\\:mb-4 { margin-bottom: 1rem; }
                    .print\\:mt-4 { margin-top: 1rem; }
                    nav, button:not(.print-button) { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Reports;

