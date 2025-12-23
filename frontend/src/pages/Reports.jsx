import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [selectedReport, setSelectedReport] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportTitle, setReportTitle] = useState('');
    const [reportHistory, setReportHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const reports = [
        { 
            id: 'adoption-rates', 
            name: 'Adoption Rates', 
            description: 'Overall adoption statistics and success rates',
            icon: '📊',
            color: 'from-blue-500 to-blue-600'
        },
        { 
            id: 'popular-breeds', 
            name: 'Popular Breeds', 
            description: 'Most popular breeds by adoption count',
            icon: '⭐',
            color: 'from-yellow-500 to-orange-500'
        },
        { 
            id: 'waiting-times', 
            name: 'Waiting Times', 
            description: 'Average time from intake to adoption',
            icon: '⏱️',
            color: 'from-green-500 to-emerald-600'
        },
        { 
            id: 'health-status', 
            name: 'Health Status', 
            description: 'Health status overview of all animals',
            icon: '🏥',
            color: 'from-red-500 to-pink-600'
        },
        { 
            id: 'shelter-performance', 
            name: 'Shelter Performance', 
            description: 'Adoption rates and statistics by shelter',
            icon: '🏢',
            color: 'from-purple-500 to-indigo-600'
        },
        { 
            id: 'follow-ups', 
            name: 'Follow-Ups', 
            description: 'Adoption follow-up status and records',
            icon: '📋',
            color: 'from-teal-500 to-cyan-600'
        }
    ];

    // Load report history from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('reportHistory');
        if (stored) {
            try {
                setReportHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Error loading report history:', e);
            }
        }
    }, []);

    const generateReport = async (reportId) => {
        try {
            setLoading(true);
            setReportData(null);
            const response = await api.get(`/reports/${reportId}`);
            const reportName = reports.find(r => r.id === reportId)?.name || reportId;
            setReportData(response.data.data);
            setReportTitle(response.data.report);
            setSelectedReport(reportId);

            // Save to history
            const historyEntry = {
                id: Date.now(),
                reportId,
                reportName,
                reportTitle: response.data.report,
                generatedAt: new Date().toISOString(),
                dataCount: Array.isArray(response.data.data) ? response.data.data.length : Object.keys(response.data.data || {}).length
            };

            const updatedHistory = [historyEntry, ...reportHistory].slice(0, 50); // Keep last 50 reports
            setReportHistory(updatedHistory);
            localStorage.setItem('reportHistory', JSON.stringify(updatedHistory));
        } catch (err) {
            console.error('Report error:', err);
            alert('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    const formatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'number') {
            return value % 1 !== 0 ? value.toFixed(2) : value;
        }
        return value;
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">Please log in to view reports</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">This page is only available for administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-4 mb-3">
                        <h1 className="text-5xl font-bold text-slate-800">Reports & Analytics</h1>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            History ({reportHistory.length})
                        </button>
                    </div>
                    <p className="text-slate-600 text-lg">Comprehensive insights into your pet adoption system</p>
                </div>

                {/* Report History Panel */}
                {showHistory && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-slate-800">Report History</h2>
                            <button
                                onClick={() => {
                                    if (confirm('Clear all report history?')) {
                                        setReportHistory([]);
                                        localStorage.removeItem('reportHistory');
                                    }
                                }}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                                Clear History
                            </button>
                        </div>
                        {reportHistory.length === 0 ? (
                            <p className="text-slate-600 text-center py-8">No report history yet. Generate reports to see them here.</p>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {reportHistory.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                        onClick={() => {
                                            generateReport(entry.reportId);
                                            setShowHistory(false);
                                        }}
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-800">{entry.reportName}</div>
                                            <div className="text-sm text-slate-600">
                                                {new Date(entry.generatedAt).toLocaleString()} • {entry.dataCount} {entry.dataCount === 1 ? 'record' : 'records'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Regenerate this report
                                                generateReport(entry.reportId);
                                                setShowHistory(false);
                                            }}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Report Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className={`bg-gradient-to-br ${report.color} rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 ${
                                selectedReport === report.id ? 'border-white ring-4 ring-white/50' : 'border-transparent'
                            }`}
                            onClick={() => generateReport(report.id)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">{report.icon}</div>
                                {selectedReport === report.id && (
                                    <div className="bg-white/20 rounded-full p-2">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{report.name}</h3>
                            <p className="text-white/90 text-sm mb-4">{report.description}</p>
                            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg transition-colors backdrop-blur-sm">
                                {selectedReport === report.id ? 'Viewing...' : 'Generate Report'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-slate-600 text-lg">Generating report...</div>
                    </div>
                )}

                {/* Report Display */}
                {reportData && !loading && (
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                        {/* Report Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{reportTitle}</h2>
                                <p className="text-blue-100">Generated on {new Date().toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="p-8">
                            {Array.isArray(reportData) && reportData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                                                {Object.keys(reportData[0] || {}).map((key) => (
                                                    <th 
                                                        key={key} 
                                                        className="border border-slate-300 px-6 py-4 text-left font-bold text-slate-700 uppercase text-sm"
                                                    >
                                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((row, index) => (
                                                <tr 
                                                    key={index} 
                                                    className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${
                                                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                                    }`}
                                                >
                                                    {Object.values(row).map((value, i) => (
                                                        <td key={i} className="border border-slate-200 px-6 py-4 text-slate-700">
                                                            <span className="font-medium">{formatValue(value)}</span>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : Array.isArray(reportData) && reportData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-slate-600 text-lg">No data available for this report</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.entries(reportData).map(([key, value]) => (
                                        <div 
                                            key={key} 
                                            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200"
                                        >
                                            <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                                            </div>
                                            <div className="text-3xl font-bold text-slate-800">
                                                {formatValue(value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!reportData && !loading && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Select a Report</h3>
                        <p className="text-slate-600">Choose a report from above to view detailed analytics</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
