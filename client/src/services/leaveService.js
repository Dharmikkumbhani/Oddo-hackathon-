import axios from 'axios';

const API_URL = 'http://localhost:5001/api/leaves';

const getAuthHeader = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
  }
  return {};
};

export const applyLeave = async (leaveData) => {
  const response = await axios.post(API_URL, leaveData, { headers: getAuthHeader() });
  return response.data;
};

export const getMyLeaves = async () => {
  const response = await axios.get(`${API_URL}/my-leaves`, { headers: getAuthHeader() });
  return response.data;
};

export const getAllLeaves = async () => {
  const response = await axios.get(`${API_URL}/all`, { headers: getAuthHeader() });
  return response.data;
};

export const updateLeaveStatus = async (id, statusData) => {
  const response = await axios.put(`${API_URL}/${id}/status`, statusData, { headers: getAuthHeader() });
  return response.data;
};
