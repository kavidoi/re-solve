import axios from 'axios';

export const fetchGroups = async () => {
  const res = await axios.get('/api/groups');
  return res.data;
};
