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
      const formData = new FormData();
      formData.append("approved_by", adminName);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/indents/approve/${indentId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Indent approved successfully!");
        fetchIndents();
      } else {
        alert("Failed to approve indent.");
      }
    } catch (error) {
      console.error("Error approving indent:", error);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center text-gray-900">
              <FileSpreadsheet className="w-6 h-6 text-purple-600 mr-3" /> Indent Approvals
            </h2>
            <p className="text-gray-600">Review and approve indent requests</p>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {indents.length === 0 ? (
            <div className="text-center text-gray-600 py-10">No indent requests found.</div>
          ) : (
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
                    <td className="px-6 py-4 text-sm flex items-center space-x-2">
                      <button
                        onClick={() => openPreview(indent.file_url)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {indent.file_name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{indent.uploaded_by}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(indent.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(indent.status)}</td>
                    <td className="px-6 py-4">
                      {indent.status === "pending" ? (
                        <button
                          onClick={() => handleApprove(indent.id)}
                          className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" /> Approve
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileSpreadsheet className="w-5 h-5 text-purple-600 mr-2" /> Preview Excel File
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Display Excel in iframe (works for .xlsx from Cloudinary / backend URL) */}
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile)}`}
                className="w-full h-full rounded-b-xl"
              />
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
              <a
                href={previewFile}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" /> Download File
              </a>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
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
