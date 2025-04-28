import axios from 'axios';

export const fetchFriends = async () => {
  const res = await axios.get('/api/friends');
  return res.data;
};

export const fetchIncomingRequests = async () => {
  const res = await axios.get('/api/friends/requests');
  return res.data;
};

export const acceptFriendRequest = async (id) => {
  const res = await axios.put(`/api/friends/request/${id}/accept`);
  return res.data;
};

export const rejectFriendRequest = async (id) => {
  const res = await axios.put(`/api/friends/request/${id}/reject`);
  return res.data;
};
