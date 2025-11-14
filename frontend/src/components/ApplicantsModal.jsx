import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const ApplicantsModal = ({ open, onClose, taskId, onTaskUpdate }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      fetchApplicants();
    }
  }, [open, taskId]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      // Assuming there's an endpoint to get task details including applicants
      const res = await axiosInstance.get(`/tasks/${taskId}`);
      const task = res.data;
      if (task.applicants && task.applicants.length > 0) {
        // Fetch user details for each applicant
        const applicantDetails = await Promise.all(
          task.applicants.map(async (applicant) => {
            try {
              const userRes = await axiosInstance.get(`/auth/user/${applicant._id || applicant}`);
              return userRes.data;
            } catch (err) {
              console.error(`Failed to fetch user ${applicant._id || applicant}:`, err);
              return { _id: applicant._id || applicant, name: 'Unknown User', email: 'N/A' };
            }
          })
        );
        setApplicants(applicantDetails);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
      toast.error('Failed to load applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const acceptApplicant = async (applicantId) => {
    try {
      await axiosInstance.patch(`/tasks/${taskId}/accept-applicant`, { applicantId });
      toast.success('Applicant accepted successfully!');
      onTaskUpdate(); // Refresh tasks
      onClose();
    } catch (err) {
      console.error('Error accepting applicant:', err);
      toast.error('Failed to accept applicant');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Applicants for Task</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading applicants...</p>
            </div>
          ) : applicants.length === 0 ? (
            <p className="text-gray-600 text-center py-4">No applicants yet.</p>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div key={applicant._id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={applicant.profilePicture || '/favicon.ico'}
                      alt={applicant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{applicant.name}</h3>
                      <p className="text-sm text-gray-600">{applicant.email}</p>
                    </div>
                  </div>
                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Skills:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {applicant.skills.map((skill, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => acceptApplicant(applicant._id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                  >
                    Accept Applicant
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsModal;
