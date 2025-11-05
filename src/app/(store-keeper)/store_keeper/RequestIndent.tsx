import React, { useEffect, useState } from "react";
import { FileSpreadsheet, UploadCloud, Clock, CheckCircle, X, Eye, PlusCircle } from "lucide-react";

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

const RequestIndent: React.FC = () => {
  const [indents, setIndents] = useState<Indent[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState("Storekeeper");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  const handleUploadIndent = async () => {
    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by", uploadedBy);

    try {
      setUploading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/indents/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Indent uploaded successfully!");
        setShowUploadDialog(false);
        setFile(null);
        fetchIndents();
      } else {
        alert("Failed to upload indent.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center text-gray-900">
              <FileSpreadsheet className="w-6 h-6 text-purple-600 mr-3" /> Indent History
            </h2>
            <p className="text-gray-600">View your past indent requests</p>
          </div>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Request Indent
          </button>
        </div>

        <div className="p-6">
          {indents.length === 0 ? (
            <div className="text-center py-10 text-gray-600">No indents found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">File</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Uploaded At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Approved By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indents.map((indent) => (
                  <tr key={indent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <a href={indent.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {indent.file_name}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(indent.uploaded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(indent.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {indent.approved_by || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Indent File</h3>
              <button onClick={() => setShowUploadDialog(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded By</label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 p-5 rounded-lg text-center hover:bg-gray-50">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="indentFile"
                />
                <label htmlFor="indentFile" className="cursor-pointer flex flex-col items-center text-gray-600">
                  <UploadCloud className="w-10 h-10 text-purple-600 mb-2" />
                  {file ? (
                    <span className="font-medium text-gray-800">{file.name}</span>
                  ) : (
                    <span>Select Excel file to upload</span>
                  )}
                </label>
              </div>

              <button
                onClick={handleUploadIndent}
                disabled={uploading}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                {uploading ? "Uploading..." : "Upload Indent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestIndent;
