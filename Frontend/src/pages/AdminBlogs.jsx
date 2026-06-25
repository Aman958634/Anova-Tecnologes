import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminBlogs() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="blogs"
        title="Manage Blogs"
        description="Publish new blog posts, update content, and remove old articles."
      />
    </AdminLayout>
  );
}
