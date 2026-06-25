import AdminLayout from '../layouts/AdminLayout';
import AdminResourceManager from '../components/AdminResourceManager';

export default function AdminProjects() {
  return (
    <AdminLayout>
      <AdminResourceManager
        resource="projects"
        title="Manage Projects"
        description="Create portfolio projects with images, tags, and demo links."
      />
    </AdminLayout>
  );
}
