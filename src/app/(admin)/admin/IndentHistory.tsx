'use client';

import React, { useEffect, useState } from "react";
import { FileSpreadsheet, CheckCircle, Clock, Eye, ThumbsUp, X, Download } from "lucide-react";

interface Indent {
  id: number;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  status: string;
  uploaded_at: string;
  approved_by?: string;
  approved_at?: string;
}

const IndentsHistory: React.FC = () => {
  const [indents, setIndents] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState<number | null>(null);
  const [approving, setApproving] = useState<number | null>(null);

  const adminName = "Admin Neeraj"; // You can dynamically set this later

  useEffect(() => {
    fetchIndents();
  }, []);

  const fetchIndents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/indents`);
      if (response.ok) {
        const data = await response.json();
        setIndents(data);
      }
    } catch (error) {
      console.error("Error fetching indents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (indentId: number) => {
    try {
      setApproving(indentId);
      const formData = new FormData();
      formData.append("approved_by", adminName);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/indents/approve/${indentId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchIndents();
      } else {
        alert("Failed to approve indent.");
      }
    } catch (error) {
      console.error("Error approving indent:", error);
      alert("An error occurred while approving the indent.");
    } finally {
      setApproving(null);
      setConfirmApprove(null);
    }
  };

  const openPreview = (url: string) => {
    setPreviewFile(url);
    setIsPreviewOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center text-gray-900">
              <FileSpreadsheet className="w-6 h-6 text-purple-600 mr-2 sm:mr-3" /> Indent Approvals
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Review and approve indent requests</p>
          </div>
        </div>

        <div className="p-2 sm:p-6 overflow-hidden">
          {indents.length === 0 ? (
            <div className="text-center text-gray-600 py-10">No indent requests found.</div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {indents.map((indent) => (
                  <div key={indent.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => openPreview(indent.file_url)}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium truncate"
                        >
                          <Eye className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{indent.file_name}</span>
                        </button>
                        <div className="text-sm text-gray-600 mt-1 truncate">{indent.uploaded_by}</div>
                      </div>
                      <div className="ml-2 flex-shrink-0">{getStatusBadge(indent.status)}</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {new Date(indent.uploaded_at).toLocaleString()}
                    </div>
                    {indent.status === "pending" && (
                      <button
                        onClick={() => setConfirmApprove(indent.id)}
                        disabled={approving === indent.id}
                        className={`w-full flex items-center justify-center px-3 py-2 ${
                          approving === indent.id
                            ? 'bg-green-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        } text-white text-sm rounded-lg`}
                      >
                        {approving === indent.id ? (
                          <>
                            <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">File</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Uploaded By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Uploaded At</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indents.map((indent) => (
                      <tr key={indent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm min-w-0">
                          <button
                            onClick={() => openPreview(indent.file_url)}
                            className="text-blue-600 hover:text-blue-800 flex items-center max-w-full"
                          >
                            <Eye className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{indent.file_name}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate">{indent.uploaded_by}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(indent.uploaded_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(indent.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {indent.status === "pending" ? (
                            <button
                              onClick={() => setConfirmApprove(indent.id)}
                              disabled={approving === indent.id}
                              className={`flex items-center px-3 py-1 ${
                                approving === indent.id
                                  ? 'bg-green-400 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700'
                              } text-white text-sm rounded-lg`}
                            >
                              {approving === indent.id ? (
                                <>
                                  <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm Approve Modal */}
      {confirmApprove !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Approval</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve this indent request? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmApprove(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(confirmApprove)}
                disabled={approving === confirmApprove}
                className={`flex items-center px-4 py-2 ${
                  approving === confirmApprove
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white text-sm rounded-lg`}
              >
                {approving === confirmApprove ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" /> Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-0 sm:p-2 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-xl shadow-xl w-full max-w-7xl min-h-screen sm:min-h-0 sm:max-h-[95vh] flex flex-col relative mt-0 sm:mt-4">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-purple-600 mr-2" /> Preview Excel File
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-50">
                {previewFile.endsWith('.xlsx') || previewFile.endsWith('.xls') ? (
                    <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                            previewFile.startsWith('http') ? previewFile : window.location.origin + previewFile
                        )}&embedded=true`}
                        className="w-full h-[calc(100vh-10rem)] sm:h-[calc(95vh-8rem)] min-h-[400px] rounded-none sm:rounded-b-xl"
                        style={{ border: 'none' }}
                        onError={(e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            iframe.parentElement!.innerHTML = `
                                <div class="flex flex-col justify-center items-center h-[calc(100vh-10rem)] sm:h-[calc(95vh-8rem)] min-h-[400px] text-gray-500 p-4 text-center">
                                    <p>Preview failed to load. Please try downloading the file instead.</p>
                                </div>
                            `;
                        }}
                    />
                ) : (
                    <div className="flex flex-col justify-center items-center h-[calc(100vh-10rem)] sm:h-[calc(95vh-8rem)] min-h-[400px] text-gray-500 p-4 text-center">
                        <p>Unable to preview this file format. Click "Download" to view.</p>
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 flex justify-end space-x-2 sm:space-x-3 bg-gray-50 sticky bottom-0">
              <a
                href={previewFile}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download
              </a>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentsHistory;
