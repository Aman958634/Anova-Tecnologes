import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const BlogForm = ({ currentBlog, onSubmit, onClose }) => {
  const [blogData, setBlogData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    imageUrl: null,
    publishedAt: '',
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (currentBlog) {
      setBlogData({
        title: currentBlog.title || '',
        excerpt: currentBlog.excerpt || '',
        content: currentBlog.content || '',
        category: currentBlog.category || '',
        imageUrl: currentBlog.image_url || null,
        publishedAt: currentBlog.published_at ? new Date(currentBlog.published_at).toISOString().split('T')[0] : '',
      });
    } else {
      setBlogData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        imageUrl: null,
        publishedAt: '',
      });
    }
  }, [currentBlog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlogData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in blogData) {
      if (key === 'imageUrl' && imageFile) {
        formData.append('image', imageFile);
      } else if (key !== 'imageUrl' && blogData[key] !== null) {
        formData.append(key, blogData[key]);
      }
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{currentBlog ? 'Edit Blog' : 'Create Blog'}</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={blogData.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={blogData.excerpt}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          required
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={blogData.content}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="6"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={blogData.category}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">Image</label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {blogData.imageUrl && !imageFile && (
          <img src={blogData.imageUrl} alt="Current Blog" className="mt-2 h-20 w-20 object-cover" />
        )}
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publishedAt">Published At</label>
        <input
          type="date"
          id="publishedAt"
          name="publishedAt"
          value={blogData.publishedAt}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {currentBlog ? 'Update Blog' : 'Add Blog'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

BlogForm.propTypes = {
  currentBlog: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BlogForm;
