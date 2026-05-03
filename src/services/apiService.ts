import axios from 'axios';

const API_URL = '/api';

export const getBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const getBookByISBN = (isbn: string) => {
  return axios.get(`${API_URL}/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error fetching book with ISBN ${isbn}:`, error);
      throw error;
    });
};

export const getBooksByAuthor = async (author: string) => {
  try {
    const response = await axios.get(`${API_URL}/author/${author}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    throw error;
  }
};

export const getBooksByTitle = (title: string) => {
  return axios.get(`${API_URL}/title/${title}`)
    .then(response => response.data)
    .catch(error => {
      console.error(`Error fetching books by title ${title}:`, error);
      throw error;
    });
};
